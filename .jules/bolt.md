## 2024-05-22 - [Chat Message Memoization]
**Learning:** Extracting complex list items (like chat messages with markdown parsing) into `React.memo` components significantly reduces re-render cost during high-frequency updates (like AI streaming).
**Action:** Always memoize list items in chat interfaces or similar streaming UIs.

## 2024-05-22 - [Stable Callbacks for Memoization]
**Learning:** When passing callbacks (like `handleSend`) to `React.memo` components, if the callback depends on changing state, `useCallback` alone is insufficient as it will change on every render.
**Action:** Use a `useRef` to store the latest callback and expose a stable `useCallback` wrapper that invokes `ref.current`.
## 2024-05-23 - [O(1) Map Lookup for Network Graphs]
**Learning:** When drawing SVG network graphs (e.g., node-and-edge visualizations), calling `Array.prototype.find()` inside nested loops for edge targets creates an O(N * E) bottleneck that severely impacts frame rates on large datasets.
**Action:** Replace `find()` inside nested loops with an O(1) `Map` initialized outside the loop, reducing time complexity to O(N + E).
