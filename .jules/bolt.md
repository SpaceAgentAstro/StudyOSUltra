## 2024-05-22 - [Chat Message Memoization]
**Learning:** Extracting complex list items (like chat messages with markdown parsing) into `React.memo` components significantly reduces re-render cost during high-frequency updates (like AI streaming).
**Action:** Always memoize list items in chat interfaces or similar streaming UIs.

## 2024-05-22 - [Stable Callbacks for Memoization]
**Learning:** When passing callbacks (like `handleSend`) to `React.memo` components, if the callback depends on changing state, `useCallback` alone is insufficient as it will change on every render.
**Action:** Use a `useRef` to store the latest callback and expose a stable `useCallback` wrapper that invokes `ref.current`.
## 2026-05-17 - [Optimize KnowledgeUniverse Graph Connections]
**Learning:** Using Array.prototype.find() inside nested loops for graphing connections causes O(N^2) complexity, leading to rendering bottlenecks when the node graph grows.
**Action:** Replace nested finds with a Map initialized outside the inner loop (O(1) lookups) and wrap the derivation in useMemo to prevent unnecessary recalculations.
