## 2024-05-22 - Unsafe AI Response Handling
**Vulnerability:** The `gradeOpenEndedAnswer` function directly called the AI service and parsed the result without error handling.
**Learning:** External AI services (LLMs) are unreliable. They can fail (network) or hallucinate (return invalid JSON).
**Prevention:** All AI service calls must be wrapped in `try-catch`. JSON parsing must be safe (e.g., using `zod` or `try-catch`). Always return a safe fallback object to the UI.

## 2024-06-12 - Overly Permissive CORS Configuration
**Vulnerability:** The server used `app.use(cors())` which allows requests from any origin, creating a Cross-Origin POST vulnerability.
**Learning:** Default CORS configurations are overly permissive. Restricting only methods is insufficient.
**Prevention:** Always restrict CORS `origin` via environment variables (e.g. `process.env.ALLOWED_ORIGINS`) with a strict rejection path and explicitly define allowed HTTP methods.
