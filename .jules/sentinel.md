## 2024-05-22 - Unsafe AI Response Handling
**Vulnerability:** The `gradeOpenEndedAnswer` function directly called the AI service and parsed the result without error handling.
**Learning:** External AI services (LLMs) are unreliable. They can fail (network) or hallucinate (return invalid JSON).
**Prevention:** All AI service calls must be wrapped in `try-catch`. JSON parsing must be safe (e.g., using `zod` or `try-catch`). Always return a safe fallback object to the UI.
## 2024-05-23 - API Key Exposure via Vite Config
**Vulnerability:** API keys were exposed to the frontend bundle via Vite's `define` plugin, enabling credential theft.
**Learning:** Frontend configuration files (like `vite.config.ts`) often expose environment variables. If frontend code directly uses SDKs that require secrets, those secrets are leaked.
**Prevention:** Never pass API keys to the frontend. Always route SDK calls requiring secrets through backend proxy endpoints.
