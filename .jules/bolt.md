## 2024-05-22 - [Chat Message Memoization]
**Learning:** Extracting complex list items (like chat messages with markdown parsing) into `React.memo` components significantly reduces re-render cost during high-frequency updates (like AI streaming).
**Action:** Always memoize list items in chat interfaces or similar streaming UIs.

## 2024-05-22 - [Stable Callbacks for Memoization]
**Learning:** When passing callbacks (like `handleSend`) to `React.memo` components, if the callback depends on changing state, `useCallback` alone is insufficient as it will change on every render.
**Action:** Use a `useRef` to store the latest callback and expose a stable `useCallback` wrapper that invokes `ref.current`.
## 2024-06-25 - [Redundant Memo Hook Mapping]
**Learning:** Performing array mapping operations multiple times within separate \`useMemo\` dependencies (like creating multiple leaderboards from normalized players) triggers O(N) operations repeatedly on every render.
**Action:** Extract the normalized map step into its own \`useMemo\` and pass the resulting array into subsequent hooks.
