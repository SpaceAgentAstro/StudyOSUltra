## 2024-05-22 - Unsafe AI Response Handling
**Vulnerability:** The `gradeOpenEndedAnswer` function directly called the AI service and parsed the result without error handling.
**Learning:** External AI services (LLMs) are unreliable. They can fail (network) or hallucinate (return invalid JSON).
**Prevention:** All AI service calls must be wrapped in `try-catch`. JSON parsing must be safe (e.g., using `zod` or `try-catch`). Always return a safe fallback object to the UI.

## 2024-05-22 - Missing Rate Limiting on Sensitive API Endpoints
**Vulnerability:** The `/api/generate` and `/api/stream` endpoints lacked rate limiting, making them susceptible to Denial of Service (DoS) and token exhaustion attacks.
**Learning:** In-memory rate limiting middleware in single-instance Node/Express apps must pair a Request Map with a periodic cleanup mechanism to delete expired IP entries. Without cleanup, the Map grows indefinitely, causing an Out-Of-Memory (OOM) vulnerability. Furthermore, the `setInterval` used for cleanup must have `.unref()` appended; otherwise, the timer prevents the Node process from exiting cleanly. `app.set('trust proxy', 1)` is also required for accurate IP tracking behind proxies.
**Prevention:** Always implement rate limiting on endpoints interacting with external APIs (like LLMs). Ensure in-memory Maps used for rate limiting have a `setInterval(..., window).unref()` cleanup routine. Set `trust proxy` if deployed behind a reverse proxy.
