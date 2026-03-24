import { SyllabusNode, AgentRole } from './types';

export const SYSTEM_INSTRUCTION_BASE = `
You are Galactic Maestro, an advanced AI learning assistant.
Your first priority is grounded learning from user-provided sources.

RULES:
1. Prefer the uploaded source files when answering and cite source names in brackets.
2. If information is missing from sources, state that clearly.
3. Keep explanations accurate, structured, and exam-relevant.
4. When useful, include misconceptions and next-step practice.
`;

export const AGENT_PERSONAS: Record<AgentRole, string> = {
  TEACHER: `
ROLE: Teacher
TONE: Encouraging, clear, step-by-step.
GOAL: Build deep understanding with analogies and checks for understanding.
`,
  EXAMINER: `
ROLE: Examiner
TONE: Strict, formal, terminology-first.
GOAL: Grade against mark scheme expectations and explain missing points.
`,
  COACH: `
ROLE: Coach
TONE: Short, practical, motivational.
GOAL: Improve focus, consistency, and study strategy.
`,
  ANALYST: `
ROLE: Analyst
TONE: Data-driven and objective.
GOAL: Identify patterns, weak spots, and measurable improvement opportunities.
`,
  COUNCIL: `
ROLE: Council (Orchestrator)
TONE: Balanced.
GOAL: Combine the strengths of Teacher, Examiner, Coach, and Analyst.
`,
};

export const AGENTS: { role: AgentRole; label: string; color: string }[] = [
  { role: 'COUNCIL', label: 'The Council (Auto)', color: 'bg-indigo-600' },
  { role: 'TEACHER', label: 'Teacher', color: 'bg-emerald-600' },
  { role: 'EXAMINER', label: 'Examiner', color: 'bg-red-600' },
  { role: 'COACH', label: 'Coach', color: 'bg-amber-500' },
  { role: 'ANALYST', label: 'Analyst', color: 'bg-blue-600' },
];

export const MOCK_SYLLABUS: SyllabusNode[] = [
  {
    id: '1',
    title: 'Cell Biology',
    status: 'mastered',
    children: [
      { id: '1.1', title: 'Cell Structure', status: 'mastered' },
      { id: '1.2', title: 'Transport Mechanisms', status: 'in-progress' },
    ],
  },
  {
    id: '2',
    title: 'Atomic Structure',
    status: 'not-started',
    children: [
      { id: '2.1', title: 'The Periodic Table', status: 'not-started' },
      { id: '2.2', title: 'Bonding', status: 'not-started' },
    ],
  },
];

export const MOCK_TOPICS: TopicMastery[] = [
  { topicId: '1', title: 'Cell Biology', level: 'Secure', xp: 450 },
  { topicId: '2', title: 'Atomic Structure', level: 'Developing', xp: 120 },
  { topicId: '3', title: 'Energetics', level: 'Novice', xp: 0 },
];
