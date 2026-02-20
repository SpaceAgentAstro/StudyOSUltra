with open('utils/index.test.ts', 'r') as f:
    content = f.read()

# Update import
content = content.replace(
    "import { formatTime, calculateAccuracy, generateId, validateFile } from './index';",
    "import { formatTime, calculateAccuracy, generateId, validateFile, extractJsonText, parseJsonSafely } from './index';"
)

# Remove the last line (which should be '});' or empty line then '});')
content = content.rstrip()
if content.endswith('});'):
    content = content[:-3]

# Append new tests
new_tests = """
  describe('extractJsonText', () => {
    it('returns null for empty or whitespace-only input', () => {
      expect(extractJsonText('')).toBeNull();
      expect(extractJsonText('   ')).toBeNull();
    });

    it('extracts JSON from markdown code blocks', () => {
      const input = 'Here is some json:\\n```json\\n{"key": "value"}\\n```';
      expect(extractJsonText(input)).toBe('{"key": "value"}');
    });

    it('extracts JSON from code blocks without language identifier', () => {
      const input = '```\\n{"key": "value"}\\n```';
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

});
"""

with open('utils/index.test.ts', 'w') as f:
    f.write(content + new_tests)
