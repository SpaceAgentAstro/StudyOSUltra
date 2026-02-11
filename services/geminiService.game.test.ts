import { describe, it, expect, vi, beforeEach } from 'vitest';
import { generateGameQuestions } from './geminiService';

// Mock setup
const { mockGenerateContent } = vi.hoisted(() => {
  return { mockGenerateContent: vi.fn() };
});

vi.mock('@google/generative-ai', () => {
  return {
    GoogleGenerativeAI: vi.fn(function() {
      return {
        getGenerativeModel: vi.fn().mockReturnValue({
          generateContent: mockGenerateContent
        })
      };
    })
  };
});

describe('generateGameQuestions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.API_KEY = 'test-key';
  });

  it('generates correct prompt for MCQ_ARENA with count 3', async () => {
    mockGenerateContent.mockResolvedValueOnce({
      response: { text: () => JSON.stringify([]) }
    });

    await generateGameQuestions('Biology', 'MCQ_ARENA', [], 3);

    const callArgs = mockGenerateContent.mock.calls[0][0];
    // In new implementation: model.generateContent([contextString, prompt])
    // So callArgs is an array where [1] is the prompt.
    const promptText = callArgs[1];

    expect(promptText).toContain('3');
    expect(promptText).toContain('MCQ');
    // expect(promptText).not.toContain('Open Ended'); // Mix might include it?
    // "Generate 3 Multiple Choice Questions (MCQ)..."
  });

  it('generates correct prompt for EXPLAIN_TO_WIN with count 4', async () => {
    mockGenerateContent.mockResolvedValueOnce({
        response: { text: () => JSON.stringify([]) }
    });

    await generateGameQuestions('Physics', 'EXPLAIN_TO_WIN', [], 4);

    const callArgs = mockGenerateContent.mock.calls[0][0];
    const promptText = callArgs[1];

    expect(promptText).toContain('4');
    expect(promptText).toContain('Open Ended');
    // expect(promptText).not.toContain('MCQ');
  });
});
