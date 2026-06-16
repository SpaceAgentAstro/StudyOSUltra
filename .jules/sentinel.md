## 2024-05-22 - Unsafe AI Response Handling
**Vulnerability:** The `gradeOpenEndedAnswer` function directly called the AI service and parsed the result without error handling.
**Learning:** External AI services (LLMs) are unreliable. They can fail (network) or hallucinate (return invalid JSON).
**Prevention:** All AI service calls must be wrapped in `try-catch`. JSON parsing must be safe (e.g., using `zod` or `try-catch`). Always return a safe fallback object to the UI.
## 2024-05-24 - Overly Permissive CORS Configuration
**Vulnerability:** The Express server used `app.use(cors())` which allows any origin to access the API.
**Learning:** Using default CORS configurations without origin validation is a major security risk for APIs as it allows unauthorized cross-origin requests.
**Prevention:** Always implement strict CORS origin validation. Use an environment variable fallback mechanism to support production domains while safely falling back to localized development domains.
