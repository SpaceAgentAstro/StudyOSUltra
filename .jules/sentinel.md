## 2024-05-22 - Unsafe AI Response Handling
**Vulnerability:** The `gradeOpenEndedAnswer` function directly called the AI service and parsed the result without error handling.
**Learning:** External AI services (LLMs) are unreliable. They can fail (network) or hallucinate (return invalid JSON).
**Prevention:** All AI service calls must be wrapped in `try-catch`. JSON parsing must be safe (e.g., using `zod` or `try-catch`). Always return a safe fallback object to the UI.

## 2024-06-28 - Overly Permissive CORS Configuration
**Vulnerability:** The Express server used `app.use(cors())`, allowing cross-origin requests from any domain, potentially exposing the API to unauthorized cross-origin access.
**Learning:** Default CORS configurations are dangerous. They should always be explicitly restricted to known and trusted origins to protect the API from being exploited by malicious external sites.
**Prevention:** Implement strict origin validation using an environment-variable-based whitelist (e.g., `process.env.ALLOWED_ORIGINS`), with safe fallbacks for local development, and allow missing origins for server-to-server or local testing requests.
