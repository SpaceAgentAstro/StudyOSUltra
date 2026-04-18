## 2024-05-22 - Unsafe AI Response Handling
**Vulnerability:** The `gradeOpenEndedAnswer` function directly called the AI service and parsed the result without error handling.
**Learning:** External AI services (LLMs) are unreliable. They can fail (network) or hallucinate (return invalid JSON).
**Prevention:** All AI service calls must be wrapped in `try-catch`. JSON parsing must be safe (e.g., using `zod` or `try-catch`). Always return a safe fallback object to the UI.

## 2026-04-18 - CORS Misconfiguration and Information Leakage
**Vulnerability:** The application was using a wide-open CORS policy (`app.use(cors())`) which allows any origin to make requests. Additionally, internal error messages were being leaked to the client via `res.status(500).json({ error: error.message || "Internal Server Error" })`.
**Learning:** Relying on default CORS configurations without explicit origin verification is risky, especially for production environments. Passing internal error messages to the client can expose sensitive details about the stack or server configuration.
**Prevention:** Always restrict CORS policies by specifying an `origin` function that verifies against an `ALLOWED_ORIGINS` environment variable (or safely allows local development). Ensure generic, non-descriptive error messages are returned to the client to avoid internal leakage.
