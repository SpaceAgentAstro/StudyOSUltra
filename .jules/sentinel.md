## 2024-05-22 - Unsafe AI Response Handling
**Vulnerability:** The `gradeOpenEndedAnswer` function directly called the AI service and parsed the result without error handling.
**Learning:** External AI services (LLMs) are unreliable. They can fail (network) or hallucinate (return invalid JSON).
**Prevention:** All AI service calls must be wrapped in `try-catch`. JSON parsing must be safe (e.g., using `zod` or `try-catch`). Always return a safe fallback object to the UI.
## 2026-05-17 - [Permissive CORS and Error Leakage]
**Vulnerability:** Permissive CORS using `app.use(cors())` and API error leakage in Express endpoints exposed internal details.
**Learning:** The default Express setup failed to restrict cross-origin requests and leaked `error.message` directly to clients, creating an info leakage vulnerability.
**Prevention:** Always restrict CORS policies using an `ALLOWED_ORIGINS` allowlist with strict local development validation, and ensure API error handlers return generic messages.
