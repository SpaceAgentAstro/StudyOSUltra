## 2024-05-22 - Unsafe AI Response Handling
**Vulnerability:** The `gradeOpenEndedAnswer` function directly called the AI service and parsed the result without error handling.
**Learning:** External AI services (LLMs) are unreliable. They can fail (network) or hallucinate (return invalid JSON).
**Prevention:** All AI service calls must be wrapped in `try-catch`. JSON parsing must be safe (e.g., using `zod` or `try-catch`). Always return a safe fallback object to the UI.

## 2024-06-24 - Strict CORS Configuration Pattern
**Vulnerability:** Overly permissive CORS configuration (`app.use(cors())`) exposing the API to all domains.
**Learning:** Default CORS allows any origin to interact with the backend API.
**Prevention:** Implemented strict origin validation reading from `process.env.ALLOWED_ORIGINS` with a safe local development fallback (`['http://localhost:5173', 'http://localhost:3000', 'http://127.0.0.1:5173', 'http://127.0.0.1:3000']`). Explicitly allow missing origins (`!origin`) to ensure server-to-server tools aren't broken, and reject unrecognized origins correctly.
