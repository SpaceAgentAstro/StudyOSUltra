## 2024-05-22 - Unsafe AI Response Handling
**Vulnerability:** The `gradeOpenEndedAnswer` function directly called the AI service and parsed the result without error handling.
**Learning:** External AI services (LLMs) are unreliable. They can fail (network) or hallucinate (return invalid JSON).
**Prevention:** All AI service calls must be wrapped in `try-catch`. JSON parsing must be safe (e.g., using `zod` or `try-catch`). Always return a safe fallback object to the UI.

## 2024-05-24 - Leaking Server Error Details
**Vulnerability:** The server error handlers (`/api/generate` and `/api/stream`) were returning `error.message` in the HTTP 500 JSON response.
**Learning:** Sending the raw error message to the client can inadvertently expose internal server details, file paths, logic gaps, or API connection issues.
**Prevention:** Always return a generic error message like "Internal Server Error" to the client in catch blocks and only log the detailed error server-side.
