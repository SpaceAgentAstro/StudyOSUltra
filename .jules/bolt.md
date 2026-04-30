## 2024-05-22 - [Chat Message Memoization]
**Learning:** Extracting complex list items (like chat messages with markdown parsing) into `React.memo` components significantly reduces re-render cost during high-frequency updates (like AI streaming).
**Action:** Always memoize list items in chat interfaces or similar streaming UIs.

## 2024-05-22 - [Stable Callbacks for Memoization]
**Learning:** When passing callbacks (like `handleSend`) to `React.memo` components, if the callback depends on changing state, `useCallback` alone is insufficient as it will change on every render.
**Action:** Use a `useRef` to store the latest callback and expose a stable `useCallback` wrapper that invokes `ref.current`.

## 2026-04-30 - [O(N^2) Render Lookups]
**Learning:** When generating complex SVG visualizations, nested `Array.find()` lookups inside render or derivation loops can create significant O(N^2) bottlenecks as the node count grows. Wrapping derivations in `useMemo` alone doesn't fix the underlying time complexity issue.
**Action:** Initialize an O(1) `Map` outside the inner loop to cache lookups, reducing the overall time complexity to O(N). Combine this with `useMemo` to only recalculate when dependencies change.
