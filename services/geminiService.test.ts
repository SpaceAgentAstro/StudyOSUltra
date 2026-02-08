
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { streamChatResponse, generateExamPaper } from './geminiService';

describe('geminiService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn();
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
  });
});
