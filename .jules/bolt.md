## 2024-05-22 - [Chat Message Memoization]
**Learning:** Extracting complex list items (like chat messages with markdown parsing) into `React.memo` components significantly reduces re-render cost during high-frequency updates (like AI streaming).
**Action:** Always memoize list items in chat interfaces or similar streaming UIs.

## 2024-05-22 - [Stable Callbacks for Memoization]
**Learning:** When passing callbacks (like `handleSend`) to `React.memo` components, if the callback depends on changing state, `useCallback` alone is insufficient as it will change on every render.
**Action:** Use a `useRef` to store the latest callback and expose a stable `useCallback` wrapper that invokes `ref.current`.
## 2024-05-23 - [Shared Array Traversals in useMemo]
**Learning:** When identical array traversals (like `.map()`) are executed inside multiple `useMemo` hooks sharing the exact same dependencies, they trigger redundant `O(N)` mapping operations during re-renders, causing unnecessary garbage collection and main thread blocking.
**Action:** Extract the shared array traversal into a single parent `useMemo` hook, caching the result, and pass that cached list into the dependent `useMemo` hooks. This effectively reduces `M * N` operations to `1 * N` operations.
