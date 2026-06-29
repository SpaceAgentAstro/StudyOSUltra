## 2024-05-22 - [Chat Message Memoization]
**Learning:** Extracting complex list items (like chat messages with markdown parsing) into `React.memo` components significantly reduces re-render cost during high-frequency updates (like AI streaming).
**Action:** Always memoize list items in chat interfaces or similar streaming UIs.

## 2024-05-22 - [Stable Callbacks for Memoization]
**Learning:** When passing callbacks (like `handleSend`) to `React.memo` components, if the callback depends on changing state, `useCallback` alone is insufficient as it will change on every render.
**Action:** Use a `useRef` to store the latest callback and expose a stable `useCallback` wrapper that invokes `ref.current`.
## 2026-06-29 - [Catastrophic Hook Duplication]
**Learning:** During bad merges or previous flawed agent interactions, functional components (like `ChatInterface.tsx`) can accumulate massive amounts of duplicated, syntactically invalid hook declarations (e.g., repeating `const ref = useRef()`).
**Action:** When diagnosing severe component performance issues or syntax errors, check for redundant hook boilerplate at the bottom of the component and aggressively clean it up to restore standard rendering behavior and valid syntax.
