## 2024-05-22 - [Chat Message Memoization]
**Learning:** Extracting complex list items (like chat messages with markdown parsing) into `React.memo` components significantly reduces re-render cost during high-frequency updates (like AI streaming).
**Action:** Always memoize list items in chat interfaces or similar streaming UIs.

## 2024-05-22 - [Stable Callbacks for Memoization]
**Learning:** When passing callbacks (like `handleSend`) to `React.memo` components, if the callback depends on changing state, `useCallback` alone is insufficient as it will change on every render.
**Action:** Use a `useRef` to store the latest callback and expose a stable `useCallback` wrapper that invokes `ref.current`.
## 2026-04-09 - [O(N^2) Render Loop Elimination]\n**Learning:** In highly connected graph UIs, using `Array.prototype.find()` inside nested iteration loops creates a massive (N^2)$ or (E \times N)$ rendering bottleneck.\n**Action:** Always pre-compute a `Map` outside graph iteration loops for (1)$ lookups, and cache the result with `useMemo` if the graph structure rarely changes.
