## 2024-05-22 - [Chat Message Memoization]
**Learning:** Extracting complex list items (like chat messages with markdown parsing) into `React.memo` components significantly reduces re-render cost during high-frequency updates (like AI streaming).
**Action:** Always memoize list items in chat interfaces or similar streaming UIs.

## 2024-05-22 - [Stable Callbacks for Memoization]
**Learning:** When passing callbacks (like `handleSend`) to `React.memo` components, if the callback depends on changing state, `useCallback` alone is insufficient as it will change on every render.
**Action:** Use a `useRef` to store the latest callback and expose a stable `useCallback` wrapper that invokes `ref.current`.

## 2026-05-26 - [Sidebar Menu Items Memoization]
**Learning:** Re-creating constant arrays like menu items inside the render body causes unnecessary object allocations and can trigger re-renders of child components.
**Action:** Always wrap static or derived configuration objects/arrays in `useMemo` or move them outside the component if they don't depend on props/state.
