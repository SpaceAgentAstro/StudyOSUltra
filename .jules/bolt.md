## 2024-05-22 - [Chat Message Memoization]
**Learning:** Extracting complex list items (like chat messages with markdown parsing) into `React.memo` components significantly reduces re-render cost during high-frequency updates (like AI streaming).
**Action:** Always memoize list items in chat interfaces or similar streaming UIs.

## 2024-05-22 - [Stable Callbacks for Memoization]
**Learning:** When passing callbacks (like `handleSend`) to `React.memo` components, if the callback depends on changing state, `useCallback` alone is insufficient as it will change on every render.
**Action:** Use a `useRef` to store the latest callback and expose a stable `useCallback` wrapper that invokes `ref.current`.
## 2026-06-05 - [O(N^2) React Anti-pattern]
**Learning:** Using Array.find() inside a nested loop inside a React component's render body (like in drawing graph connections) causes O(N^2) complexity that blocks the main thread during frequent updates.
**Action:** Always pre-compute an O(1) lookup Map to convert O(N^2) rendering logic into O(N).
