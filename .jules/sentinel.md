## 2024-05-22 - Insecure Randomness in ID Generation
**Vulnerability:** Usage of `Math.random()` for ID generation in `utils/index.ts`.
**Learning:** Common pattern in early dev phases where uniqueness is assumed but collision resistance is low.
**Prevention:** Enforce use of `crypto.randomUUID()` for all identifier generation.

## 2024-05-24 - Unbounded File Upload Limits (DoS)
**Vulnerability:** `MAX_SIZE` set to 500MB, potentially crashing browser tabs when `FileReader` loads content into memory.
**Learning:** Client-side memory constraints are often overlooked; large strings (>100MB) can freeze the main thread.
**Prevention:** Enforce strict file size limits (e.g., 10MB) appropriate for the processing context (browser memory).
