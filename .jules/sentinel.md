## 2024-05-22 - Unsafe AI Response Handling
**Vulnerability:** The `gradeOpenEndedAnswer` function directly called the AI service and parsed the result without error handling.
**Learning:** External AI services (LLMs) are unreliable. They can fail (network) or hallucinate (return invalid JSON).
**Prevention:** All AI service calls must be wrapped in `try-catch`. JSON parsing must be safe (e.g., using `zod` or `try-catch`). Always return a safe fallback object to the UI.
## 2026-05-23 - Prevent Information Leakage in API Error Responses
**Vulnerability:** Internal error details (e.g., `error.message`) were explicitly passed to the client on a 500 status code in `/api/generate` and `/api/stream`.
**Learning:** Relying on default error serialization without sanitization can inadvertently leak sensitive stack traces, DB queries, or other backend environment details via exceptions.
**Prevention:** Always implement a security boundary in API response handlers by replacing unhandled internal exceptions with a generic, sanitized string (e.g., 'Internal Server Error') while logging the actual details exclusively on the server.
