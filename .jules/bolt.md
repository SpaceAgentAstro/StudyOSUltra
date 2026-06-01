## 2024-05-22 - [Chat Message Memoization]
**Learning:** Extracting complex list items (like chat messages with markdown parsing) into `React.memo` components significantly reduces re-render cost during high-frequency updates (like AI streaming).
**Action:** Always memoize list items in chat interfaces or similar streaming UIs.

## 2024-05-22 - [Stable Callbacks for Memoization]
**Learning:** When passing callbacks (like `handleSend`) to `React.memo` components, if the callback depends on changing state, `useCallback` alone is insufficient as it will change on every render.
**Action:** Use a `useRef` to store the latest callback and expose a stable `useCallback` wrapper that invokes `ref.current`.

## 2024-05-24 - Avoid Redundant Array Traversal in React Memoizations
**Learning:** In React components that manage multiple derived state values (like multiple leaderboards based on the same dataset), calling `.map()` inside separate `useMemo` hooks can lead to redundant O(N) operations. In `GameCenter.tsx`, the player array was being fully mapped and normalized three separate times on every relevant dependency change.
**Action:** Always pre-compute and memoize intermediate arrays (e.g., `normalizedPlayers`) before using them in subsequent derived state calculations. This converts O(3N) operations into O(N) + O(3) references, significantly improving performance for large lists.
