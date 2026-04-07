## 2024-05-22 - Unsafe AI Response Handling
**Vulnerability:** The `gradeOpenEndedAnswer` function directly called the AI service and parsed the result without error handling.
**Learning:** External AI services (LLMs) are unreliable. They can fail (network) or hallucinate (return invalid JSON).
**Prevention:** All AI service calls must be wrapped in `try-catch`. JSON parsing must be safe (e.g., using `zod` or `try-catch`). Always return a safe fallback object to the UI.

## 2024-05-23 - Express In-Memory Rate Limiting Pitfalls
**Vulnerability:** Memory leak and IP spoofing in custom rate limiters.
**Learning:** When implementing in-memory rate limiting with a `Map` in Node.js, failing to clear stale entries leads to OOM. Additionally, using `app.set('trust proxy', 1)` without knowing the explicit proxy topology allows attackers to spoof `X-Forwarded-For` and bypass limits.
**Prevention:** Always pair `Map`-based limiters with a garbage collector (e.g., `setInterval(..., ms).unref()`) to purge old IPs. Never enable `trust proxy` blindly; rely on default `req.ip` unless a trusted reverse proxy is guaranteed in production.
