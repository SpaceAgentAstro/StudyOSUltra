import { describe, it, expect, vi } from 'vitest';

// Mock the external dependency to prevent issues during import
vi.mock('@google/genai', () => ({
  GoogleGenAI: vi.fn()
}));

import { extractNestedErrorMessage } from './geminiService';

describe('extractNestedErrorMessage', () => {
  describe('Basic Types', () => {
    it('returns null for null or undefined', () => {
      expect(extractNestedErrorMessage(null)).toBeNull();
      expect(extractNestedErrorMessage(undefined)).toBeNull();
    });

    it('returns null for empty strings or whitespace', () => {
      expect(extractNestedErrorMessage('')).toBeNull();
      expect(extractNestedErrorMessage('   ')).toBeNull();
    });

    it('returns the string itself if it is a simple message', () => {
      expect(extractNestedErrorMessage('Simple error')).toBe('Simple error');
    });
  });

  describe('JSON Strings', () => {
    it('parses JSON string and extracts message from object', () => {
      const json = JSON.stringify({ message: 'Error inside JSON' });
      expect(extractNestedErrorMessage(json)).toBe('Error inside JSON');
    });

    it('parses JSON string and extracts message from nested error object', () => {
      const json = JSON.stringify({ error: { message: 'Nested error inside JSON' } });
      expect(extractNestedErrorMessage(json)).toBe('Nested error inside JSON');
    });

    it('handles invalid JSON string gracefully by returning the string itself', () => {
      const invalidJson = '{ invalid: json ';
      expect(extractNestedErrorMessage(invalidJson)).toBe(invalidJson.trim());
    });

    it('handles JSON that resolves to null/empty string by returning original string', () => {
        // If the JSON is valid but results in null extraction, it falls back to the original string
        const json = JSON.stringify({ random: 'value' });
        // Logic: returns extractNestedErrorMessage(parsed) || trimmed;
        // extractNestedErrorMessage({ random: 'value' }) -> null. So returns trimmed original.
        expect(extractNestedErrorMessage(json)).toBe(json);
    });
  });

  describe('Error Objects', () => {
    it('extracts message from Error object', () => {
      const error = new Error('Standard error message');
      expect(extractNestedErrorMessage(error)).toBe('Standard error message');
    });

    it('recursively extracts if Error.message is a JSON string', () => {
      const innerMessage = JSON.stringify({ message: 'Deep error' });
      const error = new Error(innerMessage);
      expect(extractNestedErrorMessage(error)).toBe('Deep error');
    });
  });

  describe('Objects', () => {
    it('extracts from "message" property', () => {
      expect(extractNestedErrorMessage({ message: 'Direct message' })).toBe('Direct message');
    });

    it('extracts from "error.message" property', () => {
      expect(extractNestedErrorMessage({ error: { message: 'Nested message' } })).toBe('Nested message');
    });

    it('returns null if no message found', () => {
      expect(extractNestedErrorMessage({ other: 'value' })).toBeNull();
    });

    it('prioritizes direct message over nested error', () => {
      const obj = {
        message: 'Top level',
        error: { message: 'Nested level' }
      };
      expect(extractNestedErrorMessage(obj)).toBe('Top level');
    });

    it('handles recursion in object properties', () => {
        const obj = {
            message: JSON.stringify({ error: { message: 'Deeply nested in object' } })
        };
        expect(extractNestedErrorMessage(obj)).toBe('Deeply nested in object');
    });
  });

  describe('Complex/Edge Cases', () => {
    it('handles multiple levels of nesting', () => {
      // String -> JSON -> Object -> Error -> JSON -> Object -> Message
      const deep = JSON.stringify({
        error: {
          message: JSON.stringify({
            message: 'Way down'
          })
        }
      });
      expect(extractNestedErrorMessage(deep)).toBe('Way down');
    });

    it('stops recursion when value is neither string, error, nor object with message/error', () => {
        expect(extractNestedErrorMessage(123)).toBeNull();
        expect(extractNestedErrorMessage(true)).toBeNull();
    });
  });
});
