## 2024-05-22 - [Chat Message Memoization]
**Learning:** Extracting complex list items (like chat messages with markdown parsing) into `React.memo` components significantly reduces re-render cost during high-frequency updates (like AI streaming).
**Action:** Always memoize list items in chat interfaces or similar streaming UIs.

## 2024-05-22 - [Stable Callbacks for Memoization]
**Learning:** When passing callbacks (like `handleSend`) to `React.memo` components, if the callback depends on changing state, `useCallback` alone is insufficient as it will change on every render.
**Action:** Use a `useRef` to store the latest callback and expose a stable `useCallback` wrapper that invokes `ref.current`.

## 2026-05-19 - [Graph Edge Memoization & Map Lookup]
**Learning:** Rendering network graphs by computing edge connections using nested `Array.prototype.find()` causes O(N^2) lookups on every render, leading to significant main-thread lag for large datasets.
**Action:** Always derive edge mappings outside the inner loop using an O(1) Map, and wrap the resulting JSX array in `useMemo` to avoid recalculating unchanged visualizations.
