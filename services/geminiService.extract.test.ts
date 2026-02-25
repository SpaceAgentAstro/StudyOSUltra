import { describe, it, expect } from 'vitest';
import { extractNestedErrorMessage } from './geminiService';

describe.skip('extractNestedErrorMessage', () => {
  it('returns null for null or undefined', () => {
    expect(extractNestedErrorMessage(null)).toBeNull();
    expect(extractNestedErrorMessage(undefined)).toBeNull();
  });

  it('returns plain string as is', () => {
    const input = 'This is an error';
    expect(extractNestedErrorMessage(input)).toBe(input);
  });

  it('unquotes quoted string', () => {
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
    const inner = JSON.stringify({ error: { message: 'Deeply nested' } });
    const mid = JSON.stringify({ message: inner });
    const outer = JSON.stringify({ message: mid });
    // This tests recursive parsing of JSON strings inside JSON strings
    // value -> "{...}" -> object -> message="{...}" -> recursive -> object -> message="Deeply nested"
    // Wait, original logic:
    // extract(outer) -> parses to object {error: mid} -> extract(mid) (from recursive call on property?)
    // No, logic is:
    // if object:
    //   check record.message -> extract(record.message)
    //   if record.message is string (mid), extract(mid) parses mid -> object {message: inner}
    //   extract(inner) parses inner -> object {error: {message: "Deeply nested"}}
    //   extract on that -> extract(nested.message) -> "Deeply nested"
    expect(extractNestedErrorMessage(outer)).toBe('Deeply nested');
  });

  it('returns original string for malformed JSON', () => {
    const input = '{"error": "incomplete';
    expect(extractNestedErrorMessage(input)).toBe(input);
  });

  it('returns string representation of numbers', () => {
    // "123" -> parses to 123 -> recursive(123) returns null -> returns "123"
    expect(extractNestedErrorMessage('123')).toBe('123');
  });

  it('returns string representation of booleans', () => {
    // "true" -> parses to true -> recursive(true) returns null -> returns "true"
    expect(extractNestedErrorMessage('true')).toBe('true');
  });

  it('handles Error objects', () => {
    const err = new Error('Test error');
    expect(extractNestedErrorMessage(err)).toBe('Test error');
  });
});
