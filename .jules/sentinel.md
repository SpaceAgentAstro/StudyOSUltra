## 2024-05-22 - Unsafe AI Response Handling
**Vulnerability:** The `gradeOpenEndedAnswer` function directly called the AI service and parsed the result without error handling.
**Learning:** External AI services (LLMs) are unreliable. They can fail (network) or hallucinate (return invalid JSON).
**Prevention:** All AI service calls must be wrapped in `try-catch`. JSON parsing must be safe (e.g., using `zod` or `try-catch`). Always return a safe fallback object to the UI.

## 2026-04-01 - Error Message Information Exposure
**Vulnerability:** The API endpoints directly exposed internal error messages (e.g., `error.message`) in 500 responses to the client.
**Learning:** Exposing detailed error strings, stack traces, or internal server errors to clients can leak sensitive information about the backend architecture, paths, or dependencies.
**Prevention:** API error handlers should log the full error securely on the server side but only return generic, sanitized error messages (e.g., 'Internal Server Error') to the client.
