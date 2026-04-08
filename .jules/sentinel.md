## 2024-05-22 - Unsafe AI Response Handling
**Vulnerability:** The `gradeOpenEndedAnswer` function directly called the AI service and parsed the result without error handling.
**Learning:** External AI services (LLMs) are unreliable. They can fail (network) or hallucinate (return invalid JSON).
**Prevention:** All AI service calls must be wrapped in `try-catch`. JSON parsing must be safe (e.g., using `zod` or `try-catch`). Always return a safe fallback object to the UI.

## 2024-06-12 - In-Memory Rate Limiting DoS Vulnerability
**Vulnerability:** Implementing in-memory rate limiters (e.g., using `Map`) without a cleanup mechanism can lead to out-of-memory errors (DoS) as unique IP entries accumulate indefinitely.
**Learning:** Single-instance Node/Express rate limiters must paired with a periodic background cleanup task (e.g., `setInterval`) to delete expired entries.
**Prevention:** Use `setInterval` to iterate and clean up expired `Map` entries. Always append `.unref()` to the `setInterval` in server scripts so the timer doesn't prevent Node.js from exiting cleanly.

## 2024-06-12 - API Error Message Exposure
**Vulnerability:** The `/api/generate` and `/api/stream` endpoints were returning `error.message` directly to the client in `catch` blocks.
**Learning:** Detailed error messages from external APIs (like GoogleGenAI) or internal server processes can leak sensitive infrastructure details or configuration information.
**Prevention:** Catch blocks on API endpoints should log the full error internally (`console.error`) but return a generic, secure response to the client (e.g., `res.status(500).json({ error: "Internal Server Error" })`).
