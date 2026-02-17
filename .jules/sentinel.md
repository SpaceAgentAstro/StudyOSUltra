## 2024-05-22 - Insecure Randomness in ID Generation
**Vulnerability:** Usage of `Math.random()` for ID generation in `utils/index.ts`.
**Learning:** Common pattern in early dev phases where uniqueness is assumed but collision resistance is low.
**Prevention:** Enforce use of `crypto.randomUUID()` for all identifier generation.

## 2026-02-17 - File Upload Denial of Service (DoS) Risk
**Vulnerability:** `validateFile` allowed large file uploads (500MB) and empty files, posing a browser memory exhaustion risk.
**Learning:** Default limits in client-side validation can be too permissive for text-based processing.
**Prevention:** Reduced file size limit to 50MB and added explicit rejection of empty files.
