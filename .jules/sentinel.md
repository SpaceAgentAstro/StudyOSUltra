## 2024-05-22 - Unsafe AI Response Handling
**Vulnerability:** The `gradeOpenEndedAnswer` function directly called the AI service and parsed the result without error handling.
**Learning:** External AI services (LLMs) are unreliable. They can fail (network) or hallucinate (return invalid JSON).
**Prevention:** All AI service calls must be wrapped in `try-catch`. JSON parsing must be safe (e.g., using `zod` or `try-catch`). Always return a safe fallback object to the UI.
## 2024-05-24 - Information Leakage in Express Error Responses
**Vulnerability:** The API endpoints `/api/generate` and `/api/stream` in `server.js` were exposing the internal `error.message` in 500 status code JSON responses.
**Learning:** Sending raw `error.message` strings directly to the client can inadvertently expose system internals, stack traces, or upstream API error formats to end users or attackers.
**Prevention:** Always return a generic error message like `"Internal Server Error"` for unhandled exceptions in production API routes. Log the detailed error server-side instead.
