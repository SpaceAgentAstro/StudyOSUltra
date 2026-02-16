## 2024-05-22 - Insecure Randomness in ID Generation
**Vulnerability:** Usage of `Math.random()` for ID generation in `utils/index.ts`.
**Learning:** Common pattern in early dev phases where uniqueness is assumed but collision resistance is low.
**Prevention:** Enforce use of `crypto.randomUUID()` for all identifier generation.

## 2025-05-23 - Client-Side DoS via Large File Uploads
**Vulnerability:** Application allowed 500MB file uploads processed entirely in-memory via `FileReader`.
**Learning:** Client-side processing limits must be much stricter (e.g., 50MB) than server-side limits to prevent browser crashes/freezes.
**Prevention:** Enforce strict file size limits (<=50MB for text/PDF) in client-side validation logic.
