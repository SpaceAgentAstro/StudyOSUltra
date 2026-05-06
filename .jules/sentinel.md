## 2024-05-22 - Unsafe AI Response Handling
**Vulnerability:** The `gradeOpenEndedAnswer` function directly called the AI service and parsed the result without error handling.
**Learning:** External AI services (LLMs) are unreliable. They can fail (network) or hallucinate (return invalid JSON).
**Prevention:** All AI service calls must be wrapped in `try-catch`. JSON parsing must be safe (e.g., using `zod` or `try-catch`). Always return a safe fallback object to the UI.

## 2026-05-06 - Secure CORS Configuration Pattern
**Vulnerability:** The Express API used a wildcard CORS policy (`app.use(cors())`), exposing it to potential cross-origin attacks.
**Learning:** Default CORS configurations are often overly permissive. A custom origin validation function is required to securely handle both production environment variables and local development.
**Prevention:** Always restrict CORS policies using an `ALLOWED_ORIGINS` whitelist. When permitting local development, strictly validate using `origin.startsWith('http://localhost:')` (including the colon) to prevent subdomain bypasses, and fail gracefully with `callback(null, false)`.
