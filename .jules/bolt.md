## 2024-05-22 - [Chat Message Memoization]
**Learning:** Extracting complex list items (like chat messages with markdown parsing) into `React.memo` components significantly reduces re-render cost during high-frequency updates (like AI streaming).
**Action:** Always memoize list items in chat interfaces or similar streaming UIs.

## 2024-05-22 - [Stable Callbacks for Memoization]
**Learning:** When passing callbacks (like `handleSend`) to `React.memo` components, if the callback depends on changing state, `useCallback` alone is insufficient as it will change on every render.
**Action:** Use a `useRef` to store the latest callback and expose a stable `useCallback` wrapper that invokes `ref.current`.
## 2026-05-05 - O(N) Object Map over O(N^2) Array Find
**Learning:** In streaming or heavily re-rendering UIs like `KnowledgeUniverse.tsx`, using `Array.prototype.find()` inside nested loops to draw SVG connections causes an O(N^2) time complexity. This blocks the main thread during recalculations when nodes change.
**Action:** Always wrap expensive UI derivations in `useMemo` and initialize an O(1) `Map` outside the inner loop to reduce time complexity from O(N^2) to O(N).
