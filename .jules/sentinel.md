## 2024-05-22 - Unsafe AI Response Handling
**Vulnerability:** The `gradeOpenEndedAnswer` function directly called the AI service and parsed the result without error handling.
**Learning:** External AI services (LLMs) are unreliable. They can fail (network) or hallucinate (return invalid JSON).
**Prevention:** All AI service calls must be wrapped in `try-catch`. JSON parsing must be safe (e.g., using `zod` or `try-catch`). Always return a safe fallback object to the UI.
## 2024-05-24 - Overly Permissive CORS Configuration
**Vulnerability:** The Express backend used `app.use(cors())` which allowed cross-origin requests from any origin.
**Learning:** A missing or overly permissive CORS configuration allows malicious sites to make Cross-Origin POST requests, potentially abusing server endpoints.
**Prevention:** Always define explicit CORS options restricting both allowed origins (via environment variables or strict local defaults) and HTTP methods.
