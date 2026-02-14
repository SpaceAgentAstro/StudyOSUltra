
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

  // Map extensions to allowed MIME types for stricter security
  const ALLOWED_TYPES: Record<string, string[]> = {
    '.txt': ['text/plain', ''],
    '.md': ['text/markdown', 'text/plain', 'text/x-markdown', ''],
    '.csv': ['text/csv', 'application/vnd.ms-excel', 'text/plain', ''],
    '.json': ['application/json', 'text/plain', ''],
    '.pdf': ['application/pdf'],
    '.docx': ['application/vnd.openxmlformats-officedocument.wordprocessingml.document']
  };

  const dotIndex = file.name.lastIndexOf('.');
  const extension = dotIndex !== -1 ? file.name.slice(dotIndex).toLowerCase() : '';

  if (!Object.keys(ALLOWED_TYPES).includes(extension)) {
    return {
      isValid: false,
      error: `Invalid file type: ${extension || 'no extension'}. Supported types: ${Object.keys(ALLOWED_TYPES).join(', ')}`
    };
  }

  if (file.size === 0) {
    return {
      isValid: false,
      error: `File "${file.name}" is empty.`
    };
  }

  if (file.size > MAX_SIZE) {
    return {
      isValid: false,
      error: `File "${file.name}" exceeds the 500MB size limit.`
    };
  }

  // Strict MIME type check for binary formats (prevents renaming attacks)
  if (file.type) {
    if (extension === '.pdf' && file.type !== 'application/pdf') {
       return { isValid: false, error: `Invalid file content for PDF (detected ${file.type}).` };
    }
    if (extension === '.docx' && !file.type.includes('wordprocessingml')) {
       return { isValid: false, error: `Invalid file content for DOCX (detected ${file.type}).` };
    }
  }

  return { isValid: true };
};
