## 2024-05-22 - Unsafe AI Response Handling
**Vulnerability:** The `gradeOpenEndedAnswer` function directly called the AI service and parsed the result without error handling.
**Learning:** External AI services (LLMs) are unreliable. They can fail (network) or hallucinate (return invalid JSON).
**Prevention:** All AI service calls must be wrapped in `try-catch`. JSON parsing must be safe (e.g., using `zod` or `try-catch`). Always return a safe fallback object to the UI.
## 2026-04-30 - Error Handling Information Leakage
**Vulnerability:** The error handlers in the API endpoints exposed internal error messages (e.g. `error.message`) directly to the client.
**Learning:** Exposing detailed server-side error messages can leak internal system architecture or stack traces to an attacker.
**Prevention:** API error responses should always return a generic 'Internal Server Error' message, while logging detailed errors server-side.
## 2026-04-30 - Overly Permissive CORS Policy
**Vulnerability:** The Express server used `app.use(cors())` without any options, which allows cross-origin requests from any origin by default.
**Learning:** A missing or overly permissive CORS policy can allow malicious websites to make unauthorized API requests on behalf of a user.
**Prevention:** Always restrict CORS to known, trusted origins using an environment variable like `ALLOWED_ORIGINS`, explicitly permitting local development domains only when necessary.
