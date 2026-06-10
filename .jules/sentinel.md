## 2024-05-22 - Unsafe AI Response Handling
**Vulnerability:** The `gradeOpenEndedAnswer` function directly called the AI service and parsed the result without error handling.
**Learning:** External AI services (LLMs) are unreliable. They can fail (network) or hallucinate (return invalid JSON).
**Prevention:** All AI service calls must be wrapped in `try-catch`. JSON parsing must be safe (e.g., using `zod` or `try-catch`). Always return a safe fallback object to the UI.
## 2025-03-08 - Overly Permissive CORS Configuration
**Vulnerability:** The Express server used `app.use(cors())` which allows requests from any origin.
**Learning:** Allowing all origins via CORS leaves the API endpoints vulnerable to Cross-Origin POST requests and potentially CSRF or unwanted API consumption from malicious sites. Restricting only the `methods` is insufficient; the `origin` must also be explicitly restricted.
**Prevention:** Always configure `cors()` with an explicit `origin` (e.g., matching the frontend's URL or leveraging environment variables) and strictly specify the allowed HTTP `methods`.
