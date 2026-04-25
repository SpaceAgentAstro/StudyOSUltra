## 2024-05-22 - Unsafe AI Response Handling
**Vulnerability:** The `gradeOpenEndedAnswer` function directly called the AI service and parsed the result without error handling.
**Learning:** External AI services (LLMs) are unreliable. They can fail (network) or hallucinate (return invalid JSON).
**Prevention:** All AI service calls must be wrapped in `try-catch`. JSON parsing must be safe (e.g., using `zod` or `try-catch`). Always return a safe fallback object to the UI.

## 2025-03-05 - Fix Error Leakage and Permissive CORS
**Vulnerability:** API endpoints `/api/generate` and `/api/stream` returned `error.message` directly to clients on failure, and the global CORS policy `app.use(cors())` allowed requests from any origin.
**Learning:** Exposing detailed error strings leaks internal system details (which can aid attackers in reconnaissance), and an overly permissive CORS configuration exposes the API to cross-origin requests from unauthorized domains, increasing the risk of CSRF or data exfiltration.
**Prevention:** Always catch and log detailed errors on the backend but return generic messages (like "Internal Server Error") to the client. Restrict CORS by validating the `Origin` header against an explicitly defined whitelist (e.g., via an `ALLOWED_ORIGINS` environment variable) while safely permitting necessary local development addresses.
