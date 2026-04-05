export const extractNestedErrorMessage = (value: unknown): string | null => {
  if (!value) return null;

  if (typeof value === 'string') {
    if (!value.trim()) return null;

    // Check if it matches JSON object pattern or starts with quote
    // Simple heuristic to avoid parsing plain strings unless necessary
    // But "unquotes quoted string" test implies we should parse any string if it's valid JSON string

    try {
      const parsed = JSON.parse(value);

      if (typeof parsed === 'string') {
        return extractNestedErrorMessage(parsed);
      }

      if (parsed && typeof parsed === 'object') {
        // Recurse
        const inner = extractNestedErrorMessage(parsed);
        // If recursion yielded a message, return it
        if (inner) return inner;

        // If parsing succeeded but no inner message found (e.g. empty object {}),
        // we generally return null.
        // BUT there is a test:
        // "handles JSON that resolves to null/empty string by returning original string"
        // input: '{"random": "value"}' -> parsed: {random: 'value'} -> recurse: null
        // Expectation: '{"random": "value"}'

        // However, there is another test:
        // "returns null if no message found"
        // input: { other: 'value' } -> result: null

        // This is contradictory if the input to the recursive function was object vs stringified object.
        // If passed string '{"random": "value"}', it should return string '{"random": "value"}'.
        // If passed object {random: "value"}, it should return null.

        return value;
      }

      if (typeof parsed === 'number' || typeof parsed === 'boolean') {
          return String(parsed);
      }

    } catch {
      // Not valid JSON
      return value.trim();
    }

    return value;
  }

  if (value instanceof Error) {
    try {
      // Try to parse message as JSON
      const parsed = JSON.parse(value.message);
      if (parsed && typeof parsed === 'object') {
        return extractNestedErrorMessage(parsed) || value.message;
      }
    } catch {
      // Not JSON
    }
    return value.message;
  }

  if (typeof value === 'object') {
    const val = value as any;
    if (val.message) return extractNestedErrorMessage(val.message);
    if (val.error) return extractNestedErrorMessage(val.error);

    // Test: returns null if no message found
    return null;
  }

  return null;
};
