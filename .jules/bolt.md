## 2024-05-22 - [Chat Message Memoization]
**Learning:** Extracting complex list items (like chat messages with markdown parsing) into `React.memo` components significantly reduces re-render cost during high-frequency updates (like AI streaming).
**Action:** Always memoize list items in chat interfaces or similar streaming UIs.

## 2024-05-22 - [Stable Callbacks for Memoization]
**Learning:** When passing callbacks (like `handleSend`) to `React.memo` components, if the callback depends on changing state, `useCallback` alone is insufficient as it will change on every render.
**Action:** Use a `useRef` to store the latest callback and expose a stable `useCallback` wrapper that invokes `ref.current`.

## 2024-05-22 - [O(1) Map Lookup Optimization]
**Learning:** Replacing `Array.prototype.find()` ($O(N)$) with a `Map` lookup ($O(1)$) inside nested loops (like calculating SVG node connections) changes time complexity from $O(N^2)$ to $O(N)$ and vastly improves performance.
**Action:** Use a pre-initialized Map for frequent lookups, especially inside loops and in conjunction with `useMemo`.
