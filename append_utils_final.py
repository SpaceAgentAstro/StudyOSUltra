with open('utils/index.ts.tmp', 'a') as f:
    f.write('''

/**
 * Extracts JSON from a string that might contain other text or markdown fences.
 * @param raw The raw string content
 * @returns The extracted JSON string or null if not found
 */
export const extractJsonText = (raw: string): string | null => {
  if (!raw?.trim()) return null;
  const trimmed = raw.trim();

  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fenced?.[1]) return fenced[1].trim();

  const arrayStart = trimmed.indexOf('[');
  const arrayEnd = trimmed.lastIndexOf(']');
  if (arrayStart !== -1 && arrayEnd > arrayStart) {
    return trimmed.slice(arrayStart, arrayEnd + 1);
  }

  const objectStart = trimmed.indexOf('{');
  const objectEnd = trimmed.lastIndexOf('}');
  if (objectStart !== -1 && objectEnd > objectStart) {
    return trimmed.slice(objectStart, objectEnd + 1);
  }

  return null;
};

/**
 * Parses JSON safely, attempting to extract it from text if direct parsing fails.
 * @param raw The raw string content
 * @param fallback The fallback value if parsing fails
 * @returns The parsed object or the fallback value
 */
export const parseJsonSafely = <T>(raw: string, fallback: T): T => {
  try {
    return JSON.parse(raw) as T;
  } catch {
    const extracted = extractJsonText(raw);
    if (!extracted) return fallback;
    try {
      return JSON.parse(extracted) as T;
    } catch {
      return fallback;
    }
  }
};
''')
