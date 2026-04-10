## 2024-05-22 - Unsafe AI Response Handling
**Vulnerability:** The `gradeOpenEndedAnswer` function directly called the AI service and parsed the result without error handling.
**Learning:** External AI services (LLMs) are unreliable. They can fail (network) or hallucinate (return invalid JSON).
**Prevention:** All AI service calls must be wrapped in `try-catch`. JSON parsing must be safe (e.g., using `zod` or `try-catch`). Always return a safe fallback object to the UI.

## 2026-04-10 - In-Memory Rate Limiting & Secure Error Responses in Node/Express
**Vulnerability:** Express endpoints handling LLM requests (`/api/generate`, `/api/stream`) lacked rate limiting and returned raw `error.message` directly to clients on failure, enabling potential token exhaustion and information leakage.
**Learning:** Implementing in-memory rate limiting requires careful memory management to prevent OOM. Additionally, Express does not automatically handle proxy trust appropriately unless configured, so using `req.socket.remoteAddress` directly without `app.set('trust proxy', 1)` avoids IP spoofing vulnerabilities when proxy setups are unknown. Also, returning raw error messages to the client is a common anti-pattern that exposes internal architecture.
**Prevention:** Use a Map to track IP requests, implement a `setInterval` with `.unref()` to purge expired entries, manually capture IPs via `req.socket.remoteAddress`, and always use generic fallback messages like \"Internal Server Error\" in `catch` blocks.
