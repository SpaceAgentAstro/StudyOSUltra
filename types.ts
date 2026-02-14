
export interface FileDocument {
  id: string;
  name: string;
  type: 'pdf' | 'docx' | 'txt' | 'web';
  content: string; 
  uploadDate: number;
  status: 'processing' | 'ready' | 'error';
  progress?: number;
  errorMessage?: string;
}

export interface Message {
  id: string;
  role: 'user' | 'model';
  agent?: AgentRole; // Which agent spoke this?
  text: string;
  timestamp: number;
  attachments?: {
    type: 'image';
    url: string; 
    base64?: string;
  }[];
  citations?: Citation[];
  groundingUrls?: { title: string; uri: string }[];
  isThinking?: boolean;
}

export interface Citation {
  sourceId: string;
  sourceName: string;
  snippet: string;
  page?: number;
}

export enum AppView {
  DASHBOARD = 'DASHBOARD',
  CHAT = 'CHAT',
  FILES = 'FILES',
  SYLLABUS = 'SYLLABUS',
  GAME_CENTER = 'GAME_CENTER',
  EXAM_SIMULATOR = 'EXAM_SIMULATOR',
  SOCIAL_HUB = 'SOCIAL_HUB',
  // Phase 8 Views
  KNOWLEDGE_UNIVERSE = 'KNOWLEDGE_UNIVERSE',
  META_LEARNING = 'META_LEARNING',
  COGNITIVE_LAB = 'COGNITIVE_LAB'
}

export interface SyllabusNode {
  id: string;
  title: string;
  children?: SyllabusNode[];
  status: 'not-started' | 'in-progress' | 'mastered';
}

// --- PHASE 7: MULTI-AGENT & TWIN ---

export type AgentRole = 'TEACHER' | 'EXAMINER' | 'COACH' | 'ANALYST' | 'COUNCIL';

export interface DigitalTwin {
  knowledgeMap: Record<string, number>; // Topic ID -> 0-100 Mastery
  examSkills: {
    timeManagement: number;
    precision: number;
    reasoning: number;
  };
  weaknesses: string[]; // e.g., "Confuses Mitosis/Meiosis"
  recentMood: 'focused' | 'stressed' | 'confident';
}

// --- PHASE 8: COGNITIVE OS ---

export type LifeMode = 'STUDENT' | 'UNIVERSITY' | 'PROFESSIONAL' | 'RESEARCHER' | 'LIFE_LONG';

export interface KnowledgeNode {
  id: string;
  label: string;
  category: string;
  mastery: number; // 0-100
  connections: string[]; // IDs of connected nodes
  x?: number; // For visualization
  y?: number;
}

export interface MetaInsight {
  type: 'BIAS_DETECTED' | 'STRATEGY_SUGGESTION' | 'STRENGTH';
  title: string;
  description: string;
  timestamp: number;
}

export interface CognitiveExercise {
  id: string;
  title: string;
  skill: 'LOGIC' | 'FIRST_PRINCIPLES' | 'ARGUMENTATION' | 'LATERAL_THINKING';
  description: string;
  difficulty: 'Novice' | 'Adept' | 'Master';
}

export interface UserProfile {
  name: string;
  subjects: string[];
  goal: string;
  hasCompletedOnboarding: boolean;
  digitalTwin: DigitalTwin;
  // Phase 8 additions
  lifeMode: LifeMode;
  knowledgeGraph: KnowledgeNode[];
  metaInsights: MetaInsight[];
}

// --- EXAM & GAME TYPES ---

export type GameMode = 'MCQ_ARENA' | 'EXPLAIN_TO_WIN' | 'BOSS_BATTLE';

export interface Question {
  id: string;
  type: 'MCQ' | 'OPEN';
  text: string;
  options?: string[]; 
  correctOptionIndex?: number; 
  markScheme?: string[]; 
  explanation: string;
  sourceCitation: string;
  difficulty: 'easy' | 'medium' | 'hard';
  marks?: number;
}

export interface GameSession {
  id: string;
  mode: GameMode;
  questions: Question[];
  currentQuestionIndex: number;
  score: number;
  answers: { questionId: string; userAnswer: string; isCorrect: boolean; feedback?: string }[];
  status: 'active' | 'completed';
}

export interface ExamPaper {
  id: string;
  title: string;
  durationMinutes: number;
  totalMarks: number;
  questions: Question[];
}

export interface ExamSession {
  id: string;
  paperId: string;
  startTime: number;
  answers: Record<string, string>; // QuestionID -> Text
  status: 'in-progress' | 'submitted' | 'graded';
  gradeReport?: {
    totalScore: number;
    grade: string; // A, B, C...
    examinerCommentary: string;
  }
}

export interface TopicMastery {
  topicId: string;
  title: string;
  level: 'Novice' | 'Developing' | 'Secure' | 'Exam-Ready';
  xp: number;
}
