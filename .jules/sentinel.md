## 2024-05-22 - Unsafe AI Response Handling
**Vulnerability:** The `gradeOpenEndedAnswer` function directly called the AI service and parsed the result without error handling.
**Learning:** External AI services (LLMs) are unreliable. They can fail (network) or hallucinate (return invalid JSON).
**Prevention:** All AI service calls must be wrapped in `try-catch`. JSON parsing must be safe (e.g., using `zod` or `try-catch`). Always return a safe fallback object to the UI.
## 2024-05-24 - Overly Permissive CORS Configuration
**Vulnerability:** The Express server used `app.use(cors())` which defaults to allowing all origins (`*`).
**Learning:** Default CORS configurations can be overly permissive, exposing the API to cross-origin requests from any domain.
**Prevention:** Implement strict dynamic origin validation checking an environment variable (`ALLOWED_ORIGINS`) and provide a safe fallback for local development. Always include a rejection path for unauthorized origins.
