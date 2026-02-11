import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { streamChatResponse, generateExamPaper } from './geminiService';

// Mock Setup
const { mockGenerateContent, mockGenerateContentStream } = vi.hoisted(() => {
    return {
        mockGenerateContent: vi.fn(),
        mockGenerateContentStream: vi.fn(),
    };
});

vi.mock('@google/generative-ai', () => ({
    GoogleGenerativeAI: vi.fn(function() {
        return {
            getGenerativeModel: vi.fn().mockReturnValue({
                generateContent: mockGenerateContent,
                generateContentStream: mockGenerateContentStream,
            }),
        };
    }),
}));

describe('geminiService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.API_KEY = 'test-key';
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('generateExamPaper', () => {
    it('returns questions on success', async () => {
      const mockQuestions = [
        { id: '1', text: 'Test Q', type: 'MCQ', marks: 1, explanation: '', sourceCitation: '', difficulty: 'easy' }
      ];
      
      mockGenerateContent.mockResolvedValueOnce({
        response: { text: () => JSON.stringify(mockQuestions) }
      });

      const result = await generateExamPaper('Biology', []);
      expect(result).toEqual(mockQuestions);
      expect(mockGenerateContent).toHaveBeenCalled();
    });

    it('returns empty array on error', async () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      mockGenerateContent.mockRejectedValueOnce(new Error('API Error'));

      const result = await generateExamPaper('Biology', []);
      expect(result).toEqual([]);
      expect(consoleErrorSpy).toHaveBeenCalled();
      consoleErrorSpy.mockRestore();
    });
  });

  describe('streamChatResponse', () => {
    it('streams content via onChunk callback', async () => {
        const mockStream = {
            async *[Symbol.asyncIterator]() {
                yield { text: () => 'Hello', candidates: [{ groundingMetadata: {} }] };
                yield { text: () => ' World', candidates: [{ groundingMetadata: {} }] };
            }
        };
        mockGenerateContentStream.mockResolvedValueOnce({ stream: mockStream });

        const onChunk = vi.fn();

        await streamChatResponse({
            history: [],
            newMessage: 'Hi',
            files: [],
            mode: 'tutor',
            onChunk
        });

        expect(onChunk).toHaveBeenCalledTimes(2);
        expect(onChunk).toHaveBeenNthCalledWith(1, 'Hello', expect.anything());
        expect(onChunk).toHaveBeenNthCalledWith(2, ' World', expect.anything());
    });

    it('handles abortion via AbortSignal', async () => {
      const controller = new AbortController();
      controller.abort();

      const mockStream = {
          async *[Symbol.asyncIterator]() {
              yield { text: () => 'Should not be called' };
          }
      };
      mockGenerateContentStream.mockResolvedValueOnce({ stream: mockStream });

      const onChunk = vi.fn();

      await streamChatResponse({
        history: [],
        newMessage: 'Hi',
        files: [],
        mode: 'tutor',
        onChunk,
        signal: controller.signal
      });

      // It should break immediately and not call onChunk
      expect(onChunk).not.toHaveBeenCalled();
    });

    it('handles API errors gracefully', async () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const onChunk = vi.fn();
      const errorMsg = 'API Quota Exceeded';

      mockGenerateContentStream.mockRejectedValueOnce(new Error(errorMsg));

      await streamChatResponse({
        history: [],
        newMessage: 'Hi',
        files: [],
        mode: 'tutor',
        onChunk
      });

      expect(consoleErrorSpy).toHaveBeenCalled();
      expect(onChunk).toHaveBeenCalledWith(expect.stringContaining(errorMsg));

      consoleErrorSpy.mockRestore();
    });
  });
});
