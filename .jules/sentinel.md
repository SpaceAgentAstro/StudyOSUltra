## 2024-05-22 - Unsafe AI Response Handling
**Vulnerability:** The `gradeOpenEndedAnswer` function directly called the AI service and parsed the result without error handling.
**Learning:** External AI services (LLMs) are unreliable. They can fail (network) or hallucinate (return invalid JSON).
**Prevention:** All AI service calls must be wrapped in `try-catch`. JSON parsing must be safe (e.g., using `zod` or `try-catch`). Always return a safe fallback object to the UI.

## 2024-06-05 - Overly Permissive CORS Configuration
**Vulnerability:** The server used `app.use(cors())` which enables Cross-Origin Resource Sharing for all domains. This allows any website to make requests to the API on behalf of a user.
**Learning:** Default CORS configurations are often overly permissive and must be explicitly constrained to known origins.
**Prevention:** Always configure `cors` middleware with an explicit `origin` option pointing to trusted domains (e.g., frontend host URL).
