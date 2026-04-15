## 2024-05-22 - Unsafe AI Response Handling
**Vulnerability:** The `gradeOpenEndedAnswer` function directly called the AI service and parsed the result without error handling.
**Learning:** External AI services (LLMs) are unreliable. They can fail (network) or hallucinate (return invalid JSON).
**Prevention:** All AI service calls must be wrapped in `try-catch`. JSON parsing must be safe (e.g., using `zod` or `try-catch`). Always return a safe fallback object to the UI.

## 2024-05-24 - Server API Security Enhancements
**Vulnerability:** The application had overly permissive CORS, leaked server error stack traces/details to the client via error messages, and lacked rate limiting on endpoints vulnerable to token exhaustion.
**Learning:** Default configuration for CORS exposes the server, API integrations often inadvertently leak internal errors, and public AI proxy endpoints require usage bounding.
**Prevention:** Always restrict CORS explicitly using environment-based whitelisting (`ALLOWED_ORIGINS`). Never use `error.message` in HTTP responses; use generic error strings like `"Internal Server Error"`. Apply rate limiting to all public-facing endpoints using IP limits (without relying on `trust proxy` if production architecture is unknown) to defend against brute force and exhaustion attacks.
