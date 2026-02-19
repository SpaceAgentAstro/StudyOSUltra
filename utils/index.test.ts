
import { describe, it, expect } from 'vitest';
import { formatTime, calculateAccuracy, generateId, validateFile } from './index';

describe('Utility Functions', () => {
  
  describe('formatTime', () => {
    it('formats seconds into MM:SS correctly', () => {
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
    it('generates a valid UUID', () => {
      const id = generateId();
      expect(typeof id).toBe('string');
      expect(id.length).toBe(36);
      expect(id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i);
    });

    it('generates unique ids', () => {
      const id1 = generateId();
      const id2 = generateId();
      expect(id1).not.toBe(id2);
    });
  });

  describe('validateFile', () => {
    it('returns valid for allowed file type and size', () => {
      const file = { name: 'test.txt', size: 1024 } as File;
      expect(validateFile(file)).toEqual({ isValid: true });
    });

    it('returns error for invalid file extension', () => {
      const file = { name: 'test.exe', size: 1024 } as File;
      const result = validateFile(file);
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('Invalid file type: .exe');
    });

    it('returns error for file without extension', () => {
      const file = { name: 'testfile', size: 1024 } as File;
      const result = validateFile(file);
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('no extension');
    });

    it('returns error for file exceeding size limit', () => {
      const file = { name: 'large.pdf', size: 501 * 1024 * 1024 } as File;
      const result = validateFile(file);
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('exceeds the 500MB size limit');
    });

    it('is case-insensitive for extensions', () => {
      const file = { name: 'TEST.PDF', size: 1024 } as File;
      expect(validateFile(file)).toEqual({ isValid: true });
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

});
