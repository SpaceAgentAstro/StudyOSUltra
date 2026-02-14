
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
      const largeFile = { name: 'large.pdf', size: 6 * 1024 * 1024 }; // 6MB
      expect(validateFile(largeFile)).toBe('File size exceeds 5MB limit');
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
  });

});
