## 2024-05-22 - Unsafe AI Response Handling
**Vulnerability:** The `gradeOpenEndedAnswer` function directly called the AI service and parsed the result without error handling.
**Learning:** External AI services (LLMs) are unreliable. They can fail (network) or hallucinate (return invalid JSON).
**Prevention:** All AI service calls must be wrapped in `try-catch`. JSON parsing must be safe (e.g., using `zod` or `try-catch`). Always return a safe fallback object to the UI.
## 2026-05-30 - Error message leakage
**Vulnerability:** Internal error messages were being leaked in the API error response, potentially exposing sensitive details.
**Learning:** Always use generic error messages like 'Internal Server Error' in HTTP error responses to prevent information leakage.
**Prevention:** Apply a safe fallback generic error message and log the true exception safely via console.error.
