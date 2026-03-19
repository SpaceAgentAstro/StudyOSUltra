## 2024-05-22 - Unsafe AI Response Handling
**Vulnerability:** The `gradeOpenEndedAnswer` function directly called the AI service and parsed the result without error handling.
**Learning:** External AI services (LLMs) are unreliable. They can fail (network) or hallucinate (return invalid JSON).
**Prevention:** All AI service calls must be wrapped in `try-catch`. JSON parsing must be safe (e.g., using `zod` or `try-catch`). Always return a safe fallback object to the UI.

## 2024-05-22 - Backend API Lack of Rate Limiting
**Vulnerability:** The proxy API (`/api/generate`, `/api/stream`) lacked rate-limiting, making it vulnerable to brute-force attacks and DoS.
**Learning:** Open proxy APIs must inherently implement rate-limiting at the Node/Express level, irrespective of client-side restrictions or backend LLM-provider limits.
**Prevention:** Always introduce rate-limiting middleware (`express-rate-limit`) on sensitive, high-compute endpoints in Express backends.
