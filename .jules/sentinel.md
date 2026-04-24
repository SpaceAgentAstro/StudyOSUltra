## 2024-05-22 - Unsafe AI Response Handling
**Vulnerability:** The `gradeOpenEndedAnswer` function directly called the AI service and parsed the result without error handling.
**Learning:** External AI services (LLMs) are unreliable. They can fail (network) or hallucinate (return invalid JSON).
**Prevention:** All AI service calls must be wrapped in `try-catch`. JSON parsing must be safe (e.g., using `zod` or `try-catch`). Always return a safe fallback object to the UI.

## 2024-06-25 - Information Leakage and Overly Permissive CORS
**Vulnerability:** The API returned `error.message` directly on failure and used an unrestricted `cors()` configuration allowing any origin.
**Learning:** Detailed error messages can leak internal system details, and permissive CORS allows unauthorized frontends to consume the API.
**Prevention:** Always return a generic 'Internal Server Error' in catch blocks and enforce restrictive CORS policies via environment variables (e.g., `ALLOWED_ORIGINS`).
