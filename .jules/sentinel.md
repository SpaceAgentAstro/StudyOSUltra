## 2024-05-22 - Unsafe AI Response Handling
**Vulnerability:** The `gradeOpenEndedAnswer` function directly called the AI service and parsed the result without error handling.
**Learning:** External AI services (LLMs) are unreliable. They can fail (network) or hallucinate (return invalid JSON).
**Prevention:** All AI service calls must be wrapped in `try-catch`. JSON parsing must be safe (e.g., using `zod` or `try-catch`). Always return a safe fallback object to the UI.

## 2024-06-15 - In-Memory Rate Limiting Memory Leak and Information Leakage
**Vulnerability:** The Node/Express server lacked rate limiting, and its error handlers leaked inner details (`error.message`) to the client upon failure. Implementing an in-memory rate limiter using a `Map` without cleanup introduces an Out-Of-Memory (OOM) DoS vulnerability.
**Learning:** When using `Map` for rate-limiting, expired entries must be periodically deleted. Furthermore, background timers like `setInterval` can block Node.js from cleanly exiting.
**Prevention:** Pair the `Map` with a `setInterval` that deletes entries older than the time window, and call `.unref()` on the timer to prevent blocking exit. Always fail securely by returning generic error messages (e.g., "Internal Server Error") instead of `error.message`.
