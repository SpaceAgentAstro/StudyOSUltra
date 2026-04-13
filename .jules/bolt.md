## 2024-05-22 - [Chat Message Memoization]
**Learning:** Extracting complex list items (like chat messages with markdown parsing) into `React.memo` components significantly reduces re-render cost during high-frequency updates (like AI streaming).
**Action:** Always memoize list items in chat interfaces or similar streaming UIs.

## 2024-05-22 - [Stable Callbacks for Memoization]
**Learning:** When passing callbacks (like `handleSend`) to `React.memo` components, if the callback depends on changing state, `useCallback` alone is insufficient as it will change on every render.
**Action:** Use a `useRef` to store the latest callback and expose a stable `useCallback` wrapper that invokes `ref.current`.

## 2024-05-22 - [Optimizing Nested Array Searches in React Loops]
**Learning:** Performing `Array.prototype.find()` inside a nested iteration loop (like building SVG edges based on target IDs) creates O(N^2) time complexity, leading to severe performance bottlenecks on re-renders when N is large.
**Action:** Always extract inner-loop lookups into a single O(N) `Map` initialization outside the loop, combining with `useMemo` to cache derived UI elements (like `drawConnections`) to prevent recalculations when independent state variables (like `selectedNode`) change.
