## 2024-05-22 - [Chat Message Memoization]
**Learning:** Extracting complex list items (like chat messages with markdown parsing) into `React.memo` components significantly reduces re-render cost during high-frequency updates (like AI streaming).
**Action:** Always memoize list items in chat interfaces or similar streaming UIs.

## 2024-05-22 - [Stable Callbacks for Memoization]
**Learning:** When passing callbacks (like `handleSend`) to `React.memo` components, if the callback depends on changing state, `useCallback` alone is insufficient as it will change on every render.
**Action:** Use a `useRef` to store the latest callback and expose a stable `useCallback` wrapper that invokes `ref.current`.

## 2024-05-22 - [Redundant Array Iterations in Render]
**Learning:** Performing multiple `.filter().length` passes on large arrays during render creates redundant O(N) iteration overhead and allocates unnecessary intermediate arrays, especially in active components like `GameCenter.tsx`.
**Action:** Replace multiple filter/map chains that derive independent counts or states from the same array with a single `for...of` loop wrapped in a `useMemo`.
