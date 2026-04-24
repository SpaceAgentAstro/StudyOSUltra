## 2024-05-22 - [Chat Message Memoization]
**Learning:** Extracting complex list items (like chat messages with markdown parsing) into `React.memo` components significantly reduces re-render cost during high-frequency updates (like AI streaming).
**Action:** Always memoize list items in chat interfaces or similar streaming UIs.

## 2024-05-22 - [Stable Callbacks for Memoization]
**Learning:** When passing callbacks (like `handleSend`) to `React.memo` components, if the callback depends on changing state, `useCallback` alone is insufficient as it will change on every render.
**Action:** Use a `useRef` to store the latest callback and expose a stable `useCallback` wrapper that invokes `ref.current`.

## 2024-05-22 - [SVG Edge Render Optimization]
**Learning:** In React components rendering large numbers of SVG elements (like `KnowledgeUniverse.tsx`), using `.find()` inside a nested loop for edge connections causes an $O(N^2)$ bottleneck that stalls the main thread during render.
**Action:** Always pre-compute a lookup `Map` (reducing complexity to $O(N)$) and wrap the derivation in `useMemo` so it only recalculates when the source data (`nodes`) changes.
