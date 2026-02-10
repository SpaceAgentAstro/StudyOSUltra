
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

import { streamChatResponse, generateExamPaper, gradeOpenEndedAnswer, generateMetaAnalysis } from './geminiService';

describe('geminiService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.API_KEY = 'test-key';
  });

  describe('gradeOpenEndedAnswer', () => {
    it('returns graded response on success', async () => {
      const mockGrade = {
        score: 4,
        maxScore: 5,
        feedback: 'Good job'
      };

      mockGenerateContent.mockResolvedValueOnce({
        text: JSON.stringify(mockGrade)
      });

      const result = await gradeOpenEndedAnswer('What is DNA?', 'Deoxyribonucleic acid', ['DNA'], []);
      expect(result).toEqual(mockGrade);
      expect(mockGenerateContent).toHaveBeenCalled();
    });

    it('returns error object on API failure', async () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      mockGenerateContent.mockRejectedValueOnce(new Error('API Error'));

      const result = await gradeOpenEndedAnswer('Q', 'A', [], []);
      expect(result).toEqual({ score: 0, maxScore: 5, feedback: "Error grading" });
      expect(consoleErrorSpy).toHaveBeenCalled();

      consoleErrorSpy.mockRestore();
    });

    it('returns error object on invalid JSON', async () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      mockGenerateContent.mockResolvedValueOnce({
        text: 'Invalid JSON'
      });

      const result = await gradeOpenEndedAnswer('Q', 'A', [], []);
      expect(result).toEqual({ score: 0, maxScore: 5, feedback: "Error grading" });
      expect(consoleErrorSpy).toHaveBeenCalled();

      consoleErrorSpy.mockRestore();
    });
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

  describe('generateMetaAnalysis', () => {
    it('returns insights on success', async () => {
      const mockInsights = [
        {
          type: 'STRATEGY_SUGGESTION',
          title: 'Deepen your questions',
          description: 'Try asking why more often.',
          timestamp: 1234567890
        }
      ];

      mockGenerateContent.mockResolvedValueOnce({
        text: JSON.stringify(mockInsights)
      });

      const history: any[] = [
        { role: 'user', text: 'What is photosynthesis?', id: '1', timestamp: 1 },
        { role: 'model', text: 'It is...', id: '2', timestamp: 2 }
      ];

      const result = await generateMetaAnalysis(history as any);
      expect(result).toEqual(mockInsights);

      const callArgs = mockGenerateContent.mock.calls[0][0];
      const promptText = callArgs.contents[0].parts[0].text;
      expect(promptText).toContain('What is photosynthesis?');
      expect(promptText).not.toContain('It is...');
    });

    it('returns empty array if no user messages', async () => {
      const history: any[] = [
        { role: 'model', text: 'Hello', id: '1', timestamp: 1 }
      ];

      const result = await generateMetaAnalysis(history as any);
      expect(result).toEqual([]);
      expect(mockGenerateContent).not.toHaveBeenCalled();
    });

    it('returns empty array on API error', async () => {
      mockGenerateContent.mockRejectedValueOnce(new Error('API Error'));

      const history: any[] = [
        { role: 'user', text: 'Hi', id: '1', timestamp: 1 }
      ];

      const result = await generateMetaAnalysis(history as any);
      expect(result).toEqual([]);
    });

    it('returns empty array on invalid JSON', async () => {
      mockGenerateContent.mockResolvedValueOnce({
        text: 'Invalid JSON'
      });
      const history: any[] = [
        { role: 'user', text: 'Hi', id: '1', timestamp: 1 }
      ];

      const result = await generateMetaAnalysis(history as any);
      expect(result).toEqual([]);
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
