## 2024-05-22 - [Chat Message Memoization]
**Learning:** Extracting complex list items (like chat messages with markdown parsing) into `React.memo` components significantly reduces re-render cost during high-frequency updates (like AI streaming).
**Action:** Always memoize list items in chat interfaces or similar streaming UIs.

## 2024-05-22 - [Stable Callbacks for Memoization]
**Learning:** When passing callbacks (like `handleSend`) to `React.memo` components, if the callback depends on changing state, `useCallback` alone is insufficient as it will change on every render.
**Action:** Use a `useRef` to store the latest callback and expose a stable `useCallback` wrapper that invokes `ref.current`.
## 2024-05-31 - [O(N²) Renders Avoidance in SVG Nodes]
**Learning:** For rendering complex SVGs like Knowledge Graphs where nodes have nested targets, doing a `.find()` on every nested loop drops performance fast as N grows.
**Action:** Always pre-compute a `Map` of nodes for O(1) lookups during graph traversals instead of iterating arrays multiple times.
