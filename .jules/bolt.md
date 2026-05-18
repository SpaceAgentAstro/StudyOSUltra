## 2024-05-22 - [Chat Message Memoization]
**Learning:** Extracting complex list items (like chat messages with markdown parsing) into `React.memo` components significantly reduces re-render cost during high-frequency updates (like AI streaming).
**Action:** Always memoize list items in chat interfaces or similar streaming UIs.

## 2024-05-22 - [Stable Callbacks for Memoization]
**Learning:** When passing callbacks (like `handleSend`) to `React.memo` components, if the callback depends on changing state, `useCallback` alone is insufficient as it will change on every render.
**Action:** Use a `useRef` to store the latest callback and expose a stable `useCallback` wrapper that invokes `ref.current`.
## 2026-05-18 - [O(N^2) React Derivation Anti-Pattern]
**Learning:** Using Array.prototype.find() inside nested loops during React derivations (like drawing connections) causes O(N^2) complexity, leading to main thread blocking on large graphs.
**Action:** Replace inner loop lookups with an O(1) Map initialized before the loop and wrap the derivation in useMemo.
