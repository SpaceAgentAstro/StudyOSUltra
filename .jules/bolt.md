## 2024-05-22 - [Chat Message Memoization]
**Learning:** Extracting complex list items (like chat messages with markdown parsing) into `React.memo` components significantly reduces re-render cost during high-frequency updates (like AI streaming).
**Action:** Always memoize list items in chat interfaces or similar streaming UIs.

## 2024-05-22 - [Stable Callbacks for Memoization]
**Learning:** When passing callbacks (like `handleSend`) to `React.memo` components, if the callback depends on changing state, `useCallback` alone is insufficient as it will change on every render.
**Action:** Use a `useRef` to store the latest callback and expose a stable `useCallback` wrapper that invokes `ref.current`.

## 2024-05-22 - [Map Lookups in SVG Edge Connections]
**Learning:** When dealing with nested array loops or frequent lookups (e.g., SVG edge connections mapping node IDs like in `KnowledgeUniverse.tsx`), replacing `Array.prototype.find()` inside the loop with an $O(1)$ `Map` lookup initialized outside the loop reduces time complexity from $O(N^2)$ to $O(N)$. Wrapping this in `useMemo` avoids redundant recalculations.
**Action:** Always use an $O(1)$ Map initialization outside the loop when mapping identifiers across large datasets for derived state (like network graphs).
