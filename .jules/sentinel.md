## 2024-05-22 - Unsafe AI Response Handling
**Vulnerability:** The `gradeOpenEndedAnswer` function directly called the AI service and parsed the result without error handling.
**Learning:** External AI services (LLMs) are unreliable. They can fail (network) or hallucinate (return invalid JSON).
**Prevention:** All AI service calls must be wrapped in `try-catch`. JSON parsing must be safe (e.g., using `zod` or `try-catch`). Always return a safe fallback object to the UI.

## 2024-05-23 - Express Rate Limiting Memory Leaks
**Vulnerability:** In-memory rate limiting Maps without cleanup intervals cause memory exhaustion (DoS) over time.
**Learning:** In single-instance Node/Express apps, simple maps grow infinitely as unique IPs visit. Using `setInterval` with `.unref()` is required to clean up old entries without preventing the Node process from exiting.
**Prevention:** Always pair `new Map()` based rate limiters with a `setInterval` cleanup function, and call `.unref()` on the timer.
