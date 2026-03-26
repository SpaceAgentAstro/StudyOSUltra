## 2024-05-22 - Unsafe AI Response Handling
**Vulnerability:** The `gradeOpenEndedAnswer` function directly called the AI service and parsed the result without error handling.
**Learning:** External AI services (LLMs) are unreliable. They can fail (network) or hallucinate (return invalid JSON).
**Prevention:** All AI service calls must be wrapped in `try-catch`. JSON parsing must be safe (e.g., using `zod` or `try-catch`). Always return a safe fallback object to the UI.

## 2024-03-26 - Missing Rate Limiting on Proxy Endpoints
**Vulnerability:** The AI proxy endpoints (`/api/generate`, `/api/stream`) lacked rate limiting. While client payloads were bounded, an attacker could rapidly spam the endpoints to exhaust the API token (Denial of Wallet / DoS) and slow down the server.
**Learning:** Proxy endpoints bridging client traffic to external AI providers are highly vulnerable to token exhaustion. Relying purely on client-side constraints (or lack thereof) is insufficient for security.
**Prevention:** Always implement IP-based or session-based rate limiting on server endpoints that consume paid/external APIs. A lightweight in-memory sliding window or Map is sufficient for single-instance servers, but distributed setups require Redis.
