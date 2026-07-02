## 2024-05-22 - Unsafe AI Response Handling
**Vulnerability:** The `gradeOpenEndedAnswer` function directly called the AI service and parsed the result without error handling.
**Learning:** External AI services (LLMs) are unreliable. They can fail (network) or hallucinate (return invalid JSON).
**Prevention:** All AI service calls must be wrapped in `try-catch`. JSON parsing must be safe (e.g., using `zod` or `try-catch`). Always return a safe fallback object to the UI.
## 2025-02-28 - [Overly Permissive CORS Configuration]
**Vulnerability:** The Express server used `app.use(cors())` which allows requests from any origin by default.
**Learning:** Default CORS configurations can easily lead to overly permissive policies, exposing the API to Cross-Origin Resource Sharing attacks, especially when API keys are being handled.
**Prevention:** Always explicitly define allowed origins using environment variables or a specific whitelist, handle missing origins gracefully for local testing, and restrict allowed HTTP methods to only those actually used by the endpoints.
