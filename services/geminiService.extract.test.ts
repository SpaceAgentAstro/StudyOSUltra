import { describe, it, expect } from 'vitest';
import { extractNestedErrorMessage } from './extractNestedErrorMessage';

describe('extractNestedErrorMessage', () => {
  it('returns null for null or undefined', () => {
    expect(extractNestedErrorMessage(null)).toBeNull();
    expect(extractNestedErrorMessage(undefined)).toBeNull();
  });

  it('returns plain string as is', () => {
    const input = 'This is an error';
    expect(extractNestedErrorMessage(input)).toBe(input);
  });

  it('unquotes quoted string', () => {
    // Current implementation: if string, try parse.
    // JSON.parse('"quoted"') -> 'quoted' (string)
    // Then recursive call extractNestedErrorMessage('quoted') -> 'quoted'
    const input = '"This is a quoted error"';
    expect(extractNestedErrorMessage(input)).toBe('This is a quoted error');
  });

  it('parses simple JSON object', () => {
    const input = JSON.stringify({ message: 'JSON error' });
    expect(extractNestedErrorMessage(input)).toBe('JSON error');
  });

  it('parses nested JSON object', () => {
    const input = JSON.stringify({ error: { message: 'Nested JSON error' } });
    expect(extractNestedErrorMessage(input)).toBe('Nested JSON error');
  });

  it('parses deeply nested JSON string', () => {
    // outer = '{"message": "{\\"message\\": \\"{\\\\\\"error\\\\\\": {\\\\\\"message\\\\\\": \\\\\\"Deeply nested\\\\\\"}} \\"}"}'
    const inner = JSON.stringify({ error: { message: 'Deeply nested' } });
    const mid = JSON.stringify({ message: inner });
    const outer = JSON.stringify({ message: mid });
    expect(extractNestedErrorMessage(outer)).toBe('Deeply nested');
  });

  it('returns original string for malformed JSON', () => {
    const input = '{"error": "incomplete';
    expect(extractNestedErrorMessage(input)).toBe(input);
  });

  it('returns string representation of numbers', () => {
    expect(extractNestedErrorMessage('123')).toBe('123');
  });

  it('returns string representation of booleans', () => {
    expect(extractNestedErrorMessage('true')).toBe('true');
  });

  it('handles Error objects', () => {
    const err = new Error('Test error');
    expect(extractNestedErrorMessage(err)).toBe('Test error');
  });
});
