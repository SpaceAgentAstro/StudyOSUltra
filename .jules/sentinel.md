## 2024-05-22 - Insecure Randomness in ID Generation
**Vulnerability:** Usage of `Math.random()` for ID generation in `utils/index.ts`.
**Learning:** Common pattern in early dev phases where uniqueness is assumed but collision resistance is low.
**Prevention:** Enforce use of `crypto.randomUUID()` for all identifier generation.

## 2025-05-27 - Insecure File Upload Validation
**Vulnerability:** Client-side file validation relied solely on file extensions, allowing potential upload of malicious binaries (e.g. executables renamed to .txt) or empty files.
**Learning:** Browsers' `File` API provides `type` (MIME type) which, while spoofable, offers a critical first line of defense against accidental or naive malicious uploads.
**Prevention:** Implement defense-in-depth validation: check file size (reject empty/too large), validate extension, AND validate MIME type against a strict whitelist for known types (PDF, DOCX).
