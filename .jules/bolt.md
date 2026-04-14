## 2024-05-22 - [Chat Message Memoization]
**Learning:** Extracting complex list items (like chat messages with markdown parsing) into `React.memo` components significantly reduces re-render cost during high-frequency updates (like AI streaming).
**Action:** Always memoize list items in chat interfaces or similar streaming UIs.

## 2024-05-22 - [Stable Callbacks for Memoization]
**Learning:** When passing callbacks (like `handleSend`) to `React.memo` components, if the callback depends on changing state, `useCallback` alone is insufficient as it will change on every render.
**Action:** Use a `useRef` to store the latest callback and expose a stable `useCallback` wrapper that invokes `ref.current`.

## 2024-05-22 - [Optimizing Nested Array Loops with Maps]
**Learning:** Replacing `Array.prototype.find()` inside a nested array loop with an O(1) `Map` lookup initialized outside the loop reduces time complexity from O(N^2) to O(N). This is especially critical when dealing with large nested data structures like nodes and connection edges in SVG generation.
**Action:** Always prefer `Map` lookups over array searching methods inside loops when dealing with connections or mappings.
