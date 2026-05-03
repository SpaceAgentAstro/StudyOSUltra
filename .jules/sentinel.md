## 2024-05-22 - Unsafe AI Response Handling
**Vulnerability:** The `gradeOpenEndedAnswer` function directly called the AI service and parsed the result without error handling.
**Learning:** External AI services (LLMs) are unreliable. They can fail (network) or hallucinate (return invalid JSON).
**Prevention:** All AI service calls must be wrapped in `try-catch`. JSON parsing must be safe (e.g., using `zod` or `try-catch`). Always return a safe fallback object to the UI.
## 2026-05-03 - Overly Permissive CORS Configuration
**Vulnerability:** The Express server used a default `cors()` configuration, allowing any origin to access the API endpoints.
**Learning:** The default CORS config does not provide adequate security against unauthorized origins. Allowing all origins by default opens the application up to potential Cross-Site Request Forgery (CSRF) and other cross-origin attacks.
**Prevention:** Always restrict CORS using an `ALLOWED_ORIGINS` environment variable. Strictly validate origins and fail securely by rejecting unauthorized origins gracefully via the callback rather than throwing an error to prevent stack trace leakage.
