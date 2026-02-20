
import { describe, it, expect } from 'vitest';
import { formatTime, calculateAccuracy, generateId } from './index';

describe('Utility Functions', () => {
  
  describe('formatTime', () => {
    it('formats seconds into MM:SS string', () => {
      expect(formatTime(0)).toBe('0:00');
      expect(formatTime(59)).toBe('0:59');
      expect(formatTime(60)).toBe('1:00');
      expect(formatTime(65)).toBe('1:05');
      expect(formatTime(600)).toBe('10:00');
    });

    it('handles negative numbers gracefully', () => {
      expect(formatTime(-5)).toBe('0:00');
    });

    it('handles floating point numbers', () => {
      expect(formatTime(65.5)).toBe('1:05');
    });
  });

  describe('calculateAccuracy', () => {
    it('calculates percentage correctly', () => {
      expect(calculateAccuracy(5, 10)).toBe(50);
      expect(calculateAccuracy(1, 3)).toBe(33); // 33.333... rounded
      expect(calculateAccuracy(2, 3)).toBe(67); // 66.666... rounded
      expect(calculateAccuracy(10, 10)).toBe(100);
      expect(calculateAccuracy(0, 10)).toBe(0);
    });

    it('returns 0 when total is 0 to avoid Infinity/NaN', () => {
      expect(calculateAccuracy(5, 0)).toBe(0);
      expect(calculateAccuracy(0, 0)).toBe(0);
    });
  });

  describe('generateId', () => {
    it('generates a string of correct length', () => {
      const id = generateId();
      expect(typeof id).toBe('string');
      expect(id.length).toBeGreaterThan(0);
    });

    it('generates unique ids', () => {
      const id1 = generateId();
      const id2 = generateId();
      expect(id1).not.toBe(id2);
    });
  });

  describe('validateFile', () => {
    const validFile = { name: 'document.pdf', size: 1024 * 1024 }; // 1MB

    it('returns null for valid file', () => {
      expect(validateFile(validFile)).toBeNull();
    });

    it('returns error for file exceeding size limit', () => {
      const largeFile = { name: 'large.pdf', size: 501 * 1024 * 1024 }; // 501MB
      expect(validateFile(largeFile)).toBe('File size exceeds 500 MB per-file limit');
    });

    it('returns error for invalid file extension', () => {
      const invalidExtFile = { name: 'script.js', size: 1024 };
      expect(validateFile(invalidExtFile)).toContain('File type not supported');
    });

    it('returns error for file without extension', () => {
      const noExtFile = { name: 'README', size: 1024 };
      expect(validateFile(noExtFile)).toContain('File type not supported');
    });

    it('allows all supported extensions', () => {
      const extensions = ['.txt', '.md', '.csv', '.json', '.pdf', '.docx'];
      extensions.forEach(ext => {
        expect(validateFile({ name: `test${ext}`, size: 100 })).toBeNull();
      });
    });

    it('checks extension case-insensitively', () => {
      expect(validateFile({ name: 'TEST.PDF', size: 100 })).toBeNull();
    });

    it('allows zero-byte files when extension and size constraints pass', () => {
      const file = { name: 'empty.txt', size: 0 };
      expect(validateFile(file)).toBeNull();
    });

    it('ignores MIME type and validates by extension + size only', () => {
      const file = { name: 'test.pdf', size: 1024, type: 'text/html' } as File;
      expect(validateFile(file)).toBeNull();
    });
  });


  describe('readFile', () => {
    it('reads a file as text', async () => {
      const file = new File(['Hello, world!'], 'test.txt', { type: 'text/plain' });
      const { readFile } = await import('./index');
      const content = await readFile(file, 'text');
      expect(content).toBe('Hello, world!');
    });

    it('reads a file as dataURL', async () => {
      const file = new File(['Hello'], 'test.txt', { type: 'text/plain' });
      const { readFile } = await import('./index');
      const content = await readFile(file, 'dataURL');
      expect((content as string).startsWith('data:text/plain;base64,')).toBe(true);
    });

    it('reads a file as arrayBuffer', async () => {
      const file = new File(['Hello'], 'test.txt', { type: 'text/plain' });
      const { readFile } = await import('./index');
      const content = await readFile(file, 'arrayBuffer');
      expect(content).toBeInstanceOf(ArrayBuffer);
      expect(new Uint8Array(content as ArrayBuffer).length).toBe(5);
    });
  });


  describe('readFile', () => {
    it('reads file as text by default', async () => {
      const file = new File(['hello world'], 'test.txt', { type: 'text/plain' });
      const content = await readFile(file);
      expect(content).toBe('hello world');
    });

    it('reads file as dataURL', async () => {
      const file = new File(['hello'], 'test.txt', { type: 'text/plain' });
      const content = await readFile(file, 'dataURL');
      expect((content as string).startsWith('data:text/plain;base64,')).toBe(true);
    });

    it('reads file as arrayBuffer', async () => {
      const file = new File(['hello'], 'test.txt', { type: 'text/plain' });
      const content = await readFile(file, 'arrayBuffer');
      expect(content).toBeInstanceOf(ArrayBuffer);
      const decoder = new TextDecoder();
      expect(decoder.decode(content as ArrayBuffer)).toBe('hello');
    });

    it('handles read errors', async () => {
      // Mocking FileReader to simulate error
      const originalFileReader = global.FileReader;
      global.FileReader = class MockFileReader {
        readAsText() {
          setTimeout(() => {
            if (this.onerror) {
                // @ts-ignore
                this.error = { message: 'Mock error' };
                // @ts-ignore
                this.onerror(new Event('error'));
            }
          }, 0);
        }
        onload = null;
        onerror = null;
        result = null;
        error = null;
      } as any;

      const file = new File([''], 'test.txt');
      await expect(readFile(file)).rejects.toThrow('File reading error: Mock error');

      global.FileReader = originalFileReader;
    });
  });


  describe('extractJsonText', () => {
    it('returns null for empty or whitespace-only input', () => {
      expect(extractJsonText('')).toBeNull();
      expect(extractJsonText('   ')).toBeNull();
    });

    it('extracts JSON from markdown code blocks', () => {
      const input = 'Here is some json:\n```json\n{"key": "value"}\n```';
      expect(extractJsonText(input)).toBe('{"key": "value"}');
    });

    it('extracts JSON from code blocks without language identifier', () => {
      const input = '```\n{"key": "value"}\n```';
      expect(extractJsonText(input)).toBe('{"key": "value"}');
    });

    it('extracts JSON object from text', () => {
      const input = 'Some text {"key": "value"} more text';
      expect(extractJsonText(input)).toBe('{"key": "value"}');
    });

    it('extracts JSON array from text', () => {
      const input = 'Some text ["value1", "value2"] more text';
      expect(extractJsonText(input)).toBe('["value1", "value2"]');
    });

    it('returns null if no JSON found', () => {
      const input = 'Just some text without braces';
      expect(extractJsonText(input)).toBeNull();
    });
  });

  describe('parseJsonSafely', () => {
    it('parses valid JSON directly', () => {
      const input = '{"key": "value"}';
      expect(parseJsonSafely(input, {})).toEqual({ key: 'value' });
    });

    it('extracts and parses JSON from text', () => {
      const input = 'Text with {"key": "value"} inside';
      expect(parseJsonSafely(input, {})).toEqual({ key: 'value' });
    });

    it('returns fallback on failure', () => {
      const input = 'Invalid JSON';
      expect(parseJsonSafely(input, { fallback: true })).toEqual({ fallback: true });
    });
  });

  describe('extractJsonText', () => {
    it('returns null for empty or whitespace string', () => {
      expect(extractJsonText('')).toBeNull();
      expect(extractJsonText('   ')).toBeNull();
    });

    it('extracts JSON from markdown code block', () => {
      const input = 'Here is some json:\n```json\n{"key": "value"}\n```';
      expect(extractJsonText(input)).toBe('{"key": "value"}');
    });

    it('extracts JSON from code block without language', () => {
      const input = '```\n{"key": "value"}\n```';
      expect(extractJsonText(input)).toBe('{"key": "value"}');
    });

    it('extracts JSON array from text', () => {
      const input = 'Some text [1, 2, 3] end text';
      expect(extractJsonText(input)).toBe('[1, 2, 3]');
    });

    it('extracts JSON object from text', () => {
      const input = 'Some text {"a": 1} end text';
      expect(extractJsonText(input)).toBe('{"a": 1}');
    });
  });

  describe('parseJsonSafely', () => {
    it('parses valid JSON string directly', () => {
      const result = parseJsonSafely('{"a": 1}', {});
      expect(result).toEqual({ a: 1 });
    });

    it('extracts and parses JSON from text', () => {
      const input = 'Text ```{"a": 1}```';
      const result = parseJsonSafely(input, {});
      expect(result).toEqual({ a: 1 });
    });

    it('returns fallback if parsing fails', () => {
      const result = parseJsonSafely('invalid json', { fallback: true });
      expect(result).toEqual({ fallback: true });
    });

    it('returns fallback if extraction fails', () => {
      const result = parseJsonSafely('no json here', { fallback: true });
      expect(result).toEqual({ fallback: true });
    });
  });

});
