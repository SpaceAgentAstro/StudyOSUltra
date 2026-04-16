## 2024-05-22 - [Chat Message Memoization]
**Learning:** Extracting complex list items (like chat messages with markdown parsing) into `React.memo` components significantly reduces re-render cost during high-frequency updates (like AI streaming).
**Action:** Always memoize list items in chat interfaces or similar streaming UIs.

## 2024-05-22 - [Stable Callbacks for Memoization]
**Learning:** When passing callbacks (like `handleSend`) to `React.memo` components, if the callback depends on changing state, `useCallback` alone is insufficient as it will change on every render.
**Action:** Use a `useRef` to store the latest callback and expose a stable `useCallback` wrapper that invokes `ref.current`.

## 2024-05-23 - [SVG Edge Calculation Optimization]
**Learning:** In data visualization components (like `KnowledgeUniverse`), calculating connections between nodes inside the render path using an O(N^2) `.find()` lookup inside nested loops creates a severe bottleneck that triggers on every state update or interaction.
**Action:** Always extract complex graph edge calculations into a `useMemo` hook and replace O(N) internal lookups (like `.find()`) with an O(1) `Map` lookup created beforehand, reducing total complexity to O(N).
