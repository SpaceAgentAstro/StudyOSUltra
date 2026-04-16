## 2024-05-22 - Unsafe AI Response Handling
**Vulnerability:** The `gradeOpenEndedAnswer` function directly called the AI service and parsed the result without error handling.
**Learning:** External AI services (LLMs) are unreliable. They can fail (network) or hallucinate (return invalid JSON).
**Prevention:** All AI service calls must be wrapped in `try-catch`. JSON parsing must be safe (e.g., using `zod` or `try-catch`). Always return a safe fallback object to the UI.

## 2024-05-24 - Missing Rate Limiting on Sensitive Endpoints
**Vulnerability:** The `/api/generate` and `/api/stream` endpoints lacked rate limiting. In an environment without built-in infrastructure protection, an attacker could bombard the AI service endpoints leading to DoS and token exhaustion (cost implications).
**Learning:** `app.set('trust proxy', 1)` cannot be blindly trusted when the production environment proxy configuration is unknown or variable. Trusting proxy blindly can lead to trivial IP spoofing bypass for rate limiting using `X-Forwarded-For` headers.
**Prevention:** Implement strict IP-based rate limiters directly utilizing `req.socket.remoteAddress` and only trust proxies if the architectural configuration explicitly guarantees stripped headers.
