## 2024-05-22 - Unsafe AI Response Handling
**Vulnerability:** The `gradeOpenEndedAnswer` function directly called the AI service and parsed the result without error handling.
**Learning:** External AI services (LLMs) are unreliable. They can fail (network) or hallucinate (return invalid JSON).
**Prevention:** All AI service calls must be wrapped in `try-catch`. JSON parsing must be safe (e.g., using `zod` or `try-catch`). Always return a safe fallback object to the UI.

## 2024-05-23 - Overly Permissive CORS
**Vulnerability:** The server used `app.use(cors())` which allows cross-origin requests from any origin with any method, potentially exposing the API to unauthorized cross-origin use.
**Learning:** Default CORS configurations are often too permissive. You must restrict the allowed HTTP methods (and origins if possible) to only what is necessary for the application.
**Prevention:** Always configure the `cors` middleware with specific options, such as `{ methods: ['POST'] }`, rather than calling it with no arguments.
**Update:** Restricting methods without restricting the `origin` is insufficient and still leaves the API vulnerable to cross-origin POST requests. Always provide an explicitly restricted `origin` whitelist.
