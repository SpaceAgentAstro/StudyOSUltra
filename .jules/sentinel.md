## 2024-05-22 - Unsafe AI Response Handling
**Vulnerability:** The `gradeOpenEndedAnswer` function directly called the AI service and parsed the result without error handling.
**Learning:** External AI services (LLMs) are unreliable. They can fail (network) or hallucinate (return invalid JSON).
**Prevention:** All AI service calls must be wrapped in `try-catch`. JSON parsing must be safe (e.g., using `zod` or `try-catch`). Always return a safe fallback object to the UI.

## 2024-05-24 - Missing AI Rate Limiting and Error Leakage
**Vulnerability:** The `/api/generate` and `/api/stream` AI endpoints had no rate limiting, leaving them open to DoS/token exhaustion. Error handling also returned the raw `error.message` to clients, leaking internal stack and configuration details.
**Learning:** Generative AI endpoints are particularly expensive and sensitive targets. Exposing raw errors often reveals model configurations or SDK nuances that shouldn't be public. Rate limiting is non-negotiable for cost protection.
**Prevention:** Always wrap public-facing, expensive endpoints with rate limiting (like an in-memory Map with an unref'd setInterval). Fail securely by logging the raw error server-side and returning a generic "Internal Server Error" to the client.
