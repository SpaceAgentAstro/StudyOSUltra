## 2026-05-26 - Merge all branches and retain API key
**Learning:** Learned how to resolve complex merge conflicts across multiple branches by preserving local state (e.g. `vite.config.ts`, `server.js`) and then carefully committing. Specifically, preserved `process.env.JULES_API_KEY` for fallback during API key initialization.
**Action:** Always verify environment variables initialization logic when merging conflicting security or configuration branches.
