## 2024-05-22 - Unsafe AI Response Handling
**Vulnerability:** The `gradeOpenEndedAnswer` function directly called the AI service and parsed the result without error handling.
**Learning:** External AI services (LLMs) are unreliable. They can fail (network) or hallucinate (return invalid JSON).
**Prevention:** All AI service calls must be wrapped in `try-catch`. JSON parsing must be safe (e.g., using `zod` or `try-catch`). Always return a safe fallback object to the UI.
## 2024-05-24 - Overly Permissive CORS
**Vulnerability:** The Express server used `app.use(cors())`, allowing requests from any origin.
**Learning:** Default CORS configurations are often overly permissive and can expose APIs to malicious sites. Restricting only methods is insufficient.
**Prevention:** Always implement strict CORS origin validation using an environment-variable-based whitelist (with safe local fallbacks) and a dynamic validation callback that safely rejects unrecognized origins while allowing missing origins for server-to-server calls.
