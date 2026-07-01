## 2024-05-22 - Unsafe AI Response Handling
**Vulnerability:** The `gradeOpenEndedAnswer` function directly called the AI service and parsed the result without error handling.
**Learning:** External AI services (LLMs) are unreliable. They can fail (network) or hallucinate (return invalid JSON).
**Prevention:** All AI service calls must be wrapped in `try-catch`. JSON parsing must be safe (e.g., using `zod` or `try-catch`). Always return a safe fallback object to the UI.
## 2026-07-01 - Secure CORS Configuration
**Vulnerability:** Overly permissive CORS configuration (`app.use(cors())`) allowed any origin to access the API.
**Learning:** Default CORS middleware configurations without explicitly defined origins can leave APIs vulnerable to unauthorized cross-origin requests.
**Prevention:** Always restrict allowed origins using an environment-variable-based whitelist with safe fallbacks for local development, and explicitly allow missing origins for server-to-server or testing tool requests.
