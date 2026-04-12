## 2024-05-22 - [Chat Message Memoization]
**Learning:** Extracting complex list items (like chat messages with markdown parsing) into `React.memo` components significantly reduces re-render cost during high-frequency updates (like AI streaming).
**Action:** Always memoize list items in chat interfaces or similar streaming UIs.

## 2024-05-22 - [Stable Callbacks for Memoization]
**Learning:** When passing callbacks (like `handleSend`) to `React.memo` components, if the callback depends on changing state, `useCallback` alone is insufficient as it will change on every render.
**Action:** Use a `useRef` to store the latest callback and expose a stable `useCallback` wrapper that invokes `ref.current`.

## 2024-05-23 - [O(1) Map Lookups in Render Functions]
**Learning:** In React components with frequent state changes (e.g., animations/selections), expensive array operations like `nodes.find` inside nested loops to draw connections (O(N^2)) cause significant main thread blocking.
**Action:** Always extract nested lookups into an O(1) `Map` initialized before the loop and wrap the derivation in `useMemo` to prevent recalculation on every render.
