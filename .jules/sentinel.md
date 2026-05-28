## 2024-05-22 - Unsafe AI Response Handling
**Vulnerability:** The `gradeOpenEndedAnswer` function directly called the AI service and parsed the result without error handling.
**Learning:** External AI services (LLMs) are unreliable. They can fail (network) or hallucinate (return invalid JSON).
**Prevention:** All AI service calls must be wrapped in `try-catch`. JSON parsing must be safe (e.g., using `zod` or `try-catch`). Always return a safe fallback object to the UI.

## 2026-05-28 - Error Information Exposure in Express
**Vulnerability:** API endpoints returned raw `error.message` values to clients on 500 errors.
**Learning:** It is easy to inadvertently leak system details if the default error handler forwards the error object.
**Prevention:** Always return generic error messages (e.g., 'Internal Server Error') in API responses and log the real error server-side.
