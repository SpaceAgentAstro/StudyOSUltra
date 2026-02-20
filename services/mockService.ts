import { FileDocument, Message, Question, KnowledgeNode, MetaInsight, CognitiveExercise } from "../types";

export const buildLocalKnowledgeGraph = (files: FileDocument[]): KnowledgeNode[] => {
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

export const buildLocalMetaInsights = (history: Message[]): MetaInsight[] => {
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

export const buildLocalCognitiveExercises = (): CognitiveExercise[] => ([
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

export const buildLocalExamPaper = (topic: string, files: FileDocument[]): Question[] => {
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

export const gradeOpenEndedAnswerLocally = (
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

export const encodeBase64 = (value: string): string => {
  if (typeof btoa === 'function') return btoa(value);
  // Node test/runtime fallback
  if (typeof Buffer !== 'undefined') return Buffer.from(value, 'utf-8').toString('base64');
  return '';
};

export const buildPlaceholderImage = (prompt: string) => {
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
  return `data:image/svg+xml;base64,${encodeBase64(svg)}`;
};
