## 2024-05-22 - Unsafe AI Response Handling
**Vulnerability:** The `gradeOpenEndedAnswer` function directly called the AI service and parsed the result without error handling.
**Learning:** External AI services (LLMs) are unreliable. They can fail (network) or hallucinate (return invalid JSON).
**Prevention:** All AI service calls must be wrapped in `try-catch`. JSON parsing must be safe (e.g., using `zod` or `try-catch`). Always return a safe fallback object to the UI.

## 2024-05-23 - Verbose Error Messages Exposing Internal Details
**Vulnerability:** The backend AI proxy endpoints (`/api/generate` and `/api/stream` in `server.js`) were returning the direct `error.message` from `catch` blocks to the client in JSON responses.
**Learning:** Sending raw `error.message` strings directly to a client can leak internal service, configuration, or stack details, aiding reconnaissance by attackers.
**Prevention:** Catch blocks on backend endpoints must always log the specific internal error (e.g. `console.error`) server-side, and only ever return generic, non-informative HTTP 500 responses (e.g., `{"error": "Internal Server Error"}`) to external clients.
