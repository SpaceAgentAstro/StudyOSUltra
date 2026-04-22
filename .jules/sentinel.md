## 2025-04-22 - Fix overly permissive CORS and error leakage in server.js
**Vulnerability:** The server was configured with `app.use(cors())`, allowing any origin, and `/api/generate` and `/api/stream` leaked internal `error.message` strings directly to the client in 500 error responses.
**Learning:** Default `cors()` allows all origins in Express. Throwing original error messages to the client leaks sensitive internal information or API key statuses which might be visible to unauthorized users.
**Prevention:** Always restrict CORS using `origin` function matching allowed environments (like localhost and explicit `ALLOWED_ORIGINS` from env). Always return generic error messages (e.g., "Internal Server Error") for 500 responses.
