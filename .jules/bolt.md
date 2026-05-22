## 2024-05-22 - [Chat Message Memoization]
**Learning:** Extracting complex list items (like chat messages with markdown parsing) into `React.memo` components significantly reduces re-render cost during high-frequency updates (like AI streaming).
**Action:** Always memoize list items in chat interfaces or similar streaming UIs.

## 2024-05-22 - [Stable Callbacks for Memoization]
**Learning:** When passing callbacks (like `handleSend`) to `React.memo` components, if the callback depends on changing state, `useCallback` alone is insufficient as it will change on every render.
**Action:** Use a `useRef` to store the latest callback and expose a stable `useCallback` wrapper that invokes `ref.current`.

## 2026-05-22 - [O(N^2) Graph Rendering Fix]
**Learning:** Using `Array.find` inside nested loops to resolve connections in a graph component causes O(N^2) time complexity, leading to main-thread blocking during render for large node sets.
**Action:** Always precompute a `Map` for O(1) node lookups and memoize the connection rendering with `useMemo` to prevent recalculating SVG lines on every render.
