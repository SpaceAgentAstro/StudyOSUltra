## 2024-05-22 - Unsafe AI Response Handling
**Vulnerability:** The `gradeOpenEndedAnswer` function directly called the AI service and parsed the result without error handling.
**Learning:** External AI services (LLMs) are unreliable. They can fail (network) or hallucinate (return invalid JSON).
**Prevention:** All AI service calls must be wrapped in `try-catch`. JSON parsing must be safe (e.g., using `zod` or `try-catch`). Always return a safe fallback object to the UI.

## 2025-02-27 - Error Message Leakage
**Vulnerability:** The `/api/generate` and `/api/stream` endpoints returned `error.message` directly to the client, leaking internal error details.
**Learning:** Backend error responses should never expose raw exceptions.
**Prevention:** Always catch exceptions and return generic `Internal Server Error` messages without exposing underlying stack traces or exception details.
