## 2024-05-22 - [Chat Message Memoization]
**Learning:** Extracting complex list items (like chat messages with markdown parsing) into `React.memo` components significantly reduces re-render cost during high-frequency updates (like AI streaming).
**Action:** Always memoize list items in chat interfaces or similar streaming UIs.

## 2024-05-22 - [Stable Callbacks for Memoization]
**Learning:** When passing callbacks (like `handleSend`) to `React.memo` components, if the callback depends on changing state, `useCallback` alone is insufficient as it will change on every render.
**Action:** Use a `useRef` to store the latest callback and expose a stable `useCallback` wrapper that invokes `ref.current`.

## 2024-05-23 - [Static Array Hoisting in Render Loops]
**Learning:** In highly interactive components (like navigation sidebars), defining large static arrays of complex objects (especially those with React components/Icons as values) inside the render function causes unnecessary O(N) memory allocation and garbage collection pressure on every state change.
**Action:** Always hoist static configuration arrays and objects to the module level (outside the component) when they don't depend on props or state.
