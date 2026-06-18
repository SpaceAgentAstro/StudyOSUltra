## 2024-05-22 - Unsafe AI Response Handling
**Vulnerability:** The `gradeOpenEndedAnswer` function directly called the AI service and parsed the result without error handling.
**Learning:** External AI services (LLMs) are unreliable. They can fail (network) or hallucinate (return invalid JSON).
**Prevention:** All AI service calls must be wrapped in `try-catch`. JSON parsing must be safe (e.g., using `zod` or `try-catch`). Always return a safe fallback object to the UI.

## 2024-06-18 - Overly Permissive CORS Configuration
**Vulnerability:** The Express API server used `app.use(cors())`, allowing all origins `*` to make requests.
**Learning:** Default CORS configurations are often overly permissive and can expose APIs to Cross-Origin Request Forgery and data exposure from malicious domains.
**Prevention:** Always restrict the `origin` using a dynamic callback that validates against a whitelist of allowed domains or environment variables, while explicitly allowing server-to-server requests if necessary.
