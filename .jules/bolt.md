## 2024-05-22 - [Chat Message Memoization]
**Learning:** Extracting complex list items (like chat messages with markdown parsing) into `React.memo` components significantly reduces re-render cost during high-frequency updates (like AI streaming).
**Action:** Always memoize list items in chat interfaces or similar streaming UIs.

## 2024-05-22 - [Stable Callbacks for Memoization]
**Learning:** When passing callbacks (like `handleSend`) to `React.memo` components, if the callback depends on changing state, `useCallback` alone is insufficient as it will change on every render.
**Action:** Use a `useRef` to store the latest callback and expose a stable `useCallback` wrapper that invokes `ref.current`.
## 2026-04-28 - O(N^2) SVG Edge Calculations
**Learning:** Discovered an O(N^2) anti-pattern in SVG connection drawing where `Array.prototype.find` is used inside a loop over nodes to map target IDs to nodes. This causes significant performance degradation as the number of nodes increases.
**Action:** Replaced the `find` lookup with an O(1) `Map` initialized outside the loop, and wrapped the entire edge calculation in a `useMemo` hook to avoid recalculating on every re-render unless the nodes array changes.
