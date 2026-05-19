## 2024-05-22 - Unsafe AI Response Handling
**Vulnerability:** The `gradeOpenEndedAnswer` function directly called the AI service and parsed the result without error handling.
**Learning:** External AI services (LLMs) are unreliable. They can fail (network) or hallucinate (return invalid JSON).
**Prevention:** All AI service calls must be wrapped in `try-catch`. JSON parsing must be safe (e.g., using `zod` or `try-catch`). Always return a safe fallback object to the UI.

## 2026-05-19 - Strict CORS Localhost Validation
**Vulnerability:** Overly permissive CORS and loose localhost matching.
**Learning:** Using `startsWith('http://localhost')` without a colon allows bypassing via domains like `http://localhost.evil.com`.
**Prevention:** Always validate localhost origins strictly including the colon (e.g., `origin.startsWith('http://localhost:')`) and reject unauthorized origins gracefully using `callback(null, false)` rather than throwing an Error to prevent stack trace leaks.
