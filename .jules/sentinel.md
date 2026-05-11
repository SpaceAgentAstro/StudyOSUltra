## 2024-05-22 - Unsafe AI Response Handling
**Vulnerability:** The `gradeOpenEndedAnswer` function directly called the AI service and parsed the result without error handling.
**Learning:** External AI services (LLMs) are unreliable. They can fail (network) or hallucinate (return invalid JSON).
**Prevention:** All AI service calls must be wrapped in `try-catch`. JSON parsing must be safe (e.g., using `zod` or `try-catch`). Always return a safe fallback object to the UI.
## 2026-05-11 - Overly Permissive CORS
**Vulnerability:** The Express server used a default `cors()` configuration, allowing requests from any origin.
**Learning:** Default CORS configurations are often overly permissive and must be explicitly restricted to prevent unauthorized cross-origin requests.
**Prevention:** Always restrict CORS to specific trusted origins using environment variables and explicit validation logic.
