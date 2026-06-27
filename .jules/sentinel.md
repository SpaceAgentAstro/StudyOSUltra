## 2024-05-22 - Unsafe AI Response Handling
**Vulnerability:** The `gradeOpenEndedAnswer` function directly called the AI service and parsed the result without error handling.
**Learning:** External AI services (LLMs) are unreliable. They can fail (network) or hallucinate (return invalid JSON).
**Prevention:** All AI service calls must be wrapped in `try-catch`. JSON parsing must be safe (e.g., using `zod` or `try-catch`). Always return a safe fallback object to the UI.

## 2024-06-27 - Strict CORS Configuration
**Vulnerability:** The application used an overly permissive CORS configuration (`app.use(cors())`), allowing any origin to access the API.
**Learning:** Hardcoding local development URLs can break production. We need a dynamic approach using environment variables.
**Prevention:** Always implement a CORS configuration that reads allowed origins from environment variables (`ALLOWED_ORIGINS`), falls back to safe local URLs, and explicitly handles requests missing the Origin header for server-to-server calls.
