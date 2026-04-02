## 2024-05-22 - [Chat Message Memoization]
**Learning:** Extracting complex list items (like chat messages with markdown parsing) into `React.memo` components significantly reduces re-render cost during high-frequency updates (like AI streaming).
**Action:** Always memoize list items in chat interfaces or similar streaming UIs.

## 2024-05-22 - [Stable Callbacks for Memoization]
**Learning:** When passing callbacks (like `handleSend`) to `React.memo` components, if the callback depends on changing state, `useCallback` alone is insufficient as it will change on every render.
**Action:** Use a `useRef` to store the latest callback and expose a stable `useCallback` wrapper that invokes `ref.current`.

## 2024-05-23 - [Static Array Hoisting in Core UI Components]
**Learning:** Core navigation components (like `Sidebar`) defining static arrays (e.g., `menuItems`) internally cause unnecessary memory reallocations on every render. While a generic React tip, in an app with frequent state updates (like global view changes or streaming chat), this overhead compounds.
**Action:** Always hoist static constant arrays and objects to the module level in UI components that are persistent across screens.
