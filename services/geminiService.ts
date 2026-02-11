import { GoogleGenerativeAI } from "@google/generative-ai";
import { FileDocument, Message, Question, GameMode, AgentRole, DigitalTwin, KnowledgeNode, MetaInsight, CognitiveExercise } from "../types";
import { SYSTEM_INSTRUCTION_BASE, AGENT_PERSONAS } from "../constants";

const apiKey = process.env.API_KEY || process.env.GEMINI_API_KEY || "";
if (!apiKey) {
  console.error("Gemini API Key is missing. Please check your vite.config.ts or .env file.");
}

const genAI = new GoogleGenerativeAI(apiKey);

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

  const fullHistory = [
      { role: 'user', parts: [{ text: `SYSTEM INSTRUCTION:\n${systemPrompt}` }] },
      ...contents,
      { role: 'user', parts: newParts }
  ];

  // 6. Model Config
  let modelName = 'gemini-1.5-flash'; // Fallback from gemini-3-flash-preview
  if (useFlashLite) modelName = 'gemini-1.5-flash-8b'; // approximate lite model

  // Note: SDK handles tools differently in chat vs generateContent.
  // Using generateContentStream allows arbitrary history passing.

  const tools: any[] = [];
  // Search tool support varies by model/region. Assuming supported or handled by SDK.

  const model = genAI.getGenerativeModel({
      model: modelName,
      generationConfig: {
          temperature: agentRole === 'EXAMINER' ? 0.2 : 0.7,
      }
      // tools: tools ...
  });

  try {
    const result = await model.generateContentStream({
        contents: fullHistory
    });

    for await (const chunk of result.stream) {
        if (signal?.aborted) break;
        const text = chunk.text();
        const groundingMetadata = chunk.candidates?.[0]?.groundingMetadata; // SDK structure might differ slightly but usually consistent
        if (text) onChunk(text, groundingMetadata);
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
  if (files.length === 0) return [];

  const contextString = files
    .filter(f => f.status === 'ready')
    .slice(0, 3)
    .map(f => `--- FILE: ${f.name} ---\n${f.content.substring(0, 2000)}`)
    .join("\n\n");

  const prompt = `
    Analyze the provided content. Extract 10-15 key concepts (nodes) and their interconnections.
    Return JSON format: [{ "id": "1", "label": "Concept Name", "category": "Category", "connections": ["2", "3"] }]
    Assign mastery strictly as 50 (default).
  `;

  try {
    const model = genAI.getGenerativeModel({
        model: 'gemini-1.5-flash',
        generationConfig: { responseMimeType: "application/json" }
    });
    
    const result = await model.generateContent([
        contextString,
        prompt
    ]);

    return JSON.parse(result.response.text() || "[]");
  } catch (e) {
    console.error("Graph Gen Error", e);
    return [];
  }
};

export const generateMetaAnalysis = async (history: Message[]): Promise<MetaInsight[]> => {
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
    const model = genAI.getGenerativeModel({
        model: 'gemini-1.5-flash',
        generationConfig: { responseMimeType: "application/json" }
    });
    const result = await model.generateContent([
        userMessages + "\n" + prompt
    ]);
    return JSON.parse(result.response.text() || "[]");
  } catch (e) {
    return [];
  }
};

export const generateCognitiveExercises = async (): Promise<CognitiveExercise[]> => {
    const prompt = `
        Generate 3 abstract cognitive exercises to train reasoning skills (not subject specific).
        Topics: Logical Fallacies, First Principles, Analogical Reasoning.
        Return JSON.
    `;

    try {
        const model = genAI.getGenerativeModel({
            model: 'gemini-1.5-flash',
            generationConfig: { responseMimeType: "application/json" }
        });
        const result = await model.generateContent(prompt);
        return JSON.parse(result.response.text() || "[]");
    } catch (e) {
        return [];
    }
}


// --- EXAM SIMULATION SERVICES ---

export const generateExamPaper = async (
  topic: string,
  files: FileDocument[]
): Promise<Question[]> => {

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
    const model = genAI.getGenerativeModel({
        model: 'gemini-1.5-flash',
        generationConfig: { responseMimeType: "application/json" }
    });
    const result = await model.generateContent([
        `CONTEXT:\n${contextString}`,
        prompt
    ]);

    const jsonText = result.response.text();
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
    const model = genAI.getGenerativeModel({
        model: 'gemini-1.5-flash',
        generationConfig: { responseMimeType: "application/json" }
    });
    const result = await model.generateContent([
        `CONTEXT:\n${contextString}`,
        prompt
    ]);

    const jsonText = result.response.text();
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
    const model = genAI.getGenerativeModel({
        model: 'gemini-1.5-flash',
        generationConfig: { responseMimeType: "application/json" }
    });
    const result = await model.generateContent(prompt);

    const jsonText = result.response.text();
    if (!jsonText) return { score: 0, maxScore: 5, feedback: "Error grading" };
    return JSON.parse(jsonText);
  } catch (e) {
    return { score: 0, maxScore: 5, feedback: "Error grading" };
  }
};
