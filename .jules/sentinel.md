## 2024-05-22 - Unsafe AI Response Handling
**Vulnerability:** The `gradeOpenEndedAnswer` function directly called the AI service and parsed the result without error handling.
**Learning:** External AI services (LLMs) are unreliable. They can fail (network) or hallucinate (return invalid JSON).
**Prevention:** All AI service calls must be wrapped in `try-catch`. JSON parsing must be safe (e.g., using `zod` or `try-catch`). Always return a safe fallback object to the UI.
## 2026-05-22 - Secure CORS and Error Handling
**Vulnerability:** Overly permissive CORS policy and leaked error messages in API endpoints.
**Learning:** Default cors() permits all origins, and returning error.message can expose internal system details.
**Prevention:** Restrict CORS via ALLOWED_ORIGINS and localhost validation, and always return generic error messages.
