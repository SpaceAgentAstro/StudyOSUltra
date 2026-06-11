## 2024-05-22 - Unsafe AI Response Handling
**Vulnerability:** The `gradeOpenEndedAnswer` function directly called the AI service and parsed the result without error handling.
**Learning:** External AI services (LLMs) are unreliable. They can fail (network) or hallucinate (return invalid JSON).
**Prevention:** All AI service calls must be wrapped in `try-catch`. JSON parsing must be safe (e.g., using `zod` or `try-catch`). Always return a safe fallback object to the UI.
## 2024-06-11 - Strict CORS Configuration
**Vulnerability:** Overly permissive CORS configuration (`app.use(cors())`) allowed cross-origin requests from any domain.
**Learning:** Default CORS configuration is insecure. Restricting only methods is insufficient; dynamic origin validation requires a strict rejection path.
**Prevention:** Always explicitly define allowed origins and restrict methods, ensuring unrecognized origins fall into a strict rejection path (e.g., `callback(new Error('Not allowed by CORS'))`).
