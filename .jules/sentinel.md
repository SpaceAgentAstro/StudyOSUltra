## 2024-05-22 - Unsafe AI Response Handling
**Vulnerability:** The `gradeOpenEndedAnswer` function directly called the AI service and parsed the result without error handling.
**Learning:** External AI services (LLMs) are unreliable. They can fail (network) or hallucinate (return invalid JSON).
**Prevention:** All AI service calls must be wrapped in `try-catch`. JSON parsing must be safe (e.g., using `zod` or `try-catch`). Always return a safe fallback object to the UI.
## 2024-05-24 - Overly Permissive CORS
**Vulnerability:** `app.use(cors())` was used without configuration, allowing cross-origin requests from any domain in production.
**Learning:** Default configurations for security-sensitive middleware (like CORS) are often overly permissive to prioritize ease of use.
**Prevention:** Always restrict CORS explicitly using environment variables (e.g., `ALLOWED_ORIGINS`) and fail closed for unauthorized origins.
