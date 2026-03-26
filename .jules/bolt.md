## 2024-05-22 - [Chat Message Memoization]
**Learning:** Extracting complex list items (like chat messages with markdown parsing) into `React.memo` components significantly reduces re-render cost during high-frequency updates (like AI streaming).
**Action:** Always memoize list items in chat interfaces or similar streaming UIs.

## 2024-05-22 - [Stable Callbacks for Memoization]
**Learning:** When passing callbacks (like `handleSend`) to `React.memo` components, if the callback depends on changing state, `useCallback` alone is insufficient as it will change on every render.
**Action:** Use a `useRef` to store the latest callback and expose a stable `useCallback` wrapper that invokes `ref.current`.

## 2024-05-22 - [Static Object Extraction]
**Learning:** Arrays and objects declared inside functional components (like `menuItems` in `Sidebar.tsx`) are reallocated on every render, adding garbage collection pressure and layout computation time.
**Action:** Always extract static configurations or arrays to the module level outside the component body.

## 2024-05-22 - [Invalid useMemo Usage]
**Learning:** Do not use `useMemo` on variables that change on every stream chunk (like `msg.text` during AI streaming) in an attempt to cache regex parsing. It provides zero performance benefit because the dependency changes constantly, and placing it inside conditional JSX violates React Hook rules.
**Action:** Identify stable dependencies for `useMemo` or handle chunk-based parsing outside the main render path. Never place hooks conditionally inside JSX returns.
