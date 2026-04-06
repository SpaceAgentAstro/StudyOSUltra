## 2024-05-22 - Unsafe AI Response Handling
**Vulnerability:** The `gradeOpenEndedAnswer` function directly called the AI service and parsed the result without error handling.
**Learning:** External AI services (LLMs) are unreliable. They can fail (network) or hallucinate (return invalid JSON).
**Prevention:** All AI service calls must be wrapped in `try-catch`. JSON parsing must be safe (e.g., using `zod` or `try-catch`). Always return a safe fallback object to the UI.

## 2024-05-22 - Missing Rate Limiting & Information Leakage
**Vulnerability:** The `/api/generate` and `/api/stream` endpoints lacked rate limiting, exposing the server to DoS and token exhaustion attacks. Additionally, error details were sent to the client, exposing server internal structures.
**Learning:** Publicly accessible endpoints calling expensive services must have usage boundaries. Relying on default error serialization leaks stack traces or service-specific errors to users.
**Prevention:** Implement in-memory Map rate limiting with a background cleanup interval (`setInterval().unref()`). Replace dynamic server error messages with generic string defaults (e.g., "Internal Server Error").
