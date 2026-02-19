## 2024-05-22 - Insecure Randomness in ID Generation
**Vulnerability:** Usage of `Math.random()` for ID generation in `utils/index.ts`.
**Learning:** Common pattern in early dev phases where uniqueness is assumed but collision resistance is low.
**Prevention:** Enforce use of `crypto.randomUUID()` for all identifier generation.

## 2024-06-03 - Client-Side Denial of Service via File Size
**Vulnerability:** Excessive file size limit (500MB) in `utils/index.ts` allowing potential browser memory exhaustion.
**Learning:** Client-side validations must set conservative limits (e.g., 50MB) to prevent crashing the user's browser, especially when file content is read into memory.
**Prevention:** Enforce strict file size limits appropriate for browser capabilities and expected use cases.
