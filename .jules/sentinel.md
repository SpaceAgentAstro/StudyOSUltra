## 2024-05-22 - Unsafe AI Response Handling
**Vulnerability:** The `gradeOpenEndedAnswer` function directly called the AI service and parsed the result without error handling.
**Learning:** External AI services (LLMs) are unreliable. They can fail (network) or hallucinate (return invalid JSON).
**Prevention:** All AI service calls must be wrapped in `try-catch`. JSON parsing must be safe (e.g., using `zod` or `try-catch`). Always return a safe fallback object to the UI.

## 2024-06-06 - Safe CORS Restrictiveness
**Vulnerability:** The application was using an overly permissive `app.use(cors())` configuration which defaults to `*` (allowing all origins).
**Learning:** When attempting to lock down CORS by explicitly defining `methods: ['GET', 'POST']`, it is critical to verify all application routes to ensure required HTTP methods (like PUT, DELETE, PATCH) are not accidentally blocked.
**Prevention:** Always audit the codebase for existing route definitions (e.g., using `grep -E "app\.(post|get|put|delete|patch)"`) before applying strict CORS method restrictions to avoid introducing regressions.
