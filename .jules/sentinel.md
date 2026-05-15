## 2024-05-22 - Unsafe AI Response Handling
**Vulnerability:** The `gradeOpenEndedAnswer` function directly called the AI service and parsed the result without error handling.
**Learning:** External AI services (LLMs) are unreliable. They can fail (network) or hallucinate (return invalid JSON).
**Prevention:** All AI service calls must be wrapped in `try-catch`. JSON parsing must be safe (e.g., using `zod` or `try-catch`). Always return a safe fallback object to the UI.

## 2026-05-15 - Overly Permissive CORS and Error Leakage
**Vulnerability:** The server used a default `cors()` configuration allowing requests from any origin, and directly returned `error.message` in API error responses, potentially leaking sensitive system details.
**Learning:** Using default CORS configurations and unhandled error responses expose backend systems to unauthorized domain access and information disclosure.
**Prevention:** Always restrict CORS using an allowlist (e.g., via `ALLOWED_ORIGINS` environment variable and explicit local checks). Never leak stack traces or internal error messages to clients; always return a generic error message (e.g., "Internal Server Error").
