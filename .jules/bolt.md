## 2024-05-22 - [Chat Message Memoization]
**Learning:** Extracting complex list items (like chat messages with markdown parsing) into `React.memo` components significantly reduces re-render cost during high-frequency updates (like AI streaming).
**Action:** Always memoize list items in chat interfaces or similar streaming UIs.

## 2024-05-22 - [Stable Callbacks for Memoization]
**Learning:** When passing callbacks (like `handleSend`) to `React.memo` components, if the callback depends on changing state, `useCallback` alone is insufficient as it will change on every render.
**Action:** Use a `useRef` to store the latest callback and expose a stable `useCallback` wrapper that invokes `ref.current`.
## 2026-05-12 - [O(1) Map Lookups for Graph Edges]
**Learning:** Nested `Array.prototype.find()` lookups inside React render loops cause O(N^2) time complexity. Using an O(1) `Map` initialized outside the inner loop and wrapped in `useMemo` reduces this to O(N) and prevents unnecessary recalculations.
**Action:** Replace nested array lookups in derivations with a Map and wrap expensive derivations in `useMemo`.
