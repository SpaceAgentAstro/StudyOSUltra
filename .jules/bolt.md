## 2024-05-22 - [Chat Message Memoization]
**Learning:** Extracting complex list items (like chat messages with markdown parsing) into `React.memo` components significantly reduces re-render cost during high-frequency updates (like AI streaming).
**Action:** Always memoize list items in chat interfaces or similar streaming UIs.

## 2024-05-22 - [Stable Callbacks for Memoization]
**Learning:** When passing callbacks (like `handleSend`) to `React.memo` components, if the callback depends on changing state, `useCallback` alone is insufficient as it will change on every render.
**Action:** Use a `useRef` to store the latest callback and expose a stable `useCallback` wrapper that invokes `ref.current`.

## 2024-05-19 - Replace O(N^2) graph rendering loop with O(N) lookup
**Learning:** Found a nested loop `nodes.forEach` inside another `nodes.forEach` while iterating connections in `KnowledgeUniverse.tsx`. This causes O(N^2) complexity every render.
**Action:** Replaced `nodes.find` with an O(N) pre-computed Map lookup and memoized the rendering loop to avoid re-calculating connections unless the nodes array changes.
