## 2024-05-22 - Unsafe AI Response Handling
**Vulnerability:** The `gradeOpenEndedAnswer` function directly called the AI service and parsed the result without error handling.
**Learning:** External AI services (LLMs) are unreliable. They can fail (network) or hallucinate (return invalid JSON).
**Prevention:** All AI service calls must be wrapped in `try-catch`. JSON parsing must be safe (e.g., using `zod` or `try-catch`). Always return a safe fallback object to the UI.

## 2026-03-25 - Unsafe Error Handling Exposing Information
**Vulnerability:** The `/api/generate` and `/api/stream` endpoints in `server.js` returned `error.message` directly to the client on failure (Information Exposure).
**Learning:** Default error handlers often leak sensitive backend details, file paths, or API failures if `error.message` is serialized and sent to the client.
**Prevention:** Catch blocks in server endpoints must fail securely by logging the full error server-side and returning a generic placeholder (like 'Internal Server Error') to the client.
