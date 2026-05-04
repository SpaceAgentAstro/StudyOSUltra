## 2024-05-22 - Unsafe AI Response Handling
**Vulnerability:** The `gradeOpenEndedAnswer` function directly called the AI service and parsed the result without error handling.
**Learning:** External AI services (LLMs) are unreliable. They can fail (network) or hallucinate (return invalid JSON).
**Prevention:** All AI service calls must be wrapped in `try-catch`. JSON parsing must be safe (e.g., using `zod` or `try-catch`). Always return a safe fallback object to the UI.
## 2026-05-04 - Overly Permissive CORS Configuration
**Vulnerability:** The application used `app.use(cors())` which allows requests from any origin by default, leading to an overly permissive CORS policy.
**Learning:** This could allow unauthorized subdomains or external sites to access the API. The configuration must be explicitly restricted.
**Prevention:** Use an `ALLOWED_ORIGINS` environment variable and strict local development checks (e.g., `origin.startsWith('http://localhost:')`) to enforce a secure CORS policy. Reject unauthorized origins gracefully using `callback(null, false)`.
