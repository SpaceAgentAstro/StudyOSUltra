## 2024-05-22 - Unsafe AI Response Handling
**Vulnerability:** The `gradeOpenEndedAnswer` function directly called the AI service and parsed the result without error handling.
**Learning:** External AI services (LLMs) are unreliable. They can fail (network) or hallucinate (return invalid JSON).
**Prevention:** All AI service calls must be wrapped in `try-catch`. JSON parsing must be safe (e.g., using `zod` or `try-catch`). Always return a safe fallback object to the UI.

## 2024-05-23 - Information Leakage via Error Messages
**Vulnerability:** API endpoints returned raw `error.message` directly to clients.
**Learning:** Exposing internal error details can leak sensitive system architecture or backend secrets to attackers.
**Prevention:** Always return generic error messages (e.g., 'Internal Server Error') from catch blocks in API endpoints.
