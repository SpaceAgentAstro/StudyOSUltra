## 2024-05-22 - Unsafe AI Response Handling
**Vulnerability:** The `gradeOpenEndedAnswer` function directly called the AI service and parsed the result without error handling.
**Learning:** External AI services (LLMs) are unreliable. They can fail (network) or hallucinate (return invalid JSON).
**Prevention:** All AI service calls must be wrapped in `try-catch`. JSON parsing must be safe (e.g., using `zod` or `try-catch`). Always return a safe fallback object to the UI.
## 2026-04-27 - Restricted CORS Configuration
**Vulnerability:** The Express server used `app.use(cors())` without arguments, which allows requests from any origin by default, enabling unauthorized cross-origin access in production.
**Learning:** Default CORS configurations are often overly permissive. Origin validation must be explicitly configured, but local development environments must still be safely accommodated.
**Prevention:** Always restrict CORS policies using an environment variable whitelist (e.g., `ALLOWED_ORIGINS`). Ensure local development exceptions strictly validate the protocol and port structure (e.g., `origin.startsWith('http://localhost:')`) to prevent domain spoofing bypasses.
