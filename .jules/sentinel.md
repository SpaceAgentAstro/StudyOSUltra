## 2024-05-22 - Unsafe AI Response Handling
**Vulnerability:** The `gradeOpenEndedAnswer` function directly called the AI service and parsed the result without error handling.
**Learning:** External AI services (LLMs) are unreliable. They can fail (network) or hallucinate (return invalid JSON).
**Prevention:** All AI service calls must be wrapped in `try-catch`. JSON parsing must be safe (e.g., using `zod` or `try-catch`). Always return a safe fallback object to the UI.

## 2024-06-20 - Overly Permissive CORS Configuration
**Vulnerability:** The application used `app.use(cors())` which allows requests from any origin, making it susceptible to unauthorized cross-origin requests.
**Learning:** Using the default `cors()` configuration without specifying allowed origins is a security risk as it completely disables the browser's Same-Origin Policy protection for the API.
**Prevention:** Always implement dynamic CORS origin validation using a whitelist (e.g., from environment variables) and strictly reject unrecognized origins. Explicitly allow missing origins to support server-to-server requests and local testing tools.
