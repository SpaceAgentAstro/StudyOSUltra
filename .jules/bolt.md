## 2024-05-22 - [Chat Message Memoization]
**Learning:** Extracting complex list items (like chat messages with markdown parsing) into `React.memo` components significantly reduces re-render cost during high-frequency updates (like AI streaming).
**Action:** Always memoize list items in chat interfaces or similar streaming UIs.

## 2024-05-22 - [Stable Callbacks for Memoization]
**Learning:** When passing callbacks (like `handleSend`) to `React.memo` components, if the callback depends on changing state, `useCallback` alone is insufficient as it will change on every render.
**Action:** Use a `useRef` to store the latest callback and expose a stable `useCallback` wrapper that invokes `ref.current`.

## 2024-05-22 - [Shared Array Traversals]
**Learning:** When identical array traversals (like `.map()`, `.filter()`) are executed inside multiple `useMemo` hooks sharing the same dependencies, extracting the traversal into a single shared `useMemo` hook caches the result and prevents redundant O(N) operations during re-renders.
**Action:** Extract shared array traversals from multiple `useMemo` hooks into a single shared one.
