## 2024-05-22 - [Chat Message Memoization]
**Learning:** Extracting complex list items (like chat messages with markdown parsing) into `React.memo` components significantly reduces re-render cost during high-frequency updates (like AI streaming).
**Action:** Always memoize list items in chat interfaces or similar streaming UIs.

## 2024-05-22 - [Stable Callbacks for Memoization]
**Learning:** When passing callbacks (like `handleSend`) to `React.memo` components, if the callback depends on changing state, `useCallback` alone is insufficient as it will change on every render.
**Action:** Use a `useRef` to store the latest callback and expose a stable `useCallback` wrapper that invokes `ref.current`.
## 2026-04-10 - [O(1) Map Lookups in Nested Loops]
**Learning:** Calling Array.prototype.find() inside a nested loop results in O(N^2) time complexity, which can cause significant frame drops during UI rendering for large datasets (like graph nodes).
**Action:** Always extract Array.prototype.find() from inside a loop by pre-computing a Map for O(1) lookups beforehand, reducing overall complexity to O(N).
