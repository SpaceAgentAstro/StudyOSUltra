## 2024-05-22 - Unsafe AI Response Handling
**Vulnerability:** The `gradeOpenEndedAnswer` function directly called the AI service and parsed the result without error handling.
**Learning:** External AI services (LLMs) are unreliable. They can fail (network) or hallucinate (return invalid JSON).
**Prevention:** All AI service calls must be wrapped in `try-catch`. JSON parsing must be safe (e.g., using `zod` or `try-catch`). Always return a safe fallback object to the UI.

## 2026-03-23 - Information Exposure via Error Messages
**Vulnerability:** System errors exposing sensitive details (via `error.message` or `error?.message`) in `/api/generate`, `/api/stream` handlers and the client-side `geminiService` stream handler.
**Learning:** Returning unhandled or dynamic stack trace/error properties directly to clients poses an Information Exposure risk, as library/network errors could leak paths, infrastructure details, or context.
**Prevention:** Always log detailed errors (`console.error`) server-side, but fail securely by returning generic fallback string messages (e.g., "Internal Server Error" or "Failed to generate response") to the client.
