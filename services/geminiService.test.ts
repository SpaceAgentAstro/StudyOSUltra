
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

import { streamChatResponse, generateExamPaper, generateKnowledgeGraph } from './geminiService';
import { FileDocument } from '../types';

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
    });
  });
});
