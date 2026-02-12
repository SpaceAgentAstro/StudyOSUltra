
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
  const MAX_SIZE = 5 * 1024 * 1024; // 5MB
  const ALLOWED_EXTENSIONS = ['.txt', '.md', '.csv', '.json', '.pdf', '.docx'];

  const dotIndex = file.name.lastIndexOf('.');
  const extension = dotIndex !== -1 ? file.name.slice(dotIndex).toLowerCase() : '';

  if (!ALLOWED_EXTENSIONS.includes(extension)) {
    return {
      isValid: false,
      error: `Invalid file type: ${extension || 'no extension'}. Supported types: ${ALLOWED_EXTENSIONS.join(', ')}`
    };
  }

  // Security enhancement: Validate MIME type if available to prevent extension spoofing
  const MIME_TYPES: Record<string, string[]> = {
    '.txt': ['text/plain', ''],
    '.md': ['text/markdown', 'text/x-markdown', 'text/plain', ''],
    '.csv': ['text/csv', 'application/vnd.ms-excel', 'text/plain', ''],
    '.json': ['application/json', 'text/plain', ''],
    '.pdf': ['application/pdf'],
    '.docx': ['application/vnd.openxmlformats-officedocument.wordprocessingml.document']
  };

  if (file.type) {
    const allowedMimes = MIME_TYPES[extension];
    if (allowedMimes && !allowedMimes.includes(file.type)) {
       return {
         isValid: false,
         error: `MIME type mismatch. File extension ${extension} does not match detected type ${file.type}`
       };
    }
  }

  if (file.size > MAX_SIZE) {
    return {
      isValid: false,
      error: `File "${file.name}" exceeds the 5MB size limit.`
    };
  }

  return { isValid: true };
};
