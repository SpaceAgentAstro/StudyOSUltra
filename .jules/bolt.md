## 2024-05-22 - [Chat Message Memoization]
**Learning:** Extracting complex list items (like chat messages with markdown parsing) into `React.memo` components significantly reduces re-render cost during high-frequency updates (like AI streaming).
**Action:** Always memoize list items in chat interfaces or similar streaming UIs.

## 2024-05-22 - [Stable Callbacks for Memoization]
**Learning:** When passing callbacks (like `handleSend`) to `React.memo` components, if the callback depends on changing state, `useCallback` alone is insufficient as it will change on every render.
**Action:** Use a `useRef` to store the latest callback and expose a stable `useCallback` wrapper that invokes `ref.current`.
## 2024-05-22 - [Single Pass Filter Loop]
**Learning:** Consolidating multiple `.filter()` passes over the same array into a single `for...of` loop within a `useMemo` significantly reduces O(N) array allocation and traversal overhead in UI components like leaderboards.
**Action:** Replace multiple `.filter().length` calls on identical large lists with a single loop that counts all categories.
