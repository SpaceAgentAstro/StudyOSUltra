## 2024-05-22 - Unsafe AI Response Handling
**Vulnerability:** The `gradeOpenEndedAnswer` function directly called the AI service and parsed the result without error handling.
**Learning:** External AI services (LLMs) are unreliable. They can fail (network) or hallucinate (return invalid JSON).
**Prevention:** All AI service calls must be wrapped in `try-catch`. JSON parsing must be safe (e.g., using `zod` or `try-catch`). Always return a safe fallback object to the UI.

## 2026-04-26 - Information Exposure and Overly Permissive CORS
**Vulnerability:** The API error responses directly exposed `error.message` to the client, leading to potential internal system details leak. Additionally, the CORS policy was unrestrictive (`app.use(cors())`), leaving the backend open to requests from any origin.
**Learning:** Returning native error objects or stack traces can divulge valuable information about system architecture to attackers. A wide-open CORS configuration increases the attack surface for CSRF and unauthenticated access from malicious origins.
**Prevention:** Always overwrite external error messages with generic responses (e.g., "Internal Server Error") for the client while logging the detailed exception internally. Configure CORS strictly by leveraging an allowlist, validating against a defined set of trusted origins, and properly handling local development environments.
