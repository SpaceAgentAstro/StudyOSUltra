
import { GoogleGenAI } from "@google/genai";
import { FileDocument, Message, Question, GameMode, AgentRole, DigitalTwin, KnowledgeNode, MetaInsight, CognitiveExercise } from "../types";
import { SYSTEM_INSTRUCTION_BASE, AGENT_PERSONAS } from "../constants";

const getProvider = () => (process.env.MODEL_PROVIDER || "google").toLowerCase();
const getApiKey = () => process.env.GEMINI_API_KEY || process.env.API_KEY || "";
const isGoogleProvider = () => getProvider() === "google" && getApiKey().length > 0;

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
    // Simply call the same logic as exam generation but simpler prompt for games
    // Ideally refactor to share logic, keeping it separate for safety in this change
    return generateExamPaper(topic, files); 
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
};

// --- LOCAL / OLLAMA FALLBACK HELPERS ---

const streamWithOllama = async ({
  onChunk,
}: {
  history: Message[];
  newMessage: string;
  systemPrompt: string;
  onChunk: (text: string, groundingMetadata?: any) => void;
  signal?: AbortSignal;
}) => {
  onChunk("\n[System Error: Ollama streaming is not configured]");
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
