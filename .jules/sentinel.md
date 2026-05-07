## 2024-05-22 - Unsafe AI Response Handling
**Vulnerability:** The `gradeOpenEndedAnswer` function directly called the AI service and parsed the result without error handling.
**Learning:** External AI services (LLMs) are unreliable. They can fail (network) or hallucinate (return invalid JSON).
**Prevention:** All AI service calls must be wrapped in `try-catch`. JSON parsing must be safe (e.g., using `zod` or `try-catch`). Always return a safe fallback object to the UI.
## 2026-05-07 - Overly Permissive CORS
**Vulnerability:** The server used a globally permissive CORS configuration (`app.use(cors())`), exposing API endpoints to any origin.
**Learning:** Default CORS setups fail open. To securely permit local development without exposing the server, local origins must be strictly validated (e.g., matching 'http://localhost:' precisely) to prevent subdomain bypass attacks.
**Prevention:** Always restrict CORS policies via an ALLOWED_ORIGINS whitelist and reject unauthorized origins gracefully using `callback(null, false)` to avoid stack trace leaks.
