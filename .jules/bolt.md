## 2024-05-22 - [Chat Message Memoization]
**Learning:** Extracting complex list items (like chat messages with markdown parsing) into `React.memo` components significantly reduces re-render cost during high-frequency updates (like AI streaming).
**Action:** Always memoize list items in chat interfaces or similar streaming UIs.

## 2024-05-22 - [Stable Callbacks for Memoization]
**Learning:** When passing callbacks (like `handleSend`) to `React.memo` components, if the callback depends on changing state, `useCallback` alone is insufficient as it will change on every render.
**Action:** Use a `useRef` to store the latest callback and expose a stable `useCallback` wrapper that invokes `ref.current`.
## 2024-05-23 - [O(1) Map Lookups for Edge Calculation]
**Learning:** Nested `Array.prototype.find()` lookups inside React render functions or derived state loops (like mapping edge connections between SVG nodes) scale poorly and cause main-thread blocking.
**Action:** Replace nested loops with an O(1) `Map` initialized outside the inner loop, and wrap the entire derivation in `useMemo` to reduce time complexity from O(N^2) to O(N) and prevent unnecessary recalculations during UI state updates.
