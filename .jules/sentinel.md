## 2024-05-22 - Unsafe AI Response Handling
**Vulnerability:** The `gradeOpenEndedAnswer` function directly called the AI service and parsed the result without error handling.
**Learning:** External AI services (LLMs) are unreliable. They can fail (network) or hallucinate (return invalid JSON).
**Prevention:** All AI service calls must be wrapped in `try-catch`. JSON parsing must be safe (e.g., using `zod` or `try-catch`). Always return a safe fallback object to the UI.

## 2026-05-16 - Overly Permissive CORS and Error Leakage
**Vulnerability:** CORS was unrestricted and error messages leaked internal stack traces/messages.
**Learning:** Default configurations often prioritize convenience over security, leaking details or allowing unauthorized cross-origin requests.
**Prevention:** Use strictly validated ALLOWED_ORIGINS for CORS and always return generic 500 error messages to clients.
