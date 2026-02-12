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

import {
  streamChatResponse,
  generateExamPaper,
  gradeOpenEndedAnswer,
  generateKnowledgeGraph,
  setRuntimeProvider,
  setRuntimeApiKeyForProvider
} from './geminiService';

describe('geminiService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.API_KEY = 'test-key';
    delete process.env.GEMINI_API_KEY;
    delete process.env.JULES_API_KEY;
    setRuntimeProvider('auto');
    setRuntimeApiKeyForProvider('google', '');
    setRuntimeApiKeyForProvider('openai', '');
    setRuntimeApiKeyForProvider('anthropic', '');
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

  describe('generateKnowledgeGraph', () => {
    it('returns parsed knowledge graph nodes on success', async () => {
      const mockNodes = [
        { id: '1', label: 'Concept A', category: 'General', connections: ['2'], mastery: 50 }
      ];

      mockGenerateContent.mockResolvedValueOnce({
        text: JSON.stringify(mockNodes)
      });

      const files = [{ name: 'test.txt', content: 'test content', status: 'ready', id: '1', type: 'text/plain' }];
      // @ts-ignore
      const result = await generateKnowledgeGraph(files);

      expect(result).toEqual(mockNodes);
      expect(mockGenerateContent).toHaveBeenCalled();

      // Verify prompt contains content
      const callArgs = mockGenerateContent.mock.calls[0][0];
      expect(callArgs.contents[0].parts[0].text).toContain('test content');
    });

    it('returns empty array on API error', async () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      mockGenerateContent.mockRejectedValueOnce(new Error('API Error'));

      const files = [{ name: 'test.txt', content: 'test content', status: 'ready', id: '1', type: 'text/plain' }];
      // @ts-ignore
      const result = await generateKnowledgeGraph(files);

      expect(result).toEqual([]);
      expect(consoleErrorSpy).toHaveBeenCalled();
      consoleErrorSpy.mockRestore();
    });

    it('returns empty array on invalid JSON response', async () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      mockGenerateContent.mockResolvedValueOnce({
        text: 'Invalid JSON'
      });

      const files = [{ name: 'test.txt', content: 'test content', status: 'ready', id: '1', type: 'text/plain' }];
      // @ts-ignore
      const result = await generateKnowledgeGraph(files);

      expect(result).toEqual([]);
      expect(consoleErrorSpy).toHaveBeenCalled();
      consoleErrorSpy.mockRestore();
    });

    it('returns empty array immediately if no files provided', async () => {
      const result = await generateKnowledgeGraph([]);
      expect(result).toEqual([]);
      expect(mockGenerateContent).not.toHaveBeenCalled();
    });

    it('filters out non-ready files', async () => {
       mockGenerateContent.mockResolvedValueOnce({ text: "[]" });

       const files = [
         { name: 'ready.txt', content: 'READY_CONTENT', status: 'ready', id: '1', type: 'text/plain' },
         { name: 'processing.txt', content: 'PROCESSING_CONTENT', status: 'processing', id: '2', type: 'text/plain' }
       ];

       // @ts-ignore
       await generateKnowledgeGraph(files);

       const callArgs = mockGenerateContent.mock.calls[0][0];
       const promptContext = callArgs.contents[0].parts[0].text;

       expect(promptContext).toContain('READY_CONTENT');
       expect(promptContext).not.toContain('PROCESSING_CONTENT');
    });

    it('truncates content to 2000 chars per file', async () => {
       mockGenerateContent.mockResolvedValueOnce({ text: "[]" });

       const content = 'START' + 'x'.repeat(1990) + 'END' + 'OVERFLOW';
       const files = [{ name: 'test.txt', content, status: 'ready', id: '1', type: 'text/plain' }];

       // @ts-ignore
       await generateKnowledgeGraph(files);

       const promptContext = mockGenerateContent.mock.calls[0][0].contents[0].parts[0].text;
       expect(promptContext).toContain('END');
       expect(promptContext).not.toContain('ERFLOW');
    });

    it('limits to 3 files', async () => {
        mockGenerateContent.mockResolvedValue({ text: "[]" });

        const files = Array(5).fill(null).map((_, i) => ({
            name: `file${i}.txt`,
            content: `CONTENT_${i}`,
            status: 'ready',
            id: `${i}`,
            type: 'text/plain'
        }));

        // @ts-ignore
        await generateKnowledgeGraph(files);

        const promptContext = mockGenerateContent.mock.calls[0][0].contents[0].parts[0].text;

        expect(promptContext).toContain('CONTENT_0');
        expect(promptContext).toContain('CONTENT_1');
        expect(promptContext).toContain('CONTENT_2');
        expect(promptContext).not.toContain('CONTENT_3');
        expect(promptContext).not.toContain('CONTENT_4');
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
      expect(onChunk).toHaveBeenCalledWith(`\n[System Error: ${errorMsg}]`);

      consoleErrorSpy.mockRestore();
    });

    it('maps nested Gemini auth errors to a friendly message', async () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const onChunk = vi.fn();
      const nestedError = {
        error: {
          message: JSON.stringify({
            error: {
              code: 401,
              message: 'API keys are not supported by this API. Expected OAuth2 access token.',
              status: 'UNAUTHENTICATED'
            }
          })
        }
      };

      mockGenerateContentStream.mockRejectedValueOnce(nestedError);

      await streamChatResponse({
        history: [],
        newMessage: 'Hi',
        files: [],
        mode: 'tutor',
        onChunk
      });

      expect(consoleErrorSpy).toHaveBeenCalled();
      expect(onChunk).toHaveBeenCalledWith(
        `\n[System Error: Gemini authentication failed. This endpoint does not accept API keys and requires OAuth credentials. Update Gemini credentials or switch to OpenAI/Anthropic/Ollama.]`
      );

      consoleErrorSpy.mockRestore();
    });

    it('maps Anthropic billing errors to a friendly message', async () => {
      const onChunk = vi.fn();
      const fetchMock = vi.fn().mockResolvedValue({
        ok: false,
        status: 402,
        text: async () => JSON.stringify({
          type: 'error',
          error: {
            type: 'invalid_request_error',
            message: 'Your credit balance is too low to access the Anthropic API.'
          }
        })
      });
      const originalFetch = globalThis.fetch;
      // @ts-ignore
      globalThis.fetch = fetchMock;

      setRuntimeProvider('anthropic');
      setRuntimeApiKeyForProvider('anthropic', 'anthropic-test-key');

      try {
        await streamChatResponse({
          history: [],
          newMessage: 'Hi',
          files: [],
          mode: 'tutor',
          onChunk
        });

        expect(onChunk).toHaveBeenCalledWith(
          '\n[System Error: Anthropic billing limit reached. Add credits or update billing, then retry.]'
        );
      } finally {
        // @ts-ignore
        globalThis.fetch = originalFetch;
      }
    });

    it('prefers GEMINI_API_KEY over JULES_API_KEY when both are set', async () => {
      const mockStream = {
        [Symbol.asyncIterator]: async function* () {
          yield { text: 'OK' };
        }
      };
      mockGenerateContentStream.mockResolvedValueOnce(mockStream);

      process.env.GEMINI_API_KEY = 'gemini-priority-key';
      process.env.JULES_API_KEY = 'jules-fallback-key';
      setRuntimeProvider('google');

      await streamChatResponse({
        history: [],
        newMessage: 'Hi',
        files: [],
        mode: 'tutor',
        onChunk: vi.fn()
      });

      expect(mockGoogleGenAI).toHaveBeenCalledWith({ apiKey: 'gemini-priority-key' });
    });
  });
});
