## 2024-05-22 - Unsafe AI Response Handling
**Vulnerability:** The `gradeOpenEndedAnswer` function directly called the AI service and parsed the result without error handling.
**Learning:** External AI services (LLMs) are unreliable. They can fail (network) or hallucinate (return invalid JSON).
**Prevention:** All AI service calls must be wrapped in `try-catch`. JSON parsing must be safe (e.g., using `zod` or `try-catch`). Always return a safe fallback object to the UI.
## 2024-05-22 - Overly Permissive CORS Configuration
**Vulnerability:** The Express server used `app.use(cors())` with no configuration, defaulting to allowing all origins (`*`), which leaves the server vulnerable to Cross-Origin requests from malicious sites.
**Learning:** Default configurations in security middlewares like `cors` can be overly permissive and dangerous in production if left unconfigured.
**Prevention:** Always explicitly configure CORS with an origin whitelist, using environment variables for production flexibility and safe defaults for local development. Ensure missing origins are allowed if server-to-server or non-browser requests are expected.
