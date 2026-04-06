## 2024-05-22 - [Chat Message Memoization]
**Learning:** Extracting complex list items (like chat messages with markdown parsing) into `React.memo` components significantly reduces re-render cost during high-frequency updates (like AI streaming).
**Action:** Always memoize list items in chat interfaces or similar streaming UIs.

## 2024-05-22 - [Stable Callbacks for Memoization]
**Learning:** When passing callbacks (like `handleSend`) to `React.memo` components, if the callback depends on changing state, `useCallback` alone is insufficient as it will change on every render.
**Action:** Use a `useRef` to store the latest callback and expose a stable `useCallback` wrapper that invokes `ref.current`.

## 2026-04-06 - [O(N^2) React SVG Edge Rendering]
**Learning:** Computing relational graph edges using `array.find` inside a nested loop during React renders causes a costly O(N^2) bottleneck. Additionally, recomputing these arrays on every render ignores React's reconciliation benefits and hurts performance.
**Action:** When rendering SVG connections or graph edges, always use `useMemo` to cache the derivation, and convert the lookup array into a `Map` to guarantee O(1) lookups, turning the complexity to O(N).
