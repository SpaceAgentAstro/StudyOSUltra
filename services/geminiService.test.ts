
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

import { streamChatResponse, generateExamPaper, gradeOpenEndedAnswer } from './geminiService';

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

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('generateExamPaper', () => {
    it('returns questions on success', async () => {
      const mockQuestions = [
        { id: '1', text: 'Test Q', type: 'MCQ', marks: 1, explanation: '', sourceCitation: '', difficulty: 'easy' }
      ];
      
      const mockResponse = {
        ok: true,
        json: async () => ({
          text: JSON.stringify(mockQuestions)
        })
      };

      (global.fetch as any).mockResolvedValueOnce(mockResponse);

      const result = await generateExamPaper('Biology', []);
      expect(result).toEqual(mockQuestions);
      expect(global.fetch).toHaveBeenCalledWith('/api/generate', expect.objectContaining({
          method: 'POST',
          body: expect.stringContaining('gemini-3-flash-preview')
      }));
    });

    it('returns empty array on error', async () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      (global.fetch as any).mockRejectedValueOnce(new Error('API Error'));

      const result = await generateExamPaper('Biology', []);
      expect(result).toEqual([]);
      expect(consoleErrorSpy).toHaveBeenCalled();
      consoleErrorSpy.mockRestore();
    });

    it('returns empty array on invalid schema', async () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const invalidResponse = [{ id: '1', type: 'WRONG_TYPE' }]; // Invalid enum
      mockGenerateContent.mockResolvedValueOnce({
        text: JSON.stringify(invalidResponse)
      });

      const result = await generateExamPaper('Biology', []);
      expect(result).toEqual([]);
      expect(consoleErrorSpy).toHaveBeenCalledWith("Exam Paper Validation Failed:", expect.any(Object));
      consoleErrorSpy.mockRestore();
    });
  });

  describe('generateKnowledgeGraph', () => {
    it('returns nodes on success', async () => {
      const mockNodes = [
        { id: '1', label: 'Node 1', category: 'Test', connections: [], mastery: 50 }
      ];
      mockGenerateContent.mockResolvedValueOnce({
        text: JSON.stringify(mockNodes)
      });
      const files: FileDocument[] = [{ id: '1', name: 'test.txt', type: 'txt', content: 'content', uploadDate: 0, status: 'ready' }];
      const result = await generateKnowledgeGraph(files);
      expect(result).toEqual(mockNodes);
    });

    it('handles invalid schema gracefully', async () => {
       const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
       // The LLM returns an object instead of an array
       const invalidResponse = { nodes: [] };
       mockGenerateContent.mockResolvedValueOnce({
         text: JSON.stringify(invalidResponse)
       });

       const files: FileDocument[] = [{ id: '1', name: 'test.txt', type: 'txt', content: 'content', uploadDate: 0, status: 'ready' }];
       const result = await generateKnowledgeGraph(files);

       // Now it should return empty array because validation failed
       expect(result).toEqual([]);
       expect(consoleErrorSpy).toHaveBeenCalledWith("Knowledge Graph Validation Failed:", expect.any(Object));
       consoleErrorSpy.mockRestore();
    });
  });

  describe('streamChatResponse', () => {
    it('streams content via onChunk callback', async () => {
        const streamData = [
            JSON.stringify({ text: 'Hello', candidates: [{ groundingMetadata: { groundingChunks: [] } }] }),
            JSON.stringify({ text: ' World', candidates: [{ groundingMetadata: { groundingChunks: [] } }] })
        ];

        const stream = new ReadableStream({
            start(controller) {
                const encoder = new TextEncoder();
                streamData.forEach(chunk => {
                    controller.enqueue(encoder.encode(chunk + "\n"));
                });
                controller.close();
            }
        });

        const mockResponse = {
            ok: true,
            body: stream
        };

        (global.fetch as any).mockResolvedValueOnce(mockResponse);

        const onChunk = vi.fn();

        await streamChatResponse({
            history: [],
            newMessage: 'Hi',
            files: [],
            mode: 'tutor',
            onChunk
        });

        expect(onChunk).toHaveBeenCalledTimes(2);
        expect(onChunk).toHaveBeenNthCalledWith(1, 'Hello', []);
        expect(onChunk).toHaveBeenNthCalledWith(2, ' World', []);
    });

    it('handles abortion via AbortSignal', async () => {
      (global.fetch as any).mockImplementation(async (url: string, options: any) => {
         if (options.signal?.aborted) {
             const err = new Error('Aborted');
             err.name = 'AbortError';
             throw err;
         }
         // Return a never-ending stream if not aborted
         return {
             ok: true,
             body: new ReadableStream({
                 start() {}
             })
         };
      });

      const onChunk = vi.fn();
      const controller = new AbortController();

      // Abort immediately
      controller.abort();

      await streamChatResponse({
        history: [],
        newMessage: 'Hi',
        files: [],
        mode: 'tutor',
        onChunk,
        signal: controller.signal
      });

      expect(onChunk).toHaveBeenCalledWith(expect.stringContaining("stopped by user"));
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
        onChunk,
        signal: controller.signal
      });

      // It should break immediately and not call onChunk
      expect(onChunk).not.toHaveBeenCalled();
    });
  });

  describe('gradeOpenEndedAnswer', () => {
    it('should return safe default when API returns malformed JSON', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      mockGenerateContent.mockResolvedValueOnce({
        text: "This is not JSON"
      });

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
      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });

    it('should return safe default when API throws an error', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      mockGenerateContent.mockRejectedValueOnce(new Error("API Failure"));

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
      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });
  });
});
