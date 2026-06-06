## 2024-05-22 - [Chat Message Memoization]
**Learning:** Extracting complex list items (like chat messages with markdown parsing) into `React.memo` components significantly reduces re-render cost during high-frequency updates (like AI streaming).
**Action:** Always memoize list items in chat interfaces or similar streaming UIs.

## 2024-05-22 - [Stable Callbacks for Memoization]
**Learning:** When passing callbacks (like `handleSend`) to `React.memo` components, if the callback depends on changing state, `useCallback` alone is insufficient as it will change on every render.
**Action:** Use a `useRef` to store the latest callback and expose a stable `useCallback` wrapper that invokes `ref.current`.

## 2024-05-22 - [Shared useMemo Dependency Traversal]
**Learning:** When identical array traversals (e.g., .map()) are executed inside multiple useMemo hooks that share the same dependencies, they create redundant O(N) operations during re-renders.
**Action:** Extract the shared traversal into a single useMemo hook and reference its output in the subsequent hooks.
