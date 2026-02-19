## 2024-05-22 - Insecure Randomness in ID Generation
**Vulnerability:** Usage of `Math.random()` for ID generation in `utils/index.ts`.
**Learning:** Common pattern in early dev phases where uniqueness is assumed but collision resistance is low.
**Prevention:** Enforce use of `crypto.randomUUID()` for all identifier generation.

## 2025-05-23 - Client-Side DoS via Unrestricted File Upload
**Vulnerability:** `FileUploader` allowed files up to 500MB, which could crash the browser tab when reading into memory via `FileReader`.
**Learning:** Browser memory limits are much lower than disk space; large client-side file processing requires streaming or strict limits.
**Prevention:** Reduced limit to 50MB and added empty file check (0-byte) to `validateFile` utility.
