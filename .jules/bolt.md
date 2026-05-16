## 2024-05-22 - [Chat Message Memoization]
**Learning:** Extracting complex list items (like chat messages with markdown parsing) into `React.memo` components significantly reduces re-render cost during high-frequency updates (like AI streaming).
**Action:** Always memoize list items in chat interfaces or similar streaming UIs.

## 2024-05-22 - [Stable Callbacks for Memoization]
**Learning:** When passing callbacks (like `handleSend`) to `React.memo` components, if the callback depends on changing state, `useCallback` alone is insufficient as it will change on every render.
**Action:** Use a `useRef` to store the latest callback and expose a stable `useCallback` wrapper that invokes `ref.current`.
## 2026-05-16 - [O(n^2) Render Bottleneck Fix]
**Learning:** In React render methods (like drawing graph connections), nested loops with  (e.g. iterating over nodes, then connections, then finding the target node) create an O(N^2) complexity that scales poorly for large datasets.
**Action:** Pre-calculate an O(1) lookup Map from the array to eliminate the inner  call, reducing complexity to O(N).
## 2024-05-23 - [O(n^2) Render Bottleneck Fix]
**Learning:** In React render methods (like drawing graph connections), nested loops with `Array.prototype.find` (e.g. iterating over nodes, then connections, then finding the target node) create an O(N^2) complexity that scales poorly for large datasets.
**Action:** Pre-calculate an O(1) lookup Map from the array to eliminate the inner `.find` call, reducing complexity to O(N). Wrap the derivation in `useMemo`.
