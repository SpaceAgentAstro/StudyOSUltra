## 2024-05-22 - [Chat Message Memoization]
**Learning:** Extracting complex list items (like chat messages with markdown parsing) into `React.memo` components significantly reduces re-render cost during high-frequency updates (like AI streaming).
**Action:** Always memoize list items in chat interfaces or similar streaming UIs.

## 2024-05-22 - [Stable Callbacks for Memoization]
**Learning:** When passing callbacks (like `handleSend`) to `React.memo` components, if the callback depends on changing state, `useCallback` alone is insufficient as it will change on every render.
**Action:** Use a `useRef` to store the latest callback and expose a stable `useCallback` wrapper that invokes `ref.current`.

## 2026-05-10 - [O(N^2) Rendering Bottleneck in Graph Visualizations]
**Learning:** Using `Array.prototype.find()` inside an inner loop of a render function causes an O(N^2) bottleneck, which is particularly detrimental for graph edge connections during state updates.
**Action:** Always pre-compute a `Map` outside the inner loop and wrap the derivation in `useMemo` to reduce time complexity to O(N) and prevent unnecessary recalculations.
