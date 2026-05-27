## 2024-05-22 - [Chat Message Memoization]
**Learning:** Extracting complex list items (like chat messages with markdown parsing) into `React.memo` components significantly reduces re-render cost during high-frequency updates (like AI streaming).
**Action:** Always memoize list items in chat interfaces or similar streaming UIs.

## 2024-05-22 - [Stable Callbacks for Memoization]
**Learning:** When passing callbacks (like `handleSend`) to `React.memo` components, if the callback depends on changing state, `useCallback` alone is insufficient as it will change on every render.
**Action:** Use a `useRef` to store the latest callback and expose a stable `useCallback` wrapper that invokes `ref.current`.

## 2024-05-24 - [React Static Allocations]
**Learning:** Defining static arrays or objects (like menu items) inside a React component's body causes them to be recreated on every single render, leading to unnecessary memory allocations and potential child re-renders.
**Action:** Always move static data structures outside of the component body or wrap them in useMemo.
