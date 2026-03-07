## 2024-05-22 - [Chat Message Memoization]
**Learning:** Extracting complex list items (like chat messages with markdown parsing) into `React.memo` components significantly reduces re-render cost during high-frequency updates (like AI streaming).
**Action:** Always memoize list items in chat interfaces or similar streaming UIs.

## 2024-05-22 - [Stable Callbacks for Memoization]
**Learning:** When passing callbacks (like `handleSend`) to `React.memo` components, if the callback depends on changing state, `useCallback` alone is insufficient as it will change on every render.
**Action:** Use a `useRef` to store the latest callback and expose a stable `useCallback` wrapper that invokes `ref.current`.

## 2024-05-23 - [Static Arrays in Functional Components]
**Learning:** Defining static arrays containing objects inside a functional component (like `menuItems` in `Sidebar.tsx`) causes the array and all its elements to be re-allocated in memory on every render. For layout components that render frequently, this adds unnecessary garbage collection overhead.
**Action:** Always hoist static configuration arrays and objects outside the functional component to the module level.
