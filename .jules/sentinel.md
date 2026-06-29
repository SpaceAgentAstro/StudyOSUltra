## 2024-05-22 - Unsafe AI Response Handling
**Vulnerability:** The `gradeOpenEndedAnswer` function directly called the AI service and parsed the result without error handling.
**Learning:** External AI services (LLMs) are unreliable. They can fail (network) or hallucinate (return invalid JSON).
**Prevention:** All AI service calls must be wrapped in `try-catch`. JSON parsing must be safe (e.g., using `zod` or `try-catch`). Always return a safe fallback object to the UI.

## 2024-06-29 - Overly Permissive CORS Configuration
**Vulnerability:** The server used `app.use(cors())` which allows any origin to make API requests.
**Learning:** Hardcoded permissive CORS configurations expose the application to unauthorized cross-origin access.
**Prevention:** Always implement an environment-variable-based CORS whitelist (e.g., `process.env.ALLOWED_ORIGINS`) with safe fallback origins for local development, and allow missing origins for server-to-server requests.
