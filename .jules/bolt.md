## 2024-05-22 - [Chat Message Memoization]
**Learning:** Extracting complex list items (like chat messages with markdown parsing) into `React.memo` components significantly reduces re-render cost during high-frequency updates (like AI streaming).
**Action:** Always memoize list items in chat interfaces or similar streaming UIs.

## 2024-05-22 - [Stable Callbacks for Memoization]
**Learning:** When passing callbacks (like `handleSend`) to `React.memo` components, if the callback depends on changing state, `useCallback` alone is insufficient as it will change on every render.
**Action:** Use a `useRef` to store the latest callback and expose a stable `useCallback` wrapper that invokes `ref.current`.

## 2026-05-04 - [O(N^2) Node Calculation Optimization]
**Learning:** Array.prototype.find() inside a nested loop causes O(N^2) time complexity, which leads to expensive re-renders in visual components like KnowledgeUniverse.
**Action:** Extract list derivations into useMemo and use an O(1) Map for lookups to reduce complexity to O(N) and avoid recalculation on unrelated state updates.
