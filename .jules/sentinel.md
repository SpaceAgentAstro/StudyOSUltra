## 2024-05-22 - Unsafe AI Response Handling
**Vulnerability:** The `gradeOpenEndedAnswer` function directly called the AI service and parsed the result without error handling.
**Learning:** External AI services (LLMs) are unreliable. They can fail (network) or hallucinate (return invalid JSON).
**Prevention:** All AI service calls must be wrapped in `try-catch`. JSON parsing must be safe (e.g., using `zod` or `try-catch`). Always return a safe fallback object to the UI.

## 2024-05-24 - Rate Limiting Cleanup & Error Information Leakage
**Vulnerability:** Missing rate limiting made endpoints vulnerable to token exhaustion/DoS, and error messages returned by generate API could leak internal info via `error.message`.
**Learning:** Using `setInterval` for cleanup in in-memory rate limiters must include `.unref()` so it does not block the Node.js process from exiting cleanly. Server errors must return generic "Internal Server Error" rather than the detailed original stack/message.
**Prevention:** Implement IP-based limits for `/api` with an unref'd cleaner interval and ensure catch blocks obscure the internal error payload (`error.message`).
