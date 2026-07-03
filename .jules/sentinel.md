## 2024-05-22 - Unsafe AI Response Handling
**Vulnerability:** The `gradeOpenEndedAnswer` function directly called the AI service and parsed the result without error handling.
**Learning:** External AI services (LLMs) are unreliable. They can fail (network) or hallucinate (return invalid JSON).
**Prevention:** All AI service calls must be wrapped in `try-catch`. JSON parsing must be safe (e.g., using `zod` or `try-catch`). Always return a safe fallback object to the UI.
## 2024-03-20 - Exposing Server Secrets to Client via Vite Config
**Vulnerability:** The `vite.config.ts` file injected sensitive backend API keys (e.g. GEMINI_API_KEY) directly into the client-side bundle via the `define` plugin, allowing anyone to inspect the source code and extract billing-tied secrets.
**Learning:** Build tools like Vite execute in a Node environment and have access to `process.env`. Using the `define` plugin to replace `process.env.API_KEY` globally means the raw key string gets baked into the final output JS files.
**Prevention:** Never use the `define` plugin for secrets. The frontend should rely on backend proxy endpoints (like `/api/generate`) which hold the secrets securely. Provide empty strings or safe mock values to the client build to prevent ReferenceErrors without leaking data.
## 2024-03-20 - Exposing Server Secrets to Client via Vite Config (Part 2)
**Vulnerability:** The `vite.config.ts` file injected sensitive backend API keys directly into the client-side bundle. Removing them broke functionality because `services/geminiService.ts` still tried to instantiate `GoogleGenAI` client-side using `API_KEY`.
**Learning:** You cannot simply remove keys from a build config if the client-side code is trying to use them directly via an SDK (like `@google/genai`). You must also refactor the client code to call your own backend server proxy endpoints (e.g. `/api/video`, `/api/image`) instead of calling the external APIs directly.
**Prevention:** Architect applications such that external API SDKs that require secrets are ONLY instantiated on the backend server. The frontend should only make simple `fetch` requests to your own proxy endpoints, which then use the secure SDKs.
