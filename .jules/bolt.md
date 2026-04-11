## 2024-05-22 - [Chat Message Memoization]
**Learning:** Extracting complex list items (like chat messages with markdown parsing) into `React.memo` components significantly reduces re-render cost during high-frequency updates (like AI streaming).
**Action:** Always memoize list items in chat interfaces or similar streaming UIs.

## 2024-05-22 - [Stable Callbacks for Memoization]
**Learning:** When passing callbacks (like `handleSend`) to `React.memo` components, if the callback depends on changing state, `useCallback` alone is insufficient as it will change on every render.
**Action:** Use a `useRef` to store the latest callback and expose a stable `useCallback` wrapper that invokes `ref.current`.
## 2026-04-11 - [O(N) Map lookups for SVG rendering]
**Learning:** In complex graph components like KnowledgeUniverse, nested loops calculating edge connections via `Array.prototype.find()` create an (N^2)$ bottleneck that causes severe UI stutter during layout. Wrapping the logic in `useMemo` alone doesn't solve the underlying iteration cost.
**Action:** Always combine `useMemo` with a preceding (1)$ `Map` initialization to reduce algorithmic complexity to (N)$ when rendering dependent items like edges or relational data.
