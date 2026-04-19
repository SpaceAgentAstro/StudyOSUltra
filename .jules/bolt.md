## 2024-05-22 - [Chat Message Memoization]
**Learning:** Extracting complex list items (like chat messages with markdown parsing) into `React.memo` components significantly reduces re-render cost during high-frequency updates (like AI streaming).
**Action:** Always memoize list items in chat interfaces or similar streaming UIs.

## 2024-05-22 - [Stable Callbacks for Memoization]
**Learning:** When passing callbacks (like `handleSend`) to `React.memo` components, if the callback depends on changing state, `useCallback` alone is insufficient as it will change on every render.
**Action:** Use a `useRef` to store the latest callback and expose a stable `useCallback` wrapper that invokes `ref.current`.
## 2026-04-19 - [Array Iteration Micro-optimization]
**Learning:** Consolidating multiple `.filter()` passes over the same large array into a single `for...of` loop within `useMemo` reduces iteration overhead and avoids redundant array allocations, but we must ensure we don't accidentally check in unrelated dependencies or lockfiles during verification.
**Action:** Always verify git status to ensure lockfiles are restored before requesting a review, and explicitly document optimizations with clear comments as required by guidelines.
