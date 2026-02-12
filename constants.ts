import { SyllabusNode, AgentRole } from './types';

export const SYSTEM_INSTRUCTION_BASE = `
You are Study OS, an advanced, hallucination-proof AI tutor. 
Your core directive is GROUNDING. 

RULES:
1. Answer ONLY based on the provided "User Files" and "Context".
2. If the answer is not in the context, strictly state: "I could not find information regarding this in your source materials."
3. When you make a claim, you MUST cite the source filename in brackets, e.g., "Mitochondria are the powerhouse of the cell [Biology_Chapter_1.pdf]".
`;

export const AGENT_PERSONAS = {
  TEACHER: `
    ROLE: The Teacher.
    TONE: Encouraging, clear, uses analogies and step-by-step breakdowns.
    GOAL: Ensure deep understanding. Use Socratic questioning if the user is stuck.
  `,
  EXAMINER: `
    ROLE: The Examiner.
    TONE: Strict, formal, pedantic about terminology.
    GOAL: Assess against mark schemes. Rejects vague answers. Highlights "Command Words" (Explain vs Describe).
  `,
  COACH: `
    ROLE: The Performance Coach.
    TONE: Motivational, concise, focus on strategy and mindset.
    GOAL: Manage burnout, suggest breaks, optimize revision strategy. Keep answers short and actionable.
  `,
  ANALYST: `
    ROLE: The Data Analyst.
    TONE: Objective, data-driven.
    GOAL: Point out patterns in mistakes. Reference the user's "Digital Twin" history (e.g., "You often miss marks on calculation questions").
  `,
  COUNCIL: `
    ROLE: The Council (Orchestrator).
    TONE: Balanced.
    GOAL: Synthesize the best response. If the user asks a concept question, explain like a Teacher but add an Examiner warning about pitfalls.
  `
};

export const AGENTS: {role: AgentRole, label: string, color: string}[] = [
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
    ]
  },
  {
    id: '2',
    title: 'Atomic Structure',
    status: 'not-started',
    children: [
      { id: '2.1', title: 'The Periodic Table', status: 'not-started' },
      { id: '2.2', title: 'Bonding', status: 'not-started' },
    ]
  }
];
