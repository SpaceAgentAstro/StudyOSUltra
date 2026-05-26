## 2024-05-22 - Unsafe AI Response Handling
**Vulnerability:** The `gradeOpenEndedAnswer` function directly called the AI service and parsed the result without error handling.
**Learning:** External AI services (LLMs) are unreliable. They can fail (network) or hallucinate (return invalid JSON).
**Prevention:** All AI service calls must be wrapped in `try-catch`. JSON parsing must be safe (e.g., using `zod` or `try-catch`). Always return a safe fallback object to the UI.

## 2026-05-26 - Error Message Leakage in API Responses
**Vulnerability:** The `/api/generate` and `/api/stream` endpoints exposed `error.message` directly in 500 error responses.
**Learning:** Exposing internal error messages or stack traces in API responses can leak sensitive system details or logic to attackers.
**Prevention:** When handling exceptions in endpoints, always return a generic error message (e.g., `res.status(500).json({ error: "Internal Server Error" })`).
