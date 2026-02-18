## 2024-05-22 - Insecure Randomness in ID Generation
**Vulnerability:** Usage of `Math.random()` for ID generation in `utils/index.ts`.
**Learning:** Common pattern in early dev phases where uniqueness is assumed but collision resistance is low.
**Prevention:** Enforce use of `crypto.randomUUID()` for all identifier generation.

## 2024-05-23 - Ephemeral API Key Storage
**Vulnerability:** API keys stored in `localStorage` persist across sessions and are accessible to anyone with physical access to the browser.
**Learning:** `localStorage` is for preference/state persistence, not for secrets. `sessionStorage` limits the exposure window to the active tab/session.
**Prevention:** Migrated all API key storage to `sessionStorage`. Implemented auto-migration to clear legacy keys from `localStorage` on startup.
