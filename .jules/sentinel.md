## 2024-05-22 - Unsafe AI Response Handling
**Vulnerability:** The `gradeOpenEndedAnswer` function directly called the AI service and parsed the result without error handling.
**Learning:** External AI services (LLMs) are unreliable. They can fail (network) or hallucinate (return invalid JSON).
**Prevention:** All AI service calls must be wrapped in `try-catch`. JSON parsing must be safe (e.g., using `zod` or `try-catch`). Always return a safe fallback object to the UI.

## 2026-03-15 - Prevent Information Exposure via Error Messages
**Vulnerability:** The proxy server endpoints (`/api/generate` and `/api/stream`) returned `error.message` directly to the client on failure, potentially exposing sensitive internal server information or stack traces.
**Learning:** Detailed error messages from internal modules or downstream APIs should never be passed blindly to clients, as they can reveal system architecture, dependency versions, or unhandled states.
**Prevention:** Catch blocks in backend/proxy endpoints should always log the detailed error internally (e.g., `console.error`) and strictly return generic, sanitized error responses like 'Internal Server Error'.
