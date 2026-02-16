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

export type AgentRole = 'TEACHER' | 'EXAMINER' | 'COACH' | 'ANALYST' | 'COUNCIL';

export interface Message {
  id: string;
  role: 'user' | 'model';
  agent?: AgentRole;
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
  LESSON_STUDIO = 'LESSON_STUDIO',
  CREATIVE_STUDIO = 'CREATIVE_STUDIO',
  FILES = 'FILES',
  SYLLABUS = 'SYLLABUS',
  GAME_CENTER = 'GAME_CENTER',
  EXAM_SIMULATOR = 'EXAM_SIMULATOR',
  SOCIAL_HUB = 'SOCIAL_HUB',
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

export interface DigitalTwin {
  knowledgeMap: Record<string, number>;
  examSkills: {
    timeManagement: number;
    precision: number;
    reasoning: number;
  };
  weaknesses: string[];
  recentMood: 'focused' | 'stressed' | 'confident';
}

export type LifeMode = 'STUDENT' | 'UNIVERSITY' | 'PROFESSIONAL' | 'RESEARCHER' | 'LIFE_LONG';

export interface KnowledgeNode {
  id: string;
  label: string;
  category: string;
  mastery: number;
  connections: string[];
  x?: number;
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
  lifeMode: LifeMode;
  knowledgeGraph: KnowledgeNode[];
  metaInsights: MetaInsight[];
}

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
  answers: Record<string, string>;
  status: 'in-progress' | 'submitted' | 'graded';
  gradeReport?: {
    totalScore: number;
    grade: string;
    examinerCommentary: string;
  };
}

export interface TopicMastery {
  topicId: string;
  title: string;
  level: 'Novice' | 'Developing' | 'Secure' | 'Exam-Ready';
  xp: number;
}

export type AuthProviderOption = 'google' | 'microsoft' | 'apple';

export interface AuthIdentity {
  uid: string;
  displayName: string | null;
  email: string | null;
  photoURL: string | null;
  providerId: string | null;
}

export type ModelProvider = 'google' | 'openai' | 'anthropic' | 'ollama' | 'auto';

export interface VideoPlanShot {
  id: string;
  title: string;
  visual: string;
  voiceover: string;
  durationSeconds: number;
  sourceCitation?: string;
}

export interface VideoPlan {
  title: string;
  durationSeconds: number;
  shots: VideoPlanShot[];
  callToAction: string;
}

export interface Flashcard {
  id: string;
  front: string;
  back: string;
  sourceCitation: string;
}

export interface QuizQuestion {
  id: string;
  prompt: string;
  options: string[];
  correctOptionIndex: number;
  explanation: string;
  sourceCitation: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface SlideOutline {
  id: string;
  title: string;
  bullets: string[];
  speakerNotes: string;
  sourceCitation: string;
}

export interface InfographicPanel {
  id: string;
  title: string;
  stat: string;
  explanation: string;
  visualHint: string;
  sourceCitation: string;
}

export interface PodcastSegment {
  id: string;
  title: string;
  hostLine: string;
  expertLine: string;
  durationSeconds: number;
  sourceCitation: string;
}

export interface LessonReport {
  executiveSummary: string;
  keyTakeaways: string[];
  misconceptions: string[];
  practicePlan: string[];
}

export interface LessonSourceMap {
  sourceName: string;
  coverageNote: string;
}

export interface LessonSuite {
  topic: string;
  generatedAt: number;
  report: LessonReport;
  flashcards: Flashcard[];
  quiz: QuizQuestion[];
  slideDeck: SlideOutline[];
  infographic: InfographicPanel[];
  podcast: {
    intro: string;
    segments: PodcastSegment[];
    outro: string;
  };
  audioNarrationScript: string;
  video: VideoPlan;
  imagePrompts: string[];
  sourceMap: LessonSourceMap[];
}

export interface LessonScoreBreakdown {
  sourceGrounding: number;
  quizPerformance: number;
  retentionReadiness: number;
  multimodalCoverage: number;
}

export interface LessonScore {
  overall: number;
  breakdown: LessonScoreBreakdown;
  recommendation: string;
}
