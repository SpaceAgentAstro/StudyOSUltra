
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
 * Uses crypto.randomUUID if available for better security.
 * @returns A random string ID
 */
export const generateId = (): string => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return Math.random().toString(36).substring(2, 11);
};

/**
 * Validates a file for size and type.
 * @param file The file to validate
 * @returns Object with valid boolean and optional error message
 */
export const validateFile = (file: File): { valid: boolean; error?: string } => {
  const MAX_SIZE = 5 * 1024 * 1024; // 5MB
  const ALLOWED_EXTENSIONS = ['.txt', '.md', '.csv', '.json', '.pdf', '.docx'];

  if (file.size > MAX_SIZE) {
    return { valid: false, error: `File "${file.name}" exceeds 5MB limit.` };
  }

  // Check extension
  const parts = file.name.split('.');
  const extension = parts.length > 1 ? '.' + parts.pop()?.toLowerCase() : '';

  if (!ALLOWED_EXTENSIONS.includes(extension)) {
    return { valid: false, error: `File type "${extension}" not supported.` };
  }

  return { valid: true };
};
