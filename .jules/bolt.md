## 2024-05-22 - [Chat Message Memoization]
**Learning:** Extracting complex list items (like chat messages with markdown parsing) into `React.memo` components significantly reduces re-render cost during high-frequency updates (like AI streaming).
**Action:** Always memoize list items in chat interfaces or similar streaming UIs.

## 2024-05-22 - [Stable Callbacks for Memoization]
**Learning:** When passing callbacks (like `handleSend`) to `React.memo` components, if the callback depends on changing state, `useCallback` alone is insufficient as it will change on every render.
**Action:** Use a `useRef` to store the latest callback and expose a stable `useCallback` wrapper that invokes `ref.current`.
## 2024-05-23 - [Redundant Mapping in useMemo]
**Learning:** Using `.map()` inside multiple `useMemo` hooks that depend on the same array causes redundant O(N) operations. In GameCenter.tsx, `players.map()` was called three times for weekly, seasonal, and holiday leaderboards.
**Action:** Extract the shared `.map()` operation into its own `useMemo` hook (e.g., `normalizedPlayers`) and use it as a dependency for the dependent computations to improve performance.
