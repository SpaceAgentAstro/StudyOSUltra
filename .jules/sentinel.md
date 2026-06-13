## 2024-05-22 - Unsafe AI Response Handling
**Vulnerability:** The `gradeOpenEndedAnswer` function directly called the AI service and parsed the result without error handling.
**Learning:** External AI services (LLMs) are unreliable. They can fail (network) or hallucinate (return invalid JSON).
**Prevention:** All AI service calls must be wrapped in `try-catch`. JSON parsing must be safe (e.g., using `zod` or `try-catch`). Always return a safe fallback object to the UI.

## 2024-06-13 - Permissive CORS Configuration
**Vulnerability:** The server used `app.use(cors())`, allowing any origin to make cross-origin requests.
**Learning:** Default CORS configurations are often overly permissive. Methods restrictions alone do not protect against malicious cross-origin requests.
**Prevention:** Explicitly restrict the `origin` property in CORS configurations, typically using environment variables like `ALLOWED_ORIGINS` to support production while preventing security theater.
