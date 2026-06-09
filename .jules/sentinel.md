## 2024-05-22 - Unsafe AI Response Handling
**Vulnerability:** The `gradeOpenEndedAnswer` function directly called the AI service and parsed the result without error handling.
**Learning:** External AI services (LLMs) are unreliable. They can fail (network) or hallucinate (return invalid JSON).
**Prevention:** All AI service calls must be wrapped in `try-catch`. JSON parsing must be safe (e.g., using `zod` or `try-catch`). Always return a safe fallback object to the UI.

## 2025-03-09 - Overly Permissive CORS Configuration
**Vulnerability:** The Express server used `app.use(cors())` which allows cross-origin requests from any origin by default.
**Learning:** Using default CORS configurations without restricting the `origin` is insufficient and leaves the server vulnerable to Cross-Origin requests from malicious sites. Restricting only the `methods` is also insufficient.
**Prevention:** Always explicitly configure CORS with an `origin` array of allowed origins (e.g., `process.env.FRONTEND_URL` or explicit localhost ports for dev) and restrict `methods` to only those required by the API.
