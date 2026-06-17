## 2024-05-22 - Unsafe AI Response Handling
**Vulnerability:** The `gradeOpenEndedAnswer` function directly called the AI service and parsed the result without error handling.
**Learning:** External AI services (LLMs) are unreliable. They can fail (network) or hallucinate (return invalid JSON).
**Prevention:** All AI service calls must be wrapped in `try-catch`. JSON parsing must be safe (e.g., using `zod` or `try-catch`). Always return a safe fallback object to the UI.

## 2024-06-17 - Overly Permissive CORS Configuration
**Vulnerability:** The Express server used `app.use(cors())` which unconditionally allows all origins, exposing the API to cross-origin requests from malicious sites.
**Learning:** Using the default `cors()` configuration is a security risk in production environments.
**Prevention:** Implement strict `origin` validation using a callback that checks against an environment variable whitelist (`process.env.ALLOWED_ORIGINS`), falling back to local development URLs only when missing. Explicitly allow missing origins (`!origin`) for safe local tooling (e.g. curl).
