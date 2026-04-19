## 2024-05-22 - Unsafe AI Response Handling
**Vulnerability:** The `gradeOpenEndedAnswer` function directly called the AI service and parsed the result without error handling.
**Learning:** External AI services (LLMs) are unreliable. They can fail (network) or hallucinate (return invalid JSON).
**Prevention:** All AI service calls must be wrapped in `try-catch`. JSON parsing must be safe (e.g., using `zod` or `try-catch`). Always return a safe fallback object to the UI.
## 2024-05-24 - Overly Permissive CORS
**Vulnerability:** The `app.use(cors())` configuration in `server.js` was overly permissive, allowing all origins by default.
**Learning:** Default CORS configurations are often unsafe for production APIs, potentially allowing unauthorized cross-origin requests.
**Prevention:** Always restrict CORS using an explicitly managed whitelist (e.g., via environment variables like `ALLOWED_ORIGINS`) while securely handling local development domains.
