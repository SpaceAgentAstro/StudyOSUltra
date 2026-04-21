## 2024-05-22 - [Chat Message Memoization]
**Learning:** Extracting complex list items (like chat messages with markdown parsing) into `React.memo` components significantly reduces re-render cost during high-frequency updates (like AI streaming).
**Action:** Always memoize list items in chat interfaces or similar streaming UIs.

## 2024-05-22 - [Stable Callbacks for Memoization]
**Learning:** When passing callbacks (like `handleSend`) to `React.memo` components, if the callback depends on changing state, `useCallback` alone is insufficient as it will change on every render.
**Action:** Use a `useRef` to store the latest callback and expose a stable `useCallback` wrapper that invokes `ref.current`.

## $(date +%Y-%m-%d) - [O(1) Map Lookup for Graph Edges]
**Learning:** When generating connections/edges in data visualizations where a nested loop maps IDs to node objects, using `Array.prototype.find()` inside the loop creates an $O(N^2)$ bottleneck.
**Action:** Replace internal `.find()` with an $O(1)$ Map lookup initialized outside the loop, and wrap the entire edge calculation in `useMemo` to prevent recalculations during layout/physics-agnostic re-renders.
