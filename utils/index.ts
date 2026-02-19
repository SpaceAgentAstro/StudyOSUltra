
/**
 * Formats seconds into MM:SS string.
 * @param seconds Number of seconds (non-negative)
 * @returns Formatted time string (e.g., "5:03")
 */
export const formatTime = (seconds: number): string => {
  if (seconds < 0) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s < 10 ? '0' : ''}${s}`;
};

/**
 * Calculates percentage accuracy safe from division by zero.
 * @param score The achieved score
 * @param total The total possible score
 * @returns Rounded percentage integer (0-100)
 */
export const calculateAccuracy = (score: number, total: number): number => {
  if (total <= 0) return 0;
  return Math.round((score / total) * 100);
};

/**
 * Generates a random alphanumeric ID.
 * @returns A random string ID
 */
export const generateId = (): string => {
  return crypto.randomUUID();
};

/**
 * Validates file size and type.
 * @param file The file to validate
 * @returns Object with validity status and error message if invalid
 */
export const validateFile = (file: File): { isValid: boolean; error?: string } => {
  const MAX_SIZE = 500 * 1024 * 1024; // 500MB
  const ALLOWED_EXTENSIONS = ['.txt', '.md', '.csv', '.json', '.pdf', '.docx'];

  const dotIndex = file.name.lastIndexOf('.');
  const extension = dotIndex !== -1 ? file.name.slice(dotIndex).toLowerCase() : '';

  if (!ALLOWED_EXTENSIONS.includes(extension)) {
    return {
      isValid: false,
      error: `Invalid file type: ${extension || 'no extension'}. Supported types: ${ALLOWED_EXTENSIONS.join(', ')}`
    };
  }

  if (file.size > MAX_SIZE) {
    return {
      isValid: false,
      error: `File "${file.name}" exceeds the 500MB size limit.`
    };
  }

  return { isValid: true };
};


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
