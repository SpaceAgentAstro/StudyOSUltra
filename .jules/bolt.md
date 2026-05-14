## 2024-05-22 - [Chat Message Memoization]
**Learning:** Extracting complex list items (like chat messages with markdown parsing) into `React.memo` components significantly reduces re-render cost during high-frequency updates (like AI streaming).
**Action:** Always memoize list items in chat interfaces or similar streaming UIs.

## 2024-05-22 - [Stable Callbacks for Memoization]
**Learning:** When passing callbacks (like `handleSend`) to `React.memo` components, if the callback depends on changing state, `useCallback` alone is insufficient as it will change on every render.
**Action:** Use a `useRef` to store the latest callback and expose a stable `useCallback` wrapper that invokes `ref.current`.
## 2026-05-14 - [O(1) Map for Derivation Loops]
**Learning:** Replacing nested `Array.prototype.find()` lookups inside React render or derivation loops with an O(1) `Map` initialized outside the inner loop reduces time complexity from O(N^2) to O(N).
**Action:** Always use an O(1) Map for nested array lookups inside render and derivation loops.
