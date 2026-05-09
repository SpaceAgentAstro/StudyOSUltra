## 2024-05-22 - Unsafe AI Response Handling
**Vulnerability:** The `gradeOpenEndedAnswer` function directly called the AI service and parsed the result without error handling.
**Learning:** External AI services (LLMs) are unreliable. They can fail (network) or hallucinate (return invalid JSON).
**Prevention:** All AI service calls must be wrapped in `try-catch`. JSON parsing must be safe (e.g., using `zod` or `try-catch`). Always return a safe fallback object to the UI.
## 2026-05-09 - Secure CORS and Error Handling
**Vulnerability:** Permissive CORS and error message leakage.
**Learning:** Default CORS allows all origins, and catching generic errors exposes internal details.
**Prevention:** Restrict CORS via environment config and return generic errors.
