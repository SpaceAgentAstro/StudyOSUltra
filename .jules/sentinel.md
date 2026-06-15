## 2024-05-22 - Unsafe AI Response Handling
**Vulnerability:** The `gradeOpenEndedAnswer` function directly called the AI service and parsed the result without error handling.
**Learning:** External AI services (LLMs) are unreliable. They can fail (network) or hallucinate (return invalid JSON).
**Prevention:** All AI service calls must be wrapped in `try-catch`. JSON parsing must be safe (e.g., using `zod` or `try-catch`). Always return a safe fallback object to the UI.

## 2026-06-15 - Overly Permissive CORS Configuration
**Vulnerability:** The server used `app.use(cors())`, allowing any origin to access the API endpoints.
**Learning:** Using default CORS configurations without specifying allowed origins exposes the server to Cross-Origin POST requests from malicious sites.
**Prevention:** Implement dynamic CORS origin validation using a callback, explicitly allowing safe local development origins (like `http://localhost:5173`) and allowing missing origins for server-to-server requests, while strictly rejecting unrecognized origins. Use environment variables (e.g., `ALLOWED_ORIGINS`) to support production environments securely.
