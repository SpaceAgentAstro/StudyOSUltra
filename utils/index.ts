
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

export const MAX_FILE_SIZE_BYTES = 500 * 1024 * 1024; // 500MB
export const MAX_TOTAL_UPLOAD_SIZE_BYTES = 2 * 1024 * 1024 * 1024; // 2GB safety cap
const MAX_PREVIEW_READ_BYTES = 2 * 1024 * 1024; // Keep browser memory stable
const MAX_PREVIEW_CHARS = 120_000;
const ALLOWED_EXTENSIONS = ['.txt', '.md', '.csv', '.json', '.pdf', '.docx'];
const TEXT_EXTENSIONS = ['.txt', '.md', '.csv', '.json'];

const BINARY_PREVIEW_NOTICE =
  'Binary document uploaded. Browser indexing uses a small preview slice for stability.';

const sanitizePreview = (value: string) =>
  value
    .replace(/\u0000/g, ' ')
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

const textQualityScore = (value: string) => {
  if (!value.length) return 0;
  const alphaNumericMatches = value.match(/[a-z0-9]/gi);
  const alphaNumericCount = alphaNumericMatches ? alphaNumericMatches.length : 0;
  return alphaNumericCount / value.length;
};

/**
 * Formats bytes into human-readable unit.
 */
export const formatBytes = (bytes: number): string => {
  if (!Number.isFinite(bytes) || bytes <= 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB'];
  let value = bytes;
  let unitIndex = 0;

  while (value >= 1024 && unitIndex < units.length - 1) {
    value /= 1024;
    unitIndex += 1;
  }

  const precision = value >= 100 || unitIndex === 0 ? 0 : value >= 10 ? 1 : 2;
  return `${value.toFixed(precision)} ${units[unitIndex]}`;
};

export interface FilePreviewResult {
  content: string;
  truncated: boolean;
  previewBytes: number;
}

/**
 * Extracts a bounded text preview from a file so large uploads stay responsive.
 */
export const extractFilePreview = async (file: File): Promise<FilePreviewResult> => {
  const previewBytes = Math.min(file.size, MAX_PREVIEW_READ_BYTES);
  const previewBlob = file.slice(0, previewBytes);
  const previewText = await previewBlob.text();
  const sanitized = sanitizePreview(previewText);
  const lowerName = file.name.toLowerCase();
  const isTextFile = TEXT_EXTENSIONS.some((ext) => lowerName.endsWith(ext));
  const qualityScore = textQualityScore(sanitized);
  const looksLikeReadableText = qualityScore >= 0.4;

  if (!isTextFile && !looksLikeReadableText) {
    return {
      content: `${BINARY_PREVIEW_NOTICE} File: ${file.name}`,
      truncated: true,
      previewBytes,
    };
  }

  const boundedContent = sanitized.slice(0, MAX_PREVIEW_CHARS);
  const truncated = sanitized.length > MAX_PREVIEW_CHARS || file.size > previewBytes;

  return {
    content: boundedContent || `${BINARY_PREVIEW_NOTICE} File: ${file.name}`,
    truncated,
    previewBytes,
  };
};

/**
 * Validates a file for upload.
 * Checks for file size (max 500MB) and allowed extensions.
 * @param file File object with name and size
 * @returns Error message string or null if valid
 */
export const validateFile = (file: { name: string; size: number }): string | null => {
  if (file.size > MAX_FILE_SIZE_BYTES) {
    return `File size exceeds ${formatBytes(MAX_FILE_SIZE_BYTES)} per-file limit`;
  }

  const lowerName = file.name.toLowerCase();
  const hasValidExtension = ALLOWED_EXTENSIONS.some(ext => lowerName.endsWith(ext));

  if (!hasValidExtension) {
    return `File type not supported. Allowed: ${ALLOWED_EXTENSIONS.join(', ')}`;
  }

  return null;
};

/**
 * Reads a file and returns its content as a Promise.
 * @param file The file to read
 * @param readAs The format to read the file as ('text', 'dataURL', 'arrayBuffer')
 * @returns A Promise resolving to the file content
 */
export const readFile = (
  file: File,
  readAs: 'text' | 'dataURL' | 'arrayBuffer' = 'text'
): Promise<string | ArrayBuffer> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      if (e.target?.result) {
        resolve(e.target.result);
      } else {
        reject(new Error('File reading failed: No result found'));
      }
    };

    reader.onerror = () => {
      reject(new Error('File reading error: ' + (reader.error?.message || 'Unknown error')));
    };

    try {
      if (readAs === 'dataURL') {
        reader.readAsDataURL(file);
      } else if (readAs === 'arrayBuffer') {
        reader.readAsArrayBuffer(file);
      } else {
        reader.readAsText(file);
      }
    } catch (error) {
      reject(error);
    }
  });
};

/**
 * Reads a file and returns its content as a Promise.
 * @param file The file to read
 * @param readAs The format to read the file as ('text', 'dataURL', 'arrayBuffer')
 * @returns A Promise that resolves with the file content
 */
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

/**
 * Extracts JSON from a string that might contain other text or be wrapped in markdown code blocks.
 * @param raw The raw string to extract JSON from
 * @returns The extracted JSON string or null if no JSON found
 */
/**
 * Safely parses a JSON string, attempting to extract JSON if the initial parse fails.
 * @param raw The raw string to parse
 * @param fallback The fallback value to return if parsing fails
 * @returns The parsed object or the fallback value
 */
