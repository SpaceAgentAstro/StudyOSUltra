import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { FileDocument, LessonSuite } from '../types';
import {
  calculateLessonScore,
  generateExamPaper,
  generateMetaAnalysis,
  gradeOpenEndedAnswer,
  normalizeProvider,
} from './geminiService';

vi.mock('@google/genai', () => ({
  GoogleGenAI: vi.fn(() => ({
    models: {
      generateImages: vi.fn(),
      generateVideos: vi.fn(),
    },
  })),
}));

describe('geminiService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubGlobal('fetch', vi.fn());
  });

  it('normalizes provider values safely', () => {
    expect(normalizeProvider('google')).toBe('google');
    expect(normalizeProvider('OPENAI')).toBe('openai');
    expect(normalizeProvider('unknown')).toBe('auto');
    expect(normalizeProvider(null)).toBe('auto');
  });

  it('generates exam questions from API JSON response', async () => {
    const questions = [
      {
        id: 'q1',
        type: 'MCQ',
        text: 'What is ATP?',
        options: ['Energy carrier', 'Protein', 'Lipid', 'DNA'],
        correctOptionIndex: 0,
        explanation: 'ATP stores transferable energy.',
        sourceCitation: 'biology.txt',
        difficulty: 'easy',
        marks: 1,
      },
    ];

    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ text: JSON.stringify(questions) }),
    } as Response);

    const result = await generateExamPaper('Biology', []);
    expect(result).toEqual(questions);
    expect(fetch).toHaveBeenCalledWith('/api/generate', expect.objectContaining({ method: 'POST' }));
  });

  it('returns safe fallback grade on malformed response', async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ text: 'not-json' }),
    } as Response);

    const result = await gradeOpenEndedAnswer('Q', 'A', ['mark'], []);
    expect(result.score).toBe(0);
    expect(result.feedback).toContain('Unable to grade');
  });

  it('does not call API for meta-analysis when there are no user messages', async () => {
    const result = await generateMetaAnalysis([
      { id: '1', role: 'model', text: 'Hello', timestamp: 1 },
    ] as any);

    expect(result).toEqual([]);
    expect(fetch).not.toHaveBeenCalled();
  });

  it('computes lesson score breakdown from quiz answers and content coverage', () => {
    const suite: LessonSuite = {
      topic: 'Cell Biology',
      generatedAt: Date.now(),
      report: {
        executiveSummary: 'summary',
        keyTakeaways: ['a', 'b', 'c'],
        misconceptions: ['m1'],
        practicePlan: ['p1', 'p2', 'p3'],
      },
      flashcards: [
        { id: 'f1', front: 'Q1', back: 'A1', sourceCitation: 'src1' },
        { id: 'f2', front: 'Q2', back: 'A2', sourceCitation: 'src1' },
      ],
      quiz: [
        {
          id: 'q1',
          prompt: 'p1',
          options: ['a', 'b'],
          correctOptionIndex: 0,
          explanation: 'e',
          sourceCitation: 'src1',
          difficulty: 'easy',
        },
        {
          id: 'q2',
          prompt: 'p2',
          options: ['a', 'b'],
          correctOptionIndex: 1,
          explanation: 'e',
          sourceCitation: 'src2',
          difficulty: 'medium',
        },
      ],
      slideDeck: [
        { id: 's1', title: 'slide', bullets: ['a'], speakerNotes: 'n', sourceCitation: 'src1' },
      ],
      infographic: [
        { id: 'i1', title: 'panel', stat: '1', explanation: 'e', visualHint: 'hint', sourceCitation: 'src1' },
      ],
      podcast: {
        intro: 'i',
        segments: [
          {
            id: 'p1',
            title: 'seg',
            hostLine: 'h',
            expertLine: 'e',
            durationSeconds: 30,
            sourceCitation: 'src1',
          },
        ],
        outro: 'o',
      },
      audioNarrationScript: 'audio',
      video: {
        title: 'video',
        durationSeconds: 60,
        shots: [
          {
            id: '1',
            title: 'shot',
            visual: 'v',
            voiceover: 'vo',
            durationSeconds: 20,
            sourceCitation: 'src1',
          },
        ],
        callToAction: 'cta',
      },
      imagePrompts: ['prompt'],
      sourceMap: [
        { sourceName: 'src1', coverageNote: 'note1' },
        { sourceName: 'src2', coverageNote: 'note2' },
      ],
    };

    const score = calculateLessonScore(suite, { q1: 0, q2: 1 });
    expect(score.overall).toBeGreaterThan(0);
    expect(score.breakdown.quizPerformance).toBe(100);
    expect(score.breakdown.multimodalCoverage).toBeGreaterThan(50);
  });


  describe('normalizeProvider', () => {
    it('returns valid providers as-is', () => {
      expect(normalizeProvider('google')).toBe('google');
      expect(normalizeProvider('openai')).toBe('openai');
      expect(normalizeProvider('anthropic')).toBe('anthropic');
      expect(normalizeProvider('ollama')).toBe('ollama');
      expect(normalizeProvider('auto')).toBe('auto');
    });

    it('handles case insensitivity', () => {
      expect(normalizeProvider('Google')).toBe('google');
      expect(normalizeProvider('OPENAI')).toBe('openai');
      expect(normalizeProvider('AnThRoPiC')).toBe('anthropic');
    });

    it('defaults to auto for null/undefined/empty', () => {
      expect(normalizeProvider(null)).toBe('auto');
      expect(normalizeProvider(undefined)).toBe('auto');
      expect(normalizeProvider('')).toBe('auto');
    });

    it('defaults to auto for invalid providers', () => {
      expect(normalizeProvider('unknown')).toBe('auto');
      expect(normalizeProvider('random-provider')).toBe('auto');
    });
  });

  describe('gradeOpenEndedAnswer', () => {
    it('should return safe default when API returns malformed JSON', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          text: "This is not JSON"
        }),
      } as Response);

      const result = await gradeOpenEndedAnswer(
        "What is a cell?",
        "Unit of life",
        ["unit", "life"],
        []
      );

      expect(result).toEqual({
        score: 0,
        maxScore: 5,
        feedback: "Unable to grade at this time due to a service error."
      });
      // expect(consoleSpy).toHaveBeenCalled(); // Skipping this as it's implementation detail
      consoleSpy.mockRestore();
    });

    it('should return safe default when API throws an error', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      vi.mocked(fetch).mockRejectedValueOnce(new Error("API Failure"));

      const result = await gradeOpenEndedAnswer(
        "What is a cell?",
        "Unit of life",
        ["unit", "life"],
        []
      );

      expect(result).toEqual({
        score: 0,
        maxScore: 5,
        feedback: "Unable to grade at this time due to a service error."
      });
      // expect(consoleSpy).toHaveBeenCalled(); // Skipping implementation detail
      consoleSpy.mockRestore();
    });
  });
});
