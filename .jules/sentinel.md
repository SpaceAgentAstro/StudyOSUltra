## 2024-05-22 - Unsafe AI Response Handling
**Vulnerability:** The `gradeOpenEndedAnswer` function directly called the AI service and parsed the result without error handling.
**Learning:** External AI services (LLMs) are unreliable. They can fail (network) or hallucinate (return invalid JSON).
**Prevention:** All AI service calls must be wrapped in `try-catch`. JSON parsing must be safe (e.g., using `zod` or `try-catch`). Always return a safe fallback object to the UI.

## 2025-02-23 - Internal Error Exposure in Express Endpoints
**Vulnerability:** In `server.js`, error responses explicitly leak internal `error.message` data to clients: `res.status(500).json({ error: error.message || "Internal Server Error" })`. This is an information disclosure vulnerability.
**Learning:** Never expose internal stack traces or exact system error messages to API consumers, as they can reveal backend infrastructure, API secrets, or library internals to malicious users.
**Prevention:** Fail securely by catching specific exceptions internally, logging them on the server, and only returning generic, non-informative error messages (e.g., `"Internal Server Error"`) to the client.
