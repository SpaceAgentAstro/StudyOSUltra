
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { generateGameQuestions } from './geminiService';

// Mock setup
const { mockGenerateContent } = vi.hoisted(() => {
  const mockGenerateContentStream = vi.fn();
  const mockGenerateContent = vi.fn();
  const mockGoogleGenAI = vi.fn(function (this: any) {
    this.models = {
      generateContentStream: mockGenerateContentStream,
      generateContent: mockGenerateContent,
    };
  });
  return { mockGenerateContentStream, mockGenerateContent, mockGoogleGenAI };
});

vi.mock('@google/genai', () => ({
  GoogleGenAI: vi.fn(function() {
      return {
          models: {
              generateContent: mockGenerateContent
          }
      }
  })
}));

describe('generateGameQuestions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.API_KEY = 'test-key';
  });

  it('generates correct prompt for MCQ_ARENA with count 3', async () => {
    mockGenerateContent.mockResolvedValueOnce({
      text: JSON.stringify([])
    });

    await generateGameQuestions('Biology', 'MCQ_ARENA', [], 3);

    const callArgs = mockGenerateContent.mock.calls[0][0];
    const promptText = callArgs.contents[1].parts[0].text;

    expect(promptText).toContain('3');
    expect(promptText).toContain('MCQ');
    expect(promptText).not.toContain('Open Ended');
  });

  it('generates correct prompt for EXPLAIN_TO_WIN with count 4', async () => {
    mockGenerateContent.mockResolvedValueOnce({
        text: JSON.stringify([])
    });

    await generateGameQuestions('Physics', 'EXPLAIN_TO_WIN', [], 4);

    const callArgs = mockGenerateContent.mock.calls[0][0];
    const promptText = callArgs.contents[1].parts[0].text;

    expect(promptText).toContain('4');
    expect(promptText).toContain('Open Ended');
    expect(promptText).not.toContain('MCQ');
  });
});
