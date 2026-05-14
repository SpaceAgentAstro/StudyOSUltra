## 2024-05-22 - Unsafe AI Response Handling
**Vulnerability:** The `gradeOpenEndedAnswer` function directly called the AI service and parsed the result without error handling.
**Learning:** External AI services (LLMs) are unreliable. They can fail (network) or hallucinate (return invalid JSON).
**Prevention:** All AI service calls must be wrapped in `try-catch`. JSON parsing must be safe (e.g., using `zod` or `try-catch`). Always return a safe fallback object to the UI.
## 2026-05-14 - [Secure CORS Policy]
**Vulnerability:** Overly permissive CORS and potential stack trace leaks on rejection.
**Learning:** Rejecting unauthorized CORS origins via `callback(new Error())` can leak internal stack traces. Additionally, validating local development origins must include the colon (e.g. `http://localhost:`) to prevent subdomain bypass.
**Prevention:** Always use `callback(null, false)` to gracefully reject origins without leaking errors, and strictly match local origins with trailing colons.
