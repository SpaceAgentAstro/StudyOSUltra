
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
