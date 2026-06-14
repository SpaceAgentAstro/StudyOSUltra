## 2024-05-22 - Unsafe AI Response Handling
**Vulnerability:** The `gradeOpenEndedAnswer` function directly called the AI service and parsed the result without error handling.
**Learning:** External AI services (LLMs) are unreliable. They can fail (network) or hallucinate (return invalid JSON).
**Prevention:** All AI service calls must be wrapped in `try-catch`. JSON parsing must be safe (e.g., using `zod` or `try-catch`). Always return a safe fallback object to the UI.

## 2024-05-28 - Overly Permissive CORS Configuration
**Vulnerability:** `app.use(cors())` allows any origin to make requests to the server, which can lead to unauthorized cross-origin access.
**Learning:** Default CORS configurations are often overly permissive and do not protect the API from being accessed by malicious domains.
**Prevention:** Always use environment-aware strict origin validation. Implement a callback to validate the `origin` against a configurable list (e.g., `process.env.ALLOWED_ORIGINS`), explicitly allow missing origins for server-to-server requests, and provide a strict rejection path for unrecognized origins.
