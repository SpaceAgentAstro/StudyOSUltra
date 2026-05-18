## 2024-05-22 - Unsafe AI Response Handling
**Vulnerability:** The `gradeOpenEndedAnswer` function directly called the AI service and parsed the result without error handling.
**Learning:** External AI services (LLMs) are unreliable. They can fail (network) or hallucinate (return invalid JSON).
**Prevention:** All AI service calls must be wrapped in `try-catch`. JSON parsing must be safe (e.g., using `zod` or `try-catch`). Always return a safe fallback object to the UI.
## 2026-05-18 - CORS Misconfiguration
**Vulnerability:** The application was using an overly permissive CORS configuration (`app.use(cors())`) which allowed all origins (`*`).
**Learning:** Default CORS configurations often allow all cross-origin requests, which can lead to data exposure or CSRF vulnerabilities if not correctly scoped.
**Prevention:** Explicitly restrict the `origin` parameter in CORS configurations using environment variables like `ALLOWED_ORIGINS` for production, while carefully allowing local development ports.
