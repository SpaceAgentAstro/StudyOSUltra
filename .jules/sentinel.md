## 2024-05-22 - Unsafe AI Response Handling
**Vulnerability:** The `gradeOpenEndedAnswer` function directly called the AI service and parsed the result without error handling.
**Learning:** External AI services (LLMs) are unreliable. They can fail (network) or hallucinate (return invalid JSON).
**Prevention:** All AI service calls must be wrapped in `try-catch`. JSON parsing must be safe (e.g., using `zod` or `try-catch`). Always return a safe fallback object to the UI.

## 2025-03-08 - Overly Permissive CORS & Error Leakage
**Vulnerability:** The API server used an overly permissive CORS configuration (`app.use(cors())`) and leaked internal error details in 500 responses (`res.status(500).json({ error: error.message || "Internal Server Error" })`).
**Learning:** Default configurations can often expose applications to CSRF or unintended cross-origin access, and returning full error messages to clients can leak sensitive system details.
**Prevention:** Explicitly restrict CORS to trusted origins (`ALLOWED_ORIGINS` + localhost) and always return generic error messages (e.g., "Internal Server Error") for unexpected server faults.
