## 2024-05-22 - Unsafe AI Response Handling
**Vulnerability:** The `gradeOpenEndedAnswer` function directly called the AI service and parsed the result without error handling.
**Learning:** External AI services (LLMs) are unreliable. They can fail (network) or hallucinate (return invalid JSON).
**Prevention:** All AI service calls must be wrapped in `try-catch`. JSON parsing must be safe (e.g., using `zod` or `try-catch`). Always return a safe fallback object to the UI.

## 2024-05-24 - Insecure CORS Configuration
**Vulnerability:** The server was configured with `app.use(cors())`, allowing requests from any origin. This could allow malicious websites to make unauthorized requests to the backend API.
**Learning:** Default middleware configurations are often insecure for production. Always review default settings.
**Prevention:** Implement strict CORS policies using a whitelist of allowed origins (e.g., `process.env.ALLOWED_ORIGINS`).
