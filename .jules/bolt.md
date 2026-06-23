## 2024-05-22 - [Chat Message Memoization]
**Learning:** Extracting complex list items (like chat messages with markdown parsing) into `React.memo` components significantly reduces re-render cost during high-frequency updates (like AI streaming).
**Action:** Always memoize list items in chat interfaces or similar streaming UIs.

## 2024-05-22 - [Stable Callbacks for Memoization]
**Learning:** When passing callbacks (like `handleSend`) to `React.memo` components, if the callback depends on changing state, `useCallback` alone is insufficient as it will change on every render.
**Action:** Use a `useRef` to store the latest callback and expose a stable `useCallback` wrapper that invokes `ref.current`.
## 2024-05-24 - React Component Shallow Comparison
**Learning:** React.memo shallow comparison checks if props references have changed. Using a custom comparator that ignores callback props (like `setView`) is an anti-pattern that creates stale closures, leading to the component interacting with outdated parent state.
**Action:** Always use default shallow comparison for `React.memo` unless you fully understand the consequences of ignoring prop updates.
