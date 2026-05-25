## 2024-05-22 - Unsafe AI Response Handling
**Vulnerability:** The `gradeOpenEndedAnswer` function directly called the AI service and parsed the result without error handling.
**Learning:** External AI services (LLMs) are unreliable. They can fail (network) or hallucinate (return invalid JSON).
**Prevention:** All AI service calls must be wrapped in `try-catch`. JSON parsing must be safe (e.g., using `zod` or `try-catch`). Always return a safe fallback object to the UI.

## 2026-05-25 - Secure Error Handling
**Vulnerability:** API endpoints were returning raw error messages (`error.message`) in 500 responses.
**Learning:** Exposing internal error messages or stack traces can leak sensitive system details to clients.
**Prevention:** Catch blocks should log the detailed error internally but always return a generic error message like 'Internal Server Error' to the client.
