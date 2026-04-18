## 2024-05-22 - [Chat Message Memoization]
**Learning:** Extracting complex list items (like chat messages with markdown parsing) into `React.memo` components significantly reduces re-render cost during high-frequency updates (like AI streaming).
**Action:** Always memoize list items in chat interfaces or similar streaming UIs.

## 2024-05-22 - [Stable Callbacks for Memoization]
**Learning:** When passing callbacks (like `handleSend`) to `React.memo` components, if the callback depends on changing state, `useCallback` alone is insufficient as it will change on every render.
**Action:** Use a `useRef` to store the latest callback and expose a stable `useCallback` wrapper that invokes `ref.current`.

## 2024-05-24 - [SVG Edge Calculation Optimization]
**Learning:** When dealing with nested array loops for mapping node connections (e.g., in Knowledge Universe visualizations), using `Array.prototype.find()` inside the loop results in (N^2)$ time complexity which can be a bottleneck. This can be resolved by initializing an (1)$ `Map` outside the loop using `useMemo`.
**Action:** Always replace `Array.prototype.find()` with a `Map` lookup within nested loops for drawing SVG connections to optimize render performance, mapping (N^2)$ down to (N)$.
