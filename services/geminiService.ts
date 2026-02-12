
import { GoogleGenAI } from "@google/genai";
import { FileDocument, Message, Question, GameMode, AgentRole, DigitalTwin, KnowledgeNode, MetaInsight, CognitiveExercise, VideoPlan } from "../types";
import { SYSTEM_INSTRUCTION_BASE, AGENT_PERSONAS } from "../constants";

let runtimeProvider = "";
const getProvider = () => (runtimeProvider || process.env.MODEL_PROVIDER || "google").toLowerCase();

export const setRuntimeProvider = (provider: string | null | undefined) => {
  runtimeProvider = provider?.toLowerCase() || "";
};

// Runtime override so users can set API keys from the UI without rebuilding
let runtimeApiKey = "";
export const setRuntimeApiKey = (key: string | null | undefined) => {
  runtimeApiKey = key?.trim() || "";
  // clear cached client when key changes
  cachedClient = null;
  cachedApiKey = "";
};

const getApiKey = () => runtimeApiKey || process.env.JULES_API_KEY || process.env.GEMINI_API_KEY || process.env.API_KEY || "";
const isGoogleProvider = () => getProvider() === "google" && getApiKey().length > 0;
let runtimeOllama: { baseUrl?: string; model?: string } = {};
export const setRuntimeOllamaConfig = (config: { baseUrl?: string; model?: string }) => {
  runtimeOllama = {
    ...runtimeOllama,
    ...(config.baseUrl ? { baseUrl: config.baseUrl } : {}),
    ...(config.model ? { model: config.model } : {}),
  };
};

const getOllamaConfig = () => ({
  baseUrl: (runtimeOllama.baseUrl || process.env.OLLAMA_BASE_URL || "http://localhost:11434").replace(/\/$/, ""),
  model: runtimeOllama.model || process.env.OLLAMA_MODEL || "qwen2.5:latest",
});

const getJulesBaseUrl = () => (process.env.JULES_BASE_URL || "https://jules.googleapis.com").replace(/\/$/, "");

let cachedClient: GoogleGenAI | null = null;
let cachedApiKey = "";
const getGoogleClient = () => {
  if (!isGoogleProvider()) return null;
  const apiKey = getApiKey();
  if (!cachedClient || cachedApiKey !== apiKey) {
    cachedClient = new GoogleGenAI({ apiKey });
    cachedApiKey = apiKey;
  }
  return cachedClient;
};

interface SendMessageParams {
  history: Message[];
  newMessage: string;
  files: FileDocument[];
  imageAttachment?: string; 
  mode: 'tutor' | 'examiner'; // Legacy param, overriden by agentRole
  agentRole?: AgentRole;
  digitalTwin?: DigitalTwin;
  useThinking?: boolean;
  useSearch?: boolean;
  useFlashLite?: boolean;
  onChunk: (text: string, groundingMetadata?: any) => void;
  signal?: AbortSignal;
}

export const streamChatResponse = async ({
  history,
  newMessage,
  files,
  imageAttachment,
  agentRole = 'COUNCIL', // Default to The Council
  digitalTwin,
  useThinking = false,
  useSearch = false,
  useFlashLite = false,
  onChunk,
  signal
}: SendMessageParams) => {
  // 1. Context Construction
  const contextString = files
    .filter(f => f.status === 'ready')
    .map(f => `--- FILE START: ${f.name} ---\n${f.content}\n--- FILE END ---`)
    .join("\n\n");

  // 2. Twin Injection
  let twinContext = "";
  if (digitalTwin) {
    twinContext = `
      USER DIGITAL TWIN PROFILE:
      - Weaknesses: ${digitalTwin.weaknesses.join(", ")}
      - Recent Mood: ${digitalTwin.recentMood}
      - Exam Skills: Precision (${digitalTwin.examSkills.precision}/100), Time Mgmt (${digitalTwin.examSkills.timeManagement}/100).
      
      ADAPTATION INSTRUCTION:
      - If the user has low precision, emphasize specific terminology.
      - If the user is stressed (mood), be more encouraging (unless you are the Examiner).
    `;
  }

  // 3. Agent Persona Selection
  const persona = AGENT_PERSONAS[agentRole] || AGENT_PERSONAS.COUNCIL;
  
  // 4. Thinking / Flash Logic
  let featureInstruction = "";
  if (useThinking) featureInstruction += "\n\nUse your thinking capabilities to reason deeply before answering.";
  if (useFlashLite) featureInstruction += "\n\nProvide a concise and immediate response.";

  const systemPrompt = `
    ${SYSTEM_INSTRUCTION_BASE}
    
    CURRENT AGENT MODE:
    ${persona}

    ${twinContext}
    ${featureInstruction}

    AVAILABLE SOURCE MATERIALS:
    ${contextString.length > 0 ? contextString : "No files uploaded yet. Rely on general knowledge (or Google Search if enabled)."}
  `;

  if (getProvider() === 'ollama') {
    return streamWithOllama({
      history,
      newMessage,
      systemPrompt,
      onChunk,
      signal
    });
  }

  const aiClient = getGoogleClient();
  if (!aiClient) {
    onChunk("\n[System Error: AI provider not configured]");
    return;
  }

  // 5. Prompt Construction
  const contents = history.map(msg => ({
    role: msg.role,
    parts: [{ text: msg.text }]
  }));

  const newParts: any[] = [{ text: newMessage }];
  if (imageAttachment) {
    const mimeType = imageAttachment.startsWith('data:image/png') ? 'image/png' : 'image/jpeg';
    const cleanBase64 = imageAttachment.split(',')[1];
    newParts.push({ inlineData: { mimeType, data: cleanBase64 } });
  }

  const fullPromptParts = [
      { role: 'user', parts: [{ text: `SYSTEM INSTRUCTION:\n${systemPrompt}` }] },
      ...contents,
      { role: 'user', parts: newParts }
  ];

  // 6. Model Config
  let modelName = 'gemini-3-flash-preview';
  if (useFlashLite) modelName = 'gemini-flash-lite-latest';

  const tools: any[] = [];
  if (useSearch) tools.push({ googleSearch: {} });

  const config: any = {
    temperature: agentRole === 'EXAMINER' ? 0.2 : 0.7,
    tools: tools.length > 0 ? tools : undefined,
  };

  if (useThinking && !useFlashLite) {
    config.thinkingConfig = { thinkingBudget: 2048 }; 
  }

  try {
    const responseStream = await aiClient.models.generateContentStream({
      model: modelName,
      contents: fullPromptParts,
      config: config
    });

    for await (const chunk of responseStream) {
      if (signal?.aborted) {
        break;
      }
      const text = chunk.text;
      const groundingChunks = chunk.candidates?.[0]?.groundingMetadata?.groundingChunks;
      if (text) onChunk(text, groundingChunks);
    }
  } catch (error: any) {
    if (signal?.aborted) {
      onChunk("\n\n[Generation stopped by user]");
      return;
    }
    console.error("Gemini Error:", error);
    onChunk(`\n[System Error: ${error.message || "Failed to generate response"}]`);
  }
};

// --- PHASE 8 SERVICES ---

export const generateKnowledgeGraph = async (files: FileDocument[]): Promise<KnowledgeNode[]> => {
  if (!isGoogleProvider()) {
    return buildLocalKnowledgeGraph(files);
  }

  const aiClient = getGoogleClient();
  if (!aiClient) {
    return buildLocalKnowledgeGraph(files);
  }
  if (files.length === 0) return [];

  const contextString = files
    .filter(f => f.status === 'ready')
    .slice(0, 3) // Limit to 3 files to avoid context overflow in demo
    .map(f => `--- FILE: ${f.name} ---\n${f.content.substring(0, 2000)}`) // First 2000 chars
    .join("\n\n");

  const prompt = `
    Analyze the provided content. Extract 10-15 key concepts (nodes) and their interconnections.
    Return JSON format: [{ "id": "1", "label": "Concept Name", "category": "Category", "connections": ["2", "3"] }]
    Assign mastery strictly as 50 (default).
  `;

  try {
    const response = await aiClient.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: [
        { role: 'user', parts: [{ text: contextString }] },
        { role: 'user', parts: [{ text: prompt }] }
      ],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: "ARRAY",
          items: {
            type: "OBJECT",
            properties: {
              id: { type: "STRING" },
              label: { type: "STRING" },
              category: { type: "STRING" },
              connections: { type: "ARRAY", items: { type: "STRING" } },
              mastery: { type: "INTEGER" }
            }
          }
        }
      }
    });
    
    return JSON.parse(response.text || "[]");
  } catch (e) {
    console.error("Graph Gen Error", e);
    return [];
  }
};

export const generateMetaAnalysis = async (history: Message[]): Promise<MetaInsight[]> => {
  if (!isGoogleProvider()) {
    return buildLocalMetaInsights(history);
  }

  const aiClient = getGoogleClient();
  if (!aiClient) return [];
  
  const userMessages = history.filter(m => m.role === 'user').map(m => m.text).join("\n");
  if (!userMessages) return [];

  const prompt = `
    Analyze this student's query history. Detect meta-cognitive patterns:
    1. Are they asking shallow or deep questions?
    2. Do they show "Illusion of Competence"?
    3. What learning strategy would help them?
    
    Return 3 insights in JSON.
  `;

  try {
    const response = await aiClient.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: [{ role: 'user', parts: [{ text: userMessages + "\n" + prompt }] }],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: "ARRAY",
          items: {
            type: "OBJECT",
            properties: {
              type: { type: "STRING", enum: ["BIAS_DETECTED", "STRATEGY_SUGGESTION", "STRENGTH"] },
              title: { type: "STRING" },
              description: { type: "STRING" },
              timestamp: { type: "NUMBER" }
            }
          }
        }
      }
    });
    return JSON.parse(response.text || "[]");
  } catch (e) {
    return [];
  }
};

export const generateCognitiveExercises = async (): Promise<CognitiveExercise[]> => {
    if (!isGoogleProvider()) return buildLocalCognitiveExercises();
    const aiClient = getGoogleClient();
    if (!aiClient) return [];
    
    const prompt = `
        Generate 3 abstract cognitive exercises to train reasoning skills (not subject specific).
        Topics: Logical Fallacies, First Principles, Analogical Reasoning.
        Return JSON.
    `;

    try {
        const response = await aiClient.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: [{ role: 'user', parts: [{ text: prompt }] }],
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: "ARRAY",
                    items: {
                        type: "OBJECT",
                        properties: {
                            id: { type: "STRING" },
                            title: { type: "STRING" },
                            skill: { type: "STRING", enum: ["LOGIC", "FIRST_PRINCIPLES", "ARGUMENTATION", "LATERAL_THINKING"] },
                            description: { type: "STRING" },
                            difficulty: { type: "STRING", enum: ["Novice", "Adept", "Master"] }
                        }
                    }
                }
            }
        });
        return JSON.parse(response.text || "[]");
    } catch (e) {
        return [];
    }
}


// --- EXAM SIMULATION SERVICES ---

export const generateExamPaper = async (
  topic: string,
  files: FileDocument[]
): Promise<Question[]> => {
  if (!isGoogleProvider()) {
    return buildLocalExamPaper(topic, files);
  }

  const aiClient = getGoogleClient();
  if (!aiClient) throw new Error("AI Client not initialized");

  // Re-use game engine logic but ask for a "Paper" structure
  const contextString = files
    .filter(f => f.status === 'ready')
    .map(f => `--- FILE START: ${f.name} ---\n${f.content}\n--- FILE END ---`)
    .join("\n\n");

  const prompt = `
    Generate a strict 5-question exam paper on "${topic}" based on the sources.
    Include a mix of MCQ (2) and Open Ended (3) questions.
    Assign marks (e.g., [1 mark], [4 marks]).
    Return JSON.
  `;

  try {
    const response = await aiClient.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: [
        { role: 'user', parts: [{ text: `CONTEXT:\n${contextString}` }] },
        { role: 'user', parts: [{ text: prompt }] }
      ],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: "ARRAY",
          items: {
            type: "OBJECT",
            properties: {
              id: { type: "STRING" },
              type: { type: "STRING", enum: ["MCQ", "OPEN"] },
              text: { type: "STRING" },
              options: { type: "ARRAY", items: { type: "STRING" } },
              correctOptionIndex: { type: "INTEGER" },
              markScheme: { type: "ARRAY", items: { type: "STRING" } },
              explanation: { type: "STRING" },
              sourceCitation: { type: "STRING" },
              difficulty: { type: "STRING", enum: ["easy", "medium", "hard"] },
              marks: { type: "INTEGER" }
            },
            required: ["id", "type", "text", "explanation", "sourceCitation", "difficulty", "marks"]
          }
        }
      }
    });

    const jsonText = response.text;
    if (!jsonText) return [];
    return JSON.parse(jsonText) as Question[];
  } catch (e) {
    console.error("Exam Gen Error", e);
    return [];
  }
};

// --- GAME SERVICES (Legacy Support) ---
export const generateGameQuestions = async (
  topic: string, 
  mode: GameMode, 
  files: FileDocument[],
  count: number = 3
): Promise<Question[]> => {
  if (!aiClient) throw new Error("AI Client not initialized");

  const contextString = files
    .filter(f => f.status === 'ready')
    .map(f => `--- FILE START: ${f.name} ---\n${f.content}\n--- FILE END ---`)
    .join("\n\n");

  let instruction = "";
  switch (mode) {
    case 'MCQ_ARENA':
      instruction = `Generate ${count} Multiple Choice Questions (MCQ) on "${topic}". Ensure they are challenging but fair.`;
      break;
    case 'EXPLAIN_TO_WIN':
      instruction = `Generate ${count} Open Ended questions on "${topic}". The questions should ask the user to explain a concept in detail.`;
      break;
    case 'BOSS_BATTLE':
      instruction = `Generate ${count} very difficult questions on "${topic}". Mix of MCQ and Open Ended. These should test deep understanding.`;
      break;
    default:
      instruction = `Generate ${count} questions on "${topic}".`;
  }

  const prompt = `
    ${instruction}
    Based on the provided sources.
    Assign marks (e.g., [1 mark], [4 marks]).
    Return JSON.
  `;

  try {
    const response = await aiClient.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: [
        { role: 'user', parts: [{ text: `CONTEXT:\n${contextString}` }] },
        { role: 'user', parts: [{ text: prompt }] }
      ],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: "ARRAY",
          items: {
            type: "OBJECT",
            properties: {
              id: { type: "STRING" },
              type: { type: "STRING", enum: ["MCQ", "OPEN"] },
              text: { type: "STRING" },
              options: { type: "ARRAY", items: { type: "STRING" } },
              correctOptionIndex: { type: "INTEGER" },
              markScheme: { type: "ARRAY", items: { type: "STRING" } },
              explanation: { type: "STRING" },
              sourceCitation: { type: "STRING" },
              difficulty: { type: "STRING", enum: ["easy", "medium", "hard"] },
              marks: { type: "INTEGER" }
            },
            required: ["id", "type", "text", "explanation", "sourceCitation", "difficulty", "marks"]
          }
        }
      }
    });

    const jsonText = response.text;
    if (!jsonText) return [];
    return JSON.parse(jsonText) as Question[];
  } catch (e) {
    console.error("Game Gen Error", e);
    return [];
  }
};

export const gradeOpenEndedAnswer = async (
  question: string,
  userAnswer: string,
  markScheme: string[],
  files: FileDocument[]
): Promise<{ score: number; maxScore: number; feedback: string }> => {
  if (!isGoogleProvider()) {
    return gradeOpenEndedAnswerLocally(question, userAnswer, markScheme);
  }

  const aiClient = getGoogleClient();
  if (!aiClient) throw new Error("AI Client not initialized");

  const prompt = `
    You are a strict Examiner. Grade this student response.
    
    Question: ${question}
    Student Answer: ${userAnswer}
    Mark Scheme / Key Points: ${markScheme.join(", ")}
    
    Task:
    1. Award marks based on keywords present.
    2. Provide constructive feedback on what was missed.
    3. Be encouraging but strict on terminology.
  `;

  try {
    const response = await aiClient.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: "OBJECT",
          properties: {
            score: { type: "INTEGER" },
            maxScore: { type: "INTEGER" },
            feedback: { type: "STRING" }
          }
        }
      }
    });

    const jsonText = response.text;
    if (!jsonText) return { score: 0, maxScore: 5, feedback: "Error grading" };
    return JSON.parse(jsonText);
  } catch (e) {
    console.error("Grading Error", e);
    return { score: 0, maxScore: 5, feedback: "Error grading" };
  }
};

// --- GENERATIVE MEDIA ---

const buildPlaceholderImage = (prompt: string) => {
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='1200' height='675' viewBox='0 0 1200 675'>
    <defs>
      <linearGradient id='g' x1='0' x2='1' y1='0' y2='1'>
        <stop offset='0%' stop-color='#4f46e5'/>
        <stop offset='100%' stop-color='#a855f7'/>
      </linearGradient>
    </defs>
    <rect width='1200' height='675' fill='url(#g)'/>
    <text x='50%' y='45%' fill='white' font-family='Inter,Arial,sans-serif' font-size='46' font-weight='700' text-anchor='middle'>AI image placeholder</text>
    <text x='50%' y='57%' fill='white' opacity='0.8' font-family='Inter,Arial,sans-serif' font-size='26' text-anchor='middle'>${prompt.replace(/'/g, '')}</text>
  </svg>`;
  return `data:image/svg+xml;base64,${btoa(svg)}`;
};

export const generateImage = async (prompt: string): Promise<string> => {
  if (!isGoogleProvider()) {
    return buildPlaceholderImage(prompt);
  }
  const aiClient = getGoogleClient();
  if (!aiClient) return buildPlaceholderImage(prompt);

  try {
    const response = await aiClient.models.generateImages({
      model: 'imagen-3.0-lighter',
      prompt,
      config: { numberOfImages: 1 }
    });
    const bytes = response.generatedImages?.[0]?.image?.imageBytes;
    if (bytes) return `data:image/jpeg;base64,${bytes}`;
    return buildPlaceholderImage(prompt);
  } catch (e) {
    console.error('Image gen error', e);
    return buildPlaceholderImage(prompt);
  }
};

export const generateVideoPlan = async (prompt: string): Promise<VideoPlan> => {
  const fallback: VideoPlan = {
    title: 'Focus Sprint Reel',
    hook: 'What if 25 focused minutes could change your exam?',
    durationSeconds: 30,
    coverPrompt: 'student in neon-lit library reaching toward glowing holographic notes, cinematic, 16:9',
    callToAction: 'Start a 25-minute sprint now.',
    shots: [
      { id: '1', title: 'Hook Overlay', visual: 'Fast cut of student closing distracting apps', voiceover: 'Kill the noise. Start a 25-minute sprint.', durationSeconds: 4 },
      { id: '2', title: 'Micro-goal', visual: 'Notebook close-up with a single objective highlighted', voiceover: 'Pick one small target.', durationSeconds: 6 },
      { id: '3', title: 'Deep Focus', visual: 'Top-down shot of timer hitting 25:00', voiceover: 'Press start and stay with it.', durationSeconds: 8 },
      { id: '4', title: 'Reward', visual: 'Student smiles, sip of coffee, quick stretch', voiceover: 'Break for 5 minutes. You earned it.', durationSeconds: 6 },
      { id: '5', title: 'CTA', visual: 'Big on-screen text: “Sprint now”', voiceover: 'Ready? Sprint with me.', durationSeconds: 6 }
    ]
  };

  if (!isGoogleProvider()) return fallback;
  const aiClient = getGoogleClient();
  if (!aiClient) return fallback;

  try {
    const response = await aiClient.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: [
        { role: 'user', parts: [{ text: `Build a concise video storyboard for a learning or motivation clip.\nPrompt: ${prompt}\nReturn JSON with keys: title, hook, durationSeconds, coverPrompt, callToAction, shots (id,title,visual,voiceover,durationSeconds).` }] }
      ],
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: 'OBJECT',
          properties: {
            title: { type: 'STRING' },
            hook: { type: 'STRING' },
            durationSeconds: { type: 'INTEGER' },
            coverPrompt: { type: 'STRING' },
            callToAction: { type: 'STRING' },
            shots: {
              type: 'ARRAY',
              items: {
                type: 'OBJECT',
                properties: {
                  id: { type: 'STRING' },
                  title: { type: 'STRING' },
                  visual: { type: 'STRING' },
                  voiceover: { type: 'STRING' },
                  durationSeconds: { type: 'INTEGER' }
                }
              }
            }
          }
        }
      }
    });
    const parsed = JSON.parse(response.text || '{}') as VideoPlan;
    if (parsed?.shots?.length) return parsed;
    return fallback;
  } catch (e) {
    console.error('Video plan error', e);
    return fallback;
  }
};

const sleep = (ms: number) => new Promise(res => setTimeout(res, ms));

export const generateVideoClip = async (plan: VideoPlan): Promise<string | null> => {
  if (!isGoogleProvider()) return null;
  const aiClient = getGoogleClient();
  if (!aiClient) return null;

  const combinedPrompt = `
    Title: ${plan.title}
    Hook: ${plan.hook}
    Shots:
    ${plan.shots.map(s => `- (${s.durationSeconds}s) ${s.title}: ${s.visual} | VO: ${s.voiceover}`).join('\n')}
    CTA: ${plan.callToAction}
  `;

  try {
    let operation = await aiClient.models.generateVideos({
      model: 'veo-2.0-generate-001',
      source: { prompt: combinedPrompt },
      config: { numberOfVideos: 1, durationSeconds: Math.min(plan.durationSeconds, 45) }
    });

    // Poll a few times; keep light for demo
    for (let i = 0; i < 6 && !operation.done; i++) {
      await sleep(4000);
      operation = await aiClient.operations.getVideosOperation({ operation });
    }

    const video = operation.response?.generatedVideos?.[0]?.video;
    if (video?.uri) return video.uri;
    if (video?.videoBytes) return `data:video/mp4;base64,${video.videoBytes}`;
    return null;
  } catch (e) {
    console.error('Video gen error', e);
    return null;
  }
};

// --- LOCAL / OLLAMA FALLBACK HELPERS ---

const streamWithOllama = async ({
  history,
  newMessage,
  systemPrompt,
  onChunk,
  signal,
}: {
  history: Message[];
  newMessage: string;
  systemPrompt: string;
  onChunk: (text: string, groundingMetadata?: any) => void;
  signal?: AbortSignal;
}) => {
  const { baseUrl, model } = getOllamaConfig();

  const messages = [
    { role: 'system', content: systemPrompt.trim() },
    ...history.map(m => ({
      role: m.role === 'model' ? 'assistant' : 'user',
      content: m.text
    })),
    { role: 'user', content: newMessage }
  ];

  try {
    const response = await fetch(`${baseUrl}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model,
        messages,
        stream: true
      }),
      signal
    });

    if (!response.ok) {
      const errText = await response.text().catch(() => "Unknown error");
      onChunk(`\n[System Error: Ollama ${response.status} ${response.statusText} - ${errText}]`);
      return;
    }

    if (!response.body) {
      onChunk("\n[System Error: Ollama response missing body]");
      return;
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      let newlineIndex: number;

      while ((newlineIndex = buffer.indexOf("\n")) !== -1) {
        const line = buffer.slice(0, newlineIndex).trim();
        buffer = buffer.slice(newlineIndex + 1);
        if (!line) continue;

        try {
          const json = JSON.parse(line);
          if (json.message?.content) {
            onChunk(json.message.content);
          }
          if (json.done) {
            return;
          }
        } catch (e) {
          // Ignore parse errors on partial lines
        }
      }

      if (signal?.aborted) {
        reader.cancel().catch(() => {});
        onChunk("\n\n[Generation stopped by user]");
        return;
      }
    }
  } catch (error: any) {
    if (signal?.aborted) {
      onChunk("\n\n[Generation stopped by user]");
      return;
    }
    onChunk(`\n[System Error: ${error?.message || "Failed to reach Ollama"}]`);
  }
};

const buildLocalKnowledgeGraph = (files: FileDocument[]): KnowledgeNode[] => {
  const titles = files.length > 0
    ? files.map(f => f.name.replace(/\.[^/.]+$/, ''))
    : ["Focus Habits", "Memory Cues", "Exam Strategy", "Active Recall"];

  return titles.slice(0, 8).map((title, idx) => ({
    id: (idx + 1).toString(),
    label: title || `Concept ${idx + 1}`,
    category: files[idx]?.type?.toUpperCase() || "GENERAL",
    mastery: 45 + ((idx * 7) % 35),
    connections: idx === 0 ? [] : [(idx).toString()]
  }));
};

const buildLocalMetaInsights = (history: Message[]): MetaInsight[] => {
  const userMessages = history.filter(m => m.role === 'user').map(m => m.text);
  if (userMessages.length === 0) return [];

  const now = Date.now();
  return [
    {
      type: 'STRENGTH',
      title: 'Curiosity Detected',
      description: 'Your questions show steady curiosity. Keep iterating with follow-ups.',
      timestamp: now
    },
    {
      type: 'BIAS_DETECTED',
      title: 'Watch Confirmation Bias',
      description: 'Try to ask for counter-examples to your assumptions to avoid narrow framing.',
      timestamp: now
    },
    {
      type: 'STRATEGY_SUGGESTION',
      title: 'Add Spaced Retrieval',
      description: 'Summarize answers in your own words, then quiz yourself in 24 hours.',
      timestamp: now
    }
  ];
};

const buildLocalCognitiveExercises = (): CognitiveExercise[] => ([
  {
    id: 'local-logic',
    title: 'Fallacy Hunt',
    skill: 'LOGIC',
    description: 'Spot the hidden assumption in a short argument you read today.',
    difficulty: 'Novice'
  },
  {
    id: 'local-first-principles',
    title: 'Unbundle a Concept',
    skill: 'FIRST_PRINCIPLES',
    description: 'Break a topic into 5 atomic facts and rebuild the explanation from them.',
    difficulty: 'Adept'
  },
  {
    id: 'local-analogy',
    title: 'Analogy Sprint',
    skill: 'LATERAL_THINKING',
    description: 'Create two analogies between your current topic and everyday objects.',
    difficulty: 'Master'
  }
]);

const buildLocalExamPaper = (topic: string, files: FileDocument[]): Question[] => {
  const sourceLabel = files[0]?.name ? `Source: ${files[0].name}` : "General knowledge";
  const mcq = (id: number, text: string, options: string[], correct: number): Question => ({
    id: `q${id}`,
    type: 'MCQ',
    text,
    options,
    correctOptionIndex: correct,
    explanation: 'Self-check: ensure you can justify why the correct option wins.',
    sourceCitation: sourceLabel,
    difficulty: 'easy',
    marks: 1,
  });

  const open = (id: number, text: string): Question => ({
    id: `q${id}`,
    type: 'OPEN',
    text,
    explanation: 'Aim for 3-4 bullet points; define any key terms.',
    sourceCitation: sourceLabel,
    difficulty: 'medium',
    marks: 4,
  });

  return [
    mcq(1, `Which statement best describes ${topic}?`, [
      `${topic} focuses on processes.`,
      `${topic} is purely descriptive.`,
      `${topic} is only a lab technique.`,
      `${topic} is unrelated to systems.`,
    ], 0),
    mcq(2, `What is a common misconception about ${topic}?`, [
      'It has no exceptions.',
      'It scales linearly.',
      'It always increases efficiency.',
      'It cannot be measured.',
    ], 0),
    open(3, `Outline two core principles of ${topic}.`),
    open(4, `Give one real-world application of ${topic} and its limitation.`),
    open(5, `Compare ${topic} to a related idea and highlight a key difference.`),
  ];
};

const gradeOpenEndedAnswerLocally = (
  question: string,
  userAnswer: string,
  markScheme: string[]
): { score: number; maxScore: number; feedback: string } => {
  const scheme = markScheme || [];
  const maxScore = Math.max(scheme.length, 5);
  const normalizedAnswer = userAnswer.toLowerCase();
  const hits = scheme.reduce((acc, point) => acc + (normalizedAnswer.includes(point.toLowerCase()) ? 1 : 0), 0);
  const score = Math.min(hits, maxScore);

  const missing = scheme.filter(point => !normalizedAnswer.includes(point.toLowerCase()));
  const feedback = missing.length === 0
    ? "Strong answer — you covered the key points."
    : `You could add: ${missing.slice(0, 3).join("; ")}.`;

  return { score, maxScore, feedback };
};
