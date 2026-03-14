import { GoogleGenAI } from '@google/genai';
import { z } from 'zod';
import {
  AgentRole,
  CognitiveExercise,
  DigitalTwin,
  FileDocument,
  Flashcard,
  GameMode,
  KnowledgeNode,
  LessonScore,
  LessonSuite,
  Message,
  MetaInsight,
  ModelProvider,
  PodcastSegment,
  Question,
  QuizQuestion,
  VideoPlan,
} from '../types';
import { AGENT_PERSONAS, SYSTEM_INSTRUCTION_BASE } from '../constants';

const API_KEY = process.env.GEMINI_API_KEY || process.env.API_KEY || process.env.JULES_API_KEY || '';
const aiClient = API_KEY ? new GoogleGenAI({ apiKey: API_KEY }) : null;

type OllamaRuntimeConfig = {
  model?: string;
  baseUrl?: string;
};

const runtimeState: {
  provider: ModelProvider;
  apiKey: string;
  ollama: OllamaRuntimeConfig;
} = {
  provider: 'auto',
  apiKey: '',
  ollama: {},
};

const QuestionSchema = z.object({
  id: z.string(),
  type: z.enum(['MCQ', 'OPEN']),
  text: z.string(),
  options: z.array(z.string()).optional(),
  correctOptionIndex: z.number().optional(),
  markScheme: z.array(z.string()).optional(),
  explanation: z.string(),
  sourceCitation: z.string(),
  difficulty: z.enum(['easy', 'medium', 'hard']),
  marks: z.number().optional(),
});

const KnowledgeNodeSchema = z.object({
  id: z.string(),
  label: z.string(),
  category: z.string(),
  mastery: z.number(),
  connections: z.array(z.string()),
  x: z.number().optional(),
  y: z.number().optional(),
});

const MetaInsightSchema = z.object({
  type: z.enum(['BIAS_DETECTED', 'STRATEGY_SUGGESTION', 'STRENGTH']),
  title: z.string(),
  description: z.string(),
  timestamp: z.number(),
});

const CognitiveExerciseSchema = z.object({
  id: z.string(),
  title: z.string(),
  skill: z.enum(['LOGIC', 'FIRST_PRINCIPLES', 'ARGUMENTATION', 'LATERAL_THINKING']),
  description: z.string(),
  difficulty: z.enum(['Novice', 'Adept', 'Master']),
});

const GradeResponseSchema = z.object({
  score: z.number(),
  maxScore: z.number(),
  feedback: z.string(),
});

const VideoPlanSchema = z.object({
  title: z.string(),
  durationSeconds: z.number(),
  shots: z.array(
    z.object({
      id: z.string(),
      title: z.string(),
      visual: z.string(),
      voiceover: z.string(),
      durationSeconds: z.number(),
      sourceCitation: z.string().optional(),
    }),
  ),
  callToAction: z.string(),
});

const FlashcardSchema = z.object({
  id: z.string(),
  front: z.string(),
  back: z.string(),
  sourceCitation: z.string(),
});

const QuizQuestionSchema = z.object({
  id: z.string(),
  prompt: z.string(),
  options: z.array(z.string()),
  correctOptionIndex: z.number(),
  explanation: z.string(),
  sourceCitation: z.string(),
  difficulty: z.enum(['easy', 'medium', 'hard']),
});

const LessonSuiteSchema = z.object({
  topic: z.string(),
  generatedAt: z.number(),
  report: z.object({
    executiveSummary: z.string(),
    keyTakeaways: z.array(z.string()),
    misconceptions: z.array(z.string()),
    practicePlan: z.array(z.string()),
  }),
  flashcards: z.array(FlashcardSchema),
  quiz: z.array(QuizQuestionSchema),
  slideDeck: z.array(
    z.object({
      id: z.string(),
      title: z.string(),
      bullets: z.array(z.string()),
      speakerNotes: z.string(),
      sourceCitation: z.string(),
    }),
  ),
  infographic: z.array(
    z.object({
      id: z.string(),
      title: z.string(),
      stat: z.string(),
      explanation: z.string(),
      visualHint: z.string(),
      sourceCitation: z.string(),
    }),
  ),
  podcast: z.object({
    intro: z.string(),
    segments: z.array(
      z.object({
        id: z.string(),
        title: z.string(),
        hostLine: z.string(),
        expertLine: z.string(),
        durationSeconds: z.number(),
        sourceCitation: z.string(),
      }),
    ),
    outro: z.string(),
  }),
  audioNarrationScript: z.string(),
  video: VideoPlanSchema,
  imagePrompts: z.array(z.string()),
  sourceMap: z.array(
    z.object({
      sourceName: z.string(),
      coverageNote: z.string(),
    }),
  ),
});

interface GeneratePayload {
  model: string;
  contents: Array<{ role: 'user' | 'model'; parts: Array<{ text: string } | { inlineData: { mimeType: string; data: string } }> }>;
  config?: Record<string, unknown>;
}

interface GenerateResponse {
  text?: string;
  candidates?: any[];
}


interface SendMessageParams {
  history: Message[];
  newMessage: string;
  files: FileDocument[];
  imageAttachment?: string;
  mode: 'tutor' | 'examiner';
  agentRole?: AgentRole;
  digitalTwin?: DigitalTwin;
  useThinking?: boolean;
  useSearch?: boolean;
  useFlashLite?: boolean;
  onChunk: (text: string, groundingMetadata?: any) => void;
  signal?: AbortSignal;
}

const defaultModel = 'gemini-3-flash-preview';

const sanitizeText = (value: string) => value.replace(/\s+/g, ' ').trim();

const escapeXml = (value: string) =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');

const base64Encode = (value: string) => {
  if (typeof Buffer !== 'undefined') {
    return Buffer.from(value, 'utf-8').toString('base64');
  }
  return btoa(unescape(encodeURIComponent(value)));
};

const fallbackImageDataUrl = (prompt: string) => {
  const preview = escapeXml(prompt.slice(0, 100));
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#1e293b"/><stop offset="100%" stop-color="#4f46e5"/></linearGradient></defs><rect width="1024" height="1024" fill="url(#g)"/><text x="50%" y="46%" text-anchor="middle" font-family="Arial" font-size="44" fill="#ffffff" opacity="0.95">AI Image Preview</text><text x="50%" y="54%" text-anchor="middle" font-family="Arial" font-size="24" fill="#e2e8f0" opacity="0.95">${preview}</text></svg>`;
  return `data:image/svg+xml;base64,${base64Encode(svg)}`;
};

const getReadySources = (files: FileDocument[]) => files.filter((file) => file.status === 'ready');

const buildSourceContext = (files: FileDocument[], maxFiles = 5, maxCharsPerFile = 3000) => {
  const ready = getReadySources(files).slice(0, maxFiles);
  if (!ready.length) return 'No source files uploaded.';

  return ready
    .map((file) => {
      const content = file.content ? file.content.slice(0, maxCharsPerFile) : '';
      return `--- SOURCE: ${file.name} ---\n${content}`;
    })
    .join('\n\n');
};

const parseJsonText = <T>(text: string | undefined, schema: z.ZodSchema<T>): T | null => {
  if (!text) return null;
  try {
    const parsed = JSON.parse(text);
    const result = schema.safeParse(parsed);
    if (result.success) return result.data;
    return null;
  } catch {
    return null;
  }
};

const callApi = async (path: string, payload: GeneratePayload): Promise<GenerateResponse> => {
  const response = await fetch(path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(errText || `Request failed with status ${response.status}`);
  }

  return (await response.json()) as GenerateResponse;
};

const generateStructured = async <T>(params: {
  prompt: string;
  files?: FileDocument[];
  schema: z.ZodSchema<T>;
  fallback: T;
  model?: string;
  temperature?: number;
}): Promise<T> => {
  const { prompt, files = [], schema, fallback, model = defaultModel, temperature = 0.4 } = params;

  try {
    const response = await callApi('/api/generate', {
      model,
      contents: [
        {
          role: 'user',
          parts: [{ text: `SOURCE MATERIAL:\n${buildSourceContext(files)}` }],
        },
        {
          role: 'user',
          parts: [{ text: `${prompt}\n\nReturn valid JSON only.` }],
        },
      ],
      config: {
        temperature,
        responseMimeType: 'application/json',
      },
    });

    const parsed = parseJsonText(response.text, schema);
    return parsed ?? fallback;
  } catch (error) {
    console.error('Structured generation error:', error);
    return fallback;
  }
};

const buildFallbackQuiz = (topic: string): QuizQuestion[] => [
  {
    id: 'q1',
    prompt: `Which option best summarizes the core idea of ${topic}?`,
    options: ['Definition and purpose', 'Historical timeline only', 'Random facts', 'Unrelated topic'],
    correctOptionIndex: 0,
    explanation: 'Start from the core definition and intended function before details.',
    sourceCitation: 'Generated from available sources',
    difficulty: 'easy',
  },
  {
    id: 'q2',
    prompt: `What is the most effective way to apply ${topic} in an exam answer?`,
    options: ['Use precise terms and examples', 'Write general opinions', 'Skip structure', 'Avoid evidence'],
    correctOptionIndex: 0,
    explanation: 'High-scoring answers are specific, structured, and evidence-backed.',
    sourceCitation: 'Generated from available sources',
    difficulty: 'medium',
  },
];

const buildFallbackVideoPlan = (topic: string): VideoPlan => ({
  title: `${topic} in 60 Seconds`,
  durationSeconds: 60,
  shots: [
    {
      id: '1',
      title: 'Hook',
      visual: `Fast intro text: "Master ${topic}"`,
      voiceover: `Today we break down ${topic} in one minute.`,
      durationSeconds: 10,
      sourceCitation: 'Generated from available sources',
    },
    {
      id: '2',
      title: 'Core Concept',
      visual: `Diagram-style reveal of key ${topic} relationships`,
      voiceover: `Focus on the core mechanism and why it matters.`,
      durationSeconds: 25,
      sourceCitation: 'Generated from available sources',
    },
    {
      id: '3',
      title: 'Exam Move',
      visual: 'Check-list overlay with command words',
      voiceover: 'Use exact terminology, then support with one clear example.',
      durationSeconds: 25,
      sourceCitation: 'Generated from available sources',
    },
  ],
  callToAction: `Attempt one practice question on ${topic} now.`,
});

const buildFallbackLessonSuite = (topic: string, files: FileDocument[]): LessonSuite => {
  const sourceNames = getReadySources(files).map((file) => file.name);

  return {
    topic,
    generatedAt: Date.now(),
    report: {
      executiveSummary: `This lesson package synthesizes ${topic} into exam-ready components grounded in your uploaded sources.`,
      keyTakeaways: [
        `Define ${topic} in one sentence with exact terminology.`,
        `Explain the mechanism/process behind ${topic}.`,
        'Use one concrete example with clear cause-effect language.',
      ],
      misconceptions: [
        `Confusing related terms around ${topic}.`,
        'Using broad statements without evidence from sources.',
      ],
      practicePlan: [
        'Review flashcards once now, once after 24h, once after 72h.',
        'Complete the quiz and re-answer incorrect questions from memory.',
        'Convert the slide deck into a 2-minute oral explanation.',
      ],
    },
    flashcards: [
      {
        id: 'fc1',
        front: `What is ${topic}?`,
        back: `${topic} should be defined in concise, exam-grade language, linked to its purpose and mechanism.`,
        sourceCitation: sourceNames[0] || 'Generated from available sources',
      },
      {
        id: 'fc2',
        front: `What is a high-mark answer pattern for ${topic}?`,
        back: 'Definition -> mechanism -> evidence/example -> concise conclusion.',
        sourceCitation: sourceNames[0] || 'Generated from available sources',
      },
    ],
    quiz: buildFallbackQuiz(topic),
    slideDeck: [
      {
        id: 's1',
        title: `${topic}: Core Idea`,
        bullets: ['Definition', 'Why it matters', 'Key terms'],
        speakerNotes: 'Open with the exam-friendly definition and a one-line importance statement.',
        sourceCitation: sourceNames[0] || 'Generated from available sources',
      },
      {
        id: 's2',
        title: 'Mechanism and Application',
        bullets: ['How it works', 'Typical question style', 'Model answer pattern'],
        speakerNotes: 'Walk through process steps, then map them to mark-scheme language.',
        sourceCitation: sourceNames[1] || sourceNames[0] || 'Generated from available sources',
      },
    ],
    infographic: [
      {
        id: 'i1',
        title: `${topic} at a Glance`,
        stat: '3-part structure',
        explanation: 'Definition, mechanism, and evidence are the minimum structure for high-quality answers.',
        visualHint: 'Three-column card with icons and directional arrows',
        sourceCitation: sourceNames[0] || 'Generated from available sources',
      },
    ],
    podcast: {
      intro: `Welcome to the ${topic} sprint review.`,
      segments: [
        {
          id: 'p1',
          title: 'Concept Breakdown',
          hostLine: `Give us the clean definition of ${topic}.`,
          expertLine: `${topic} can be explained through definition, mechanism, and applied evidence in exam responses.`,
          durationSeconds: 45,
          sourceCitation: sourceNames[0] || 'Generated from available sources',
        },
        {
          id: 'p2',
          title: 'Exam Strategy',
          hostLine: 'What earns marks quickly?',
          expertLine: 'Use command words, precise terminology, and one concrete source-backed example.',
          durationSeconds: 45,
          sourceCitation: sourceNames[1] || sourceNames[0] || 'Generated from available sources',
        },
      ],
      outro: 'Recite one flashcard answer from memory before ending this session.',
    },
    audioNarrationScript: `Today we study ${topic}. Start with a precise definition, explain the mechanism, then anchor your answer with one clear example from your notes.`,
    video: buildFallbackVideoPlan(topic),
    imagePrompts: [
      `Infographic style visual explaining ${topic} with labels and arrows, educational, high contrast`,
      `Cinematic study poster for ${topic}, clean typography, realistic notebook and diagrams`,
    ],
    sourceMap: sourceNames.map((sourceName) => ({
      sourceName,
      coverageNote: `Used for ${topic} synthesis and examples.`,
    })),
  };
};

export const normalizeProvider = (provider?: string | null): ModelProvider => {
  const normalized = (provider || '').toLowerCase();
  if (normalized === 'google' || normalized === 'openai' || normalized === 'anthropic' || normalized === 'ollama') {
    return normalized;
  }
  return 'auto';
};

export const setRuntimeProvider = (provider?: string | null) => {
  runtimeState.provider = normalizeProvider(provider);
};

export const setRuntimeApiKey = (apiKey?: string) => {
  runtimeState.apiKey = apiKey || '';
};

export const setRuntimeOllamaConfig = (config: OllamaRuntimeConfig = {}) => {
  runtimeState.ollama = config;
};

export const streamChatResponse = async ({
  history,
  newMessage,
  files,
  imageAttachment,
  agentRole = 'COUNCIL',
  digitalTwin,
  useThinking = false,
  useSearch = false,
  useFlashLite = false,
  onChunk,
  signal,
}: SendMessageParams) => {
  const persona = AGENT_PERSONAS[agentRole] || AGENT_PERSONAS.COUNCIL;

  const twinContext = digitalTwin
    ? `\nDIGITAL TWIN:\n- Weaknesses: ${digitalTwin.weaknesses.join(', ') || 'n/a'}\n- Mood: ${digitalTwin.recentMood}\n- Precision: ${digitalTwin.examSkills.precision}\n- Time management: ${digitalTwin.examSkills.timeManagement}`
    : '';

  const model = useFlashLite ? 'gemini-flash-lite-latest' : defaultModel;

  const priorMessages = history.slice(-20).map((msg) => ({
    role: msg.role,
    parts: [{ text: msg.text }],
  }));

  const newParts: Array<{ text: string } | { inlineData: { mimeType: string; data: string } }> = [{ text: newMessage }];

  if (imageAttachment && imageAttachment.includes(',')) {
    const [meta, base64] = imageAttachment.split(',');
    const mimeType = meta.includes('png') ? 'image/png' : 'image/jpeg';
    if (base64) {
      newParts.push({ inlineData: { mimeType, data: base64 } });
    }
  }

  const payload: GeneratePayload = {
    model,
    contents: [
      {
        role: 'user',
        parts: [
          {
            text: `${SYSTEM_INSTRUCTION_BASE}\n\nCURRENT AGENT:\n${persona}${twinContext}\n\nFEATURE FLAGS:\n- Thinking: ${useThinking ? 'on' : 'off'}\n- Search: ${useSearch ? 'on' : 'off'}\n\nSOURCES:\n${buildSourceContext(files)}`,
          },
        ],
      },
      ...priorMessages,
      { role: 'user', parts: newParts },
    ],
    config: {
      temperature: agentRole === 'EXAMINER' ? 0.2 : 0.7,
      tools: useSearch ? [{ googleSearch: {} }] : undefined,
      thinkingConfig: useThinking && !useFlashLite ? { thinkingBudget: 2048 } : undefined,
    },
  };

  if (signal?.aborted) {
    onChunk('\n\n[Generation stopped by user]');
    return;
  }

  try {
    const response = await fetch('/api/stream', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-internal-secret': API_KEY
      },
      body: JSON.stringify(payload),
      signal,
    });

    if (!response.ok || !response.body) {
      const errText = await response.text();
      throw new Error(errText || `Stream failed with status ${response.status}`);
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      if (signal?.aborted) {
        onChunk('\n\n[Generation stopped by user]');
        break;
      }

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed) continue;

        try {
          const parsed = JSON.parse(trimmed);
          const text = typeof parsed.text === 'string' ? parsed.text : '';
          const groundingChunks = parsed.candidates?.[0]?.groundingMetadata?.groundingChunks;
          if (text) {
            onChunk(text, groundingChunks);
          }
        } catch {
          // Ignore malformed NDJSON chunks.
        }
      }
    }
  } catch (error: any) {
    if (signal?.aborted || error?.name === 'AbortError') {
      onChunk('\n\n[Generation stopped by user]');
      return;
    }

    console.error('Gemini stream error:', error);
    onChunk(`\n[System Error: ${error?.message || 'Failed to generate response'}]`);
  }
};

export const generateKnowledgeGraph = async (files: FileDocument[]): Promise<KnowledgeNode[]> => {
  if (!getReadySources(files).length) return [];

  const fallback: KnowledgeNode[] = [
    { id: '1', label: 'Core Concept', category: 'Foundation', mastery: 50, connections: ['2'] },
    { id: '2', label: 'Application', category: 'Practice', mastery: 50, connections: ['1', '3'] },
    { id: '3', label: 'Common Mistakes', category: 'Revision', mastery: 50, connections: ['2'] },
  ];

  return generateStructured({
    files,
    schema: z.array(KnowledgeNodeSchema),
    fallback,
    prompt: `Extract 10-15 interconnected knowledge nodes from the source material. Each node needs id, label, category, mastery (0-100), and connections.`,
  });
};

export const generateMetaAnalysis = async (history: Message[]): Promise<MetaInsight[]> => {
  const userMessages = history
    .filter((message) => message.role === 'user')
    .map((message) => message.text)
    .join('\n');

  if (!userMessages.trim()) return [];

  return generateStructured({
    schema: z.array(MetaInsightSchema),
    fallback: [],
    prompt: `Analyze the following learner messages and return exactly 3 meta-learning insights as JSON. Include strengths, weak patterns, and one strategy recommendation.\n\nMESSAGES:\n${userMessages}`,
  });
};

export const generateCognitiveExercises = async (): Promise<CognitiveExercise[]> => {
  const fallback: CognitiveExercise[] = [
    {
      id: 'logic-1',
      title: 'Assumption Stress Test',
      skill: 'LOGIC',
      description: 'Pick one belief and list three assumptions that must be true for it to hold.',
      difficulty: 'Novice',
    },
    {
      id: 'fp-1',
      title: 'First Principles Decomposition',
      skill: 'FIRST_PRINCIPLES',
      description: 'Break a complex topic into irreducible facts, then rebuild a model from scratch.',
      difficulty: 'Adept',
    },
    {
      id: 'arg-1',
      title: 'Counter-Argument Builder',
      skill: 'ARGUMENTATION',
      description: 'Write the strongest argument against your current answer, then reconcile both sides.',
      difficulty: 'Master',
    },
  ];

  return generateStructured({
    schema: z.array(CognitiveExerciseSchema),
    fallback,
    prompt: 'Generate 3 abstract cognitive training exercises focused on logic, first principles, and argumentation.',
  });
};

export const generateExamPaper = async (topic: string, files: FileDocument[]): Promise<Question[]> => {
  const fallback: Question[] = [
    {
      id: 'q1',
      type: 'MCQ',
      text: `Which statement best matches the core definition of ${topic}?`,
      options: ['Precise definition', 'Unrelated detail', 'Pure opinion', 'Historical trivia'],
      correctOptionIndex: 0,
      explanation: 'Strong exam responses begin with a precise definition.',
      sourceCitation: 'Generated from available sources',
      difficulty: 'easy',
      marks: 1,
    },
    {
      id: 'q2',
      type: 'OPEN',
      text: `Explain the main mechanism behind ${topic} and give one source-backed example.`,
      markScheme: ['definition', 'mechanism', 'example', 'precise terminology'],
      explanation: 'Include command-word alignment and clear structure.',
      sourceCitation: 'Generated from available sources',
      difficulty: 'medium',
      marks: 4,
    },
  ];

  return generateStructured({
    files,
    schema: z.array(QuestionSchema),
    fallback,
    prompt: `Generate a strict 5-question exam paper on "${sanitizeText(topic)}" based on sources. Include 2 MCQ + 3 OPEN questions with marks and mark schemes where relevant.`,
  });
};

export const generateGameQuestions = async (
  topic: string,
  mode: GameMode,
  files: FileDocument[],
  count = 3,
): Promise<Question[]> => {
  let modeInstruction = 'Include a balanced mix of MCQ and Open Ended questions.';
  if (mode === 'MCQ_ARENA') {
    modeInstruction = 'Include ONLY MCQ questions.';
  }
  if (mode === 'EXPLAIN_TO_WIN') {
    modeInstruction = 'Include ONLY Open Ended questions.';
  }

  const fallback = mode === 'EXPLAIN_TO_WIN'
    ? buildFallbackQuiz(topic).map((quiz, index) => ({
        id: quiz.id,
        type: 'OPEN' as const,
        text: quiz.prompt,
        markScheme: ['definition', 'reasoning', 'source alignment'],
        explanation: quiz.explanation,
        sourceCitation: quiz.sourceCitation,
        difficulty: quiz.difficulty,
        marks: index === 0 ? 4 : 5,
      }))
    : buildFallbackQuiz(topic).map((quiz, index) => ({
        id: quiz.id,
        type: 'MCQ' as const,
        text: quiz.prompt,
        options: quiz.options,
        correctOptionIndex: quiz.correctOptionIndex,
        explanation: quiz.explanation,
        sourceCitation: quiz.sourceCitation,
        difficulty: quiz.difficulty,
        marks: index === 0 ? 1 : 2,
      }));

  return generateStructured({
    files,
    schema: z.array(QuestionSchema),
    fallback,
    prompt: `Generate exactly ${count} questions for topic "${sanitizeText(topic)}". ${modeInstruction} Each item must include explanation, sourceCitation, and difficulty.`,
  });
};

export const gradeOpenEndedAnswer = async (
  question: string,
  userAnswer: string,
  markScheme: string[],
  files: FileDocument[],
): Promise<{ score: number; maxScore: number; feedback: string }> => {
  const maxScore = Math.max(markScheme.length || 0, 5);
  const fallback = {
    score: 0,
    maxScore,
    feedback: 'Unable to grade at this time due to a service error.',
  };

  try {
    const response = await callApi('/api/generate', {
      model: defaultModel,
      contents: [
        {
          role: 'user',
          parts: [{ text: `SOURCE MATERIAL:\n${buildSourceContext(files)}` }],
        },
        {
          role: 'user',
          parts: [
            {
              text: `You are a strict examiner.\nQuestion: ${question}\nStudent Answer: ${userAnswer}\nMark Scheme: ${markScheme.join(', ') || 'n/a'}\nReturn JSON with { score, maxScore, feedback } only.`,
            },
          ],
        },
      ],
      config: {
        temperature: 0.1,
        responseMimeType: 'application/json',
      },
    });

    const parsed = parseJsonText(response.text, GradeResponseSchema);
    if (!parsed) return fallback;

    return {
      score: Math.max(0, Math.min(parsed.score, maxScore)),
      maxScore,
      feedback: parsed.feedback,
    };
  } catch (error) {
    console.error('Grading error:', error);
    return fallback;
  }
};

export const generateVideoPlan = async (prompt: string): Promise<VideoPlan> => {
  const sanitizedPrompt = sanitizeText(prompt);

  return generateStructured({
    schema: VideoPlanSchema,
    fallback: buildFallbackVideoPlan(sanitizedPrompt || 'Topic'),
    prompt: `Create a concise learning video storyboard for: "${sanitizedPrompt}". Return title, durationSeconds, 3-6 shots, and a callToAction.`,
  });
};

export const generateVideoClip = async (plan: VideoPlan): Promise<string | null> => {
  if (!aiClient) return null;

  try {
    const fullPrompt = `${plan.title}\n${plan.shots
      .map((shot) => `${shot.title}: ${shot.visual}. Voiceover: ${shot.voiceover}`)
      .join('\n')}`;

    const videoApi = (aiClient.models as any)?.generateVideos;
    if (typeof videoApi !== 'function') {
      return null;
    }

    const response = await videoApi({
      model: 'veo-2.0-generate-001',
      prompt: fullPrompt,
      config: {
        durationSeconds: Math.min(Math.max(plan.durationSeconds, 4), 20),
        aspectRatio: '16:9',
      },
    });

    const directUrl = response?.generatedVideos?.[0]?.video?.uri || response?.video?.uri;
    return directUrl || null;
  } catch (error) {
    console.error('Video generation unavailable:', error);
    return null;
  }
};

export const generateImage = async (prompt: string): Promise<string> => {
  const cleanPrompt = sanitizeText(prompt);

  if (!aiClient) {
    return fallbackImageDataUrl(cleanPrompt);
  }

  try {
    const imageApi = (aiClient.models as any)?.generateImages;
    if (typeof imageApi !== 'function') {
      return fallbackImageDataUrl(cleanPrompt);
    }

    const response = await imageApi({
      model: 'imagen-3.0-generate-002',
      prompt: cleanPrompt,
      config: {
        numberOfImages: 1,
        outputMimeType: 'image/jpeg',
      },
    });

    const bytes =
      response?.generatedImages?.[0]?.image?.imageBytes ||
      response?.images?.[0]?.b64Json ||
      response?.data?.[0]?.b64_json;

    if (!bytes) {
      return fallbackImageDataUrl(cleanPrompt);
    }

    return `data:image/jpeg;base64,${bytes}`;
  } catch (error) {
    console.error('Image generation unavailable:', error);
    return fallbackImageDataUrl(cleanPrompt);
  }
};

export const generateLessonSuite = async (topic: string, files: FileDocument[]): Promise<LessonSuite> => {
  const normalizedTopic = sanitizeText(topic) || 'General Study Topic';
  const fallback = buildFallbackLessonSuite(normalizedTopic, files);

  return generateStructured({
    files,
    schema: LessonSuiteSchema,
    fallback,
    prompt: `Build an AI lesson package for "${normalizedTopic}".
Return JSON with:
- report (executiveSummary, keyTakeaways[3-6], misconceptions[2-4], practicePlan[3-6])
- flashcards (8-12)
- quiz (6-10 MCQ)
- slideDeck (6-10 slides)
- infographic (3-6 panels)
- podcast (intro, 3-5 segments, outro)
- audioNarrationScript (1-2 minutes)
- video (storyboard with shots)
- imagePrompts (3 prompts)
- sourceMap (list each source and usage note)
All content must be source-grounded and exam-useful.`,
    temperature: 0.3,
  });
};

export const calculateLessonScore = (suite: LessonSuite, quizAnswers: Record<string, number>): LessonScore => {
  const totalQuiz = suite.quiz.length;
  const correct = suite.quiz.reduce((acc, question) => {
    const selected = quizAnswers[question.id];
    return acc + (selected === question.correctOptionIndex ? 1 : 0);
  }, 0);

  const quizPerformance = totalQuiz > 0 ? Math.round((correct / totalQuiz) * 100) : 0;
  const sourceGrounding = Math.min(100, 40 + suite.sourceMap.length * 12 + Math.min(suite.flashcards.length, 8) * 2);
  const retentionReadiness = Math.min(
    100,
    30 + Math.min(suite.flashcards.length, 12) * 4 + Math.min(suite.report.practicePlan.length, 6) * 6,
  );

  let multimodalCoverage = 20;
  if (suite.slideDeck.length > 0) multimodalCoverage += 20;
  if (suite.infographic.length > 0) multimodalCoverage += 20;
  if (suite.podcast.segments.length > 0) multimodalCoverage += 20;
  if (suite.video.shots.length > 0) multimodalCoverage += 20;
  multimodalCoverage = Math.min(multimodalCoverage, 100);

  const overall = Math.round(
    quizPerformance * 0.35 + sourceGrounding * 0.25 + retentionReadiness * 0.2 + multimodalCoverage * 0.2,
  );

  let recommendation = 'Strong lesson performance. Move to timed exam simulation.';
  if (overall < 70) recommendation = 'Revisit flashcards and repeat quiz before new topics.';
  if (overall < 50) recommendation = 'Review report misconceptions and rebuild foundations with teacher mode.';

  return {
    overall,
    breakdown: {
      sourceGrounding,
      quizPerformance,
      retentionReadiness,
      multimodalCoverage,
    },
    recommendation,
  };
};

export const buildPodcastTranscript = (segments: PodcastSegment[]) => {
  return segments
    .map((segment) => `Host: ${segment.hostLine}\nExpert: ${segment.expertLine}`)
    .join('\n\n');
};

export const buildFlashcardPromptBundle = (cards: Flashcard[]) => {
  return cards.map((card) => `Q: ${card.front}\nA: ${card.back}`).join('\n\n');
};
