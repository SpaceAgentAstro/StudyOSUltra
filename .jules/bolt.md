## 2024-05-22 - [Chat Message Memoization]
**Learning:** Extracting complex list items (like chat messages with markdown parsing) into `React.memo` components significantly reduces re-render cost during high-frequency updates (like AI streaming).
**Action:** Always memoize list items in chat interfaces or similar streaming UIs.

## 2024-05-22 - [Stable Callbacks for Memoization]
**Learning:** When passing callbacks (like `handleSend`) to `React.memo` components, if the callback depends on changing state, `useCallback` alone is insufficient as it will change on every render.
**Action:** Use a `useRef` to store the latest callback and expose a stable `useCallback` wrapper that invokes `ref.current`.

## 2024-05-22 - [Optimizing O(N²) Lookups in Mapping Loops]
**Learning:** When generating complex graphs or processing nested loops (like node connections mapping target IDs to node objects), calling `Array.prototype.find()` inside the loop creates an O(N²) bottleneck.
**Action:** Always replace the inner loop lookup with an O(1) Map lookup (`new Map(nodes.map(n => [n.id, n]))`) initialized outside the loop, reducing the complexity to O(N).
