## 2024-05-22 - Unsafe AI Response Handling
**Vulnerability:** The `gradeOpenEndedAnswer` function directly called the AI service and parsed the result without error handling.
**Learning:** External AI services (LLMs) are unreliable. They can fail (network) or hallucinate (return invalid JSON).
**Prevention:** All AI service calls must be wrapped in `try-catch`. JSON parsing must be safe (e.g., using `zod` or `try-catch`). Always return a safe fallback object to the UI.

## 2026-05-02 - Prevent API Information Leakage and CORS Bypass
**Vulnerability:** The API endpoints were leaking internal error details (`error.message`) in the catch blocks. Also, CORS configuration was completely open (`app.use(cors())`).
**Learning:** Returning detailed error messages to the client can leak sensitive system internals. Unrestricted CORS allows any domain to make requests to the API.
**Prevention:** Always fail securely by returning a generic "Internal Server Error" to the client and logging the actual error internally. Configure CORS strictly with a whitelist (`ALLOWED_ORIGINS`) and fail unauthorized requests gracefully with `callback(null, false)` to prevent stack trace leaks.
