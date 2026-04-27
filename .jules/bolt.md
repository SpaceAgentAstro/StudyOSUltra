## 2024-05-22 - [Chat Message Memoization]
**Learning:** Extracting complex list items (like chat messages with markdown parsing) into `React.memo` components significantly reduces re-render cost during high-frequency updates (like AI streaming).
**Action:** Always memoize list items in chat interfaces or similar streaming UIs.

## 2024-05-22 - [Stable Callbacks for Memoization]
**Learning:** When passing callbacks (like `handleSend`) to `React.memo` components, if the callback depends on changing state, `useCallback` alone is insufficient as it will change on every render.
**Action:** Use a `useRef` to store the latest callback and expose a stable `useCallback` wrapper that invokes `ref.current`.

## 2026-04-27 - [O(1) Map Lookup for Data Transformations]
**Learning:** When performing nested loops or data mapping operations over arrays (e.g., matching connection node IDs to node objects for SVG rendering), using  inside the loop creates an O(N^2) bottleneck.
**Action:** Initialize an O(1) Map outside the loop () and use  inside the loop, turning O(N^2) time complexity into O(N).

## 2024-05-22 - [O(1) Map Lookup for Data Transformations]
**Learning:** When performing nested loops or data mapping operations over arrays (e.g., matching connection node IDs to node objects for SVG rendering), using `Array.prototype.find()` inside the loop creates an O(N^2) bottleneck.
**Action:** Initialize an O(1) Map outside the loop (`new Map(array.map(item => [item.id, item]))`) and use `map.get(id)` inside the loop, turning O(N^2) time complexity into O(N).
