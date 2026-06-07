## 2024-05-22 - Unsafe AI Response Handling
**Vulnerability:** The `gradeOpenEndedAnswer` function directly called the AI service and parsed the result without error handling.
**Learning:** External AI services (LLMs) are unreliable. They can fail (network) or hallucinate (return invalid JSON).
**Prevention:** All AI service calls must be wrapped in `try-catch`. JSON parsing must be safe (e.g., using `zod` or `try-catch`). Always return a safe fallback object to the UI.
## 2026-06-07 - Overly Permissive CORS
**Vulnerability:** The server used `app.use(cors())` which allows all origins and methods.
**Learning:** This is too permissive and exposes the API unnecessarily.
**Prevention:** Restrict CORS methods to only those actually used by the endpoints (e.g., GET, POST).
