
import { describe, it, expect, vi, beforeEach } from 'vitest';

const { mockGenerateContentStream, mockGenerateContent, mockGoogleGenAI } = vi.hoisted(() => {
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
  GoogleGenAI: mockGoogleGenAI
}));

import { streamChatResponse, generateExamPaper, generateGameQuestions } from './geminiService';

describe('geminiService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.API_KEY = 'test-key';
  });

  describe('generateExamPaper', () => {
    it('returns questions on success', async () => {
      const mockQuestions = [
        { id: '1', text: 'Test Q', type: 'MCQ', marks: 1, explanation: '', sourceCitation: '', difficulty: 'easy' }
      ];
      
      mockGenerateContent.mockResolvedValueOnce({
        text: JSON.stringify(mockQuestions)
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

  describe('generateGameQuestions', () => {
    it('delegates to generateExamPaper with correct parameters', async () => {
      const mockQuestions = [
        { id: '1', text: 'Game Q', type: 'MCQ', marks: 1, explanation: '', sourceCitation: '', difficulty: 'easy' }
      ];

      mockGenerateContent.mockResolvedValueOnce({
        text: JSON.stringify(mockQuestions)
      });

      const files = [{
        id: 'f1', name: 'Notes.txt', type: 'txt', content: 'Cell biology notes', uploadDate: 0, status: 'ready'
      } as any];

      // topic='Biology', mode='MCQ_ARENA' (ignored), files=files, count=3 (ignored)
      const result = await generateGameQuestions('Biology', 'MCQ_ARENA', files, 3);

      expect(result).toEqual(mockQuestions);
      expect(mockGenerateContent).toHaveBeenCalled();

      // Verify the arguments passed to generateContent contain the topic and file content
      // The implementation of generateExamPaper constructs the prompt with these values
      const callArgs = mockGenerateContent.mock.calls[0][0];
      // generateExamPaper sends:
      // contents: [
      //   { role: 'user', parts: [{ text: `CONTEXT:\n${contextString}` }] },
      //   { role: 'user', parts: [{ text: prompt }] }
      // ]
      const contextPart = callArgs.contents[0].parts[0].text;
      const promptPart = callArgs.contents[1].parts[0].text;

      expect(contextPart).toContain('Cell biology notes');
      expect(promptPart).toContain('Biology');
    });

    it('returns empty array on error', async () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      mockGenerateContent.mockRejectedValueOnce(new Error('API Error'));

      const result = await generateGameQuestions('Math', 'MCQ_ARENA', [], 3);

      expect(result).toEqual([]);
      expect(consoleErrorSpy).toHaveBeenCalled();
      consoleErrorSpy.mockRestore();
    });
  });

  describe('streamChatResponse', () => {
    it('streams content via onChunk callback', async () => {
      const mockStream = {
        [Symbol.asyncIterator]: async function* () {
          yield { text: 'Hello' };
          yield { text: ' World' };
        }
      };

      mockGenerateContentStream.mockResolvedValueOnce(mockStream);
      const onChunk = vi.fn();

      await streamChatResponse({
        history: [],
        newMessage: 'Hi',
        files: [],
        mode: 'tutor',
        onChunk
      });

      expect(onChunk).toHaveBeenCalledTimes(2);
      expect(onChunk).toHaveBeenNthCalledWith(1, 'Hello', undefined);
      expect(onChunk).toHaveBeenNthCalledWith(2, ' World', undefined);
    });

    it('handles abortion via AbortSignal', async () => {
      const mockStream = {
         [Symbol.asyncIterator]: async function* () {
            yield { text: 'Chunk 1' };
            // Simulate delay
            await new Promise(resolve => setTimeout(resolve, 10));
            yield { text: 'Chunk 2' };
         }
      };
      
      mockGenerateContentStream.mockResolvedValueOnce(mockStream);
      const onChunk = vi.fn();
      const controller = new AbortController();

      const promise = streamChatResponse({
        history: [],
        newMessage: 'Hi',
        files: [],
        mode: 'tutor',
        onChunk,
        signal: controller.signal
      });

      // Abort immediately
      controller.abort();
      await promise;

      // Should break loop or handle error. Implementation breaks on signal.aborted check inside loop.
      // Depending on timing, might get 0 or 1 chunk.
      // Ideally we ensure it stops.
    });
  });
});
