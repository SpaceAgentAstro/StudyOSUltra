## 2024-05-22 - Insecure Randomness in ID Generation
**Vulnerability:** Usage of `Math.random()` for ID generation in `utils/index.ts`.
**Learning:** Common pattern in early dev phases where uniqueness is assumed but collision resistance is low.
**Prevention:** Enforce use of `crypto.randomUUID()` for all identifier generation.

## 2024-05-23 - LocalStorage DoS via Unbounded File Uploads
**Vulnerability:** `MAX_SIZE` for file uploads was 500MB, but `localStorage` typically has a 5-10MB limit. Uploading large files would cause `QuotaExceededError` and crash the persistence logic, freezing the main thread during serialization.
**Learning:** Client-side storage limitations must be strictly enforced at the input validation layer. `JSON.stringify` on large objects is blocking and dangerous.
**Prevention:** Reduce file size limits to <5MB for `localStorage`-based apps and wrap storage calls in `try-catch` blocks.
