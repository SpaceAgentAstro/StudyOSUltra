## 2024-05-22 - Unsafe AI Response Handling
**Vulnerability:** The `gradeOpenEndedAnswer` function directly called the AI service and parsed the result without error handling.
**Learning:** External AI services (LLMs) are unreliable. They can fail (network) or hallucinate (return invalid JSON).
**Prevention:** All AI service calls must be wrapped in `try-catch`. JSON parsing must be safe (e.g., using `zod` or `try-catch`). Always return a safe fallback object to the UI.
## 2026-05-10 - CORS and Error Message Leakage Fix
**Vulnerability:** Permissive CORS and returning raw error messages to clients.
**Learning:** Default CORS allows all origins. Returning error.message can leak sensitive paths or implementation details.
**Prevention:** Explicitly configure CORS allowed origins, and always return generic error messages to clients.
