## 2024-05-22 - Unsafe AI Response Handling
**Vulnerability:** The `gradeOpenEndedAnswer` function directly called the AI service and parsed the result without error handling.
**Learning:** External AI services (LLMs) are unreliable. They can fail (network) or hallucinate (return invalid JSON).
**Prevention:** All AI service calls must be wrapped in `try-catch`. JSON parsing must be safe (e.g., using `zod` or `try-catch`). Always return a safe fallback object to the UI.

## 2026-05-21 - Overly Permissive CORS and Error Leakage
**Vulnerability:** The server used global `cors()` permitting any origin, and exposed `error.message` in API response payloads.
**Learning:** Unrestricted CORS allows CSRF and other domain attacks. Exposing stack or specific error messages leaks system context.
**Prevention:** Use strictly validated origin rules in CORS and always fallback to generic 500 status strings in API endpoints.
