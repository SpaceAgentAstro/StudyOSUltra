## 2024-05-22 - Unsafe AI Response Handling
**Vulnerability:** The `gradeOpenEndedAnswer` function directly called the AI service and parsed the result without error handling.
**Learning:** External AI services (LLMs) are unreliable. They can fail (network) or hallucinate (return invalid JSON).
**Prevention:** All AI service calls must be wrapped in `try-catch`. JSON parsing must be safe (e.g., using `zod` or `try-catch`). Always return a safe fallback object to the UI.

## 2024-05-24 - Rate Limiting & Safe Error Responses on AI Proxies
**Vulnerability:** Node.js Express endpoints acting as AI proxies (`/api/generate` and `/api/stream`) lacked rate-limiting and were returning detailed error strings (`error.message`) on exceptions, leading to DoS risks and information leakage.
**Learning:** Returning `error.message` directly from 3rd party AI SDKs can expose upstream architecture, network details, or sensitive limits. Unrestricted endpoints also allow token exhaustion and out-of-memory DoS.
**Prevention:** Always implement an IP-based rate limiter using `app.set('trust proxy', 1)` to handle requests from proxies properly, pair with `setInterval(...).unref()` for memory safety. Ensure `try-catch` blocks return safe, generic error messages like `"Internal Server Error"` rather than raw `error.message` from downstream services.
