## 2024-05-22 - [Chat Message Memoization]
**Learning:** Extracting complex list items (like chat messages with markdown parsing) into `React.memo` components significantly reduces re-render cost during high-frequency updates (like AI streaming).
**Action:** Always memoize list items in chat interfaces or similar streaming UIs.

## 2024-05-22 - [Stable Callbacks for Memoization]
**Learning:** When passing callbacks (like `handleSend`) to `React.memo` components, if the callback depends on changing state, `useCallback` alone is insufficient as it will change on every render.
**Action:** Use a `useRef` to store the latest callback and expose a stable `useCallback` wrapper that invokes `ref.current`.
## 2026-06-02 - [O(N²) Render Anti-Pattern]
**Learning:** Using `Array.find` inside a nested loop during component render blocks the main thread as data scales.
**Action:** Always pre-compute a lookup `Map` (O(N) time) and wrap the calculation in `useMemo` to prevent redundant allocations.
