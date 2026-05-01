## 2024-05-22 - [Chat Message Memoization]
**Learning:** Extracting complex list items (like chat messages with markdown parsing) into `React.memo` components significantly reduces re-render cost during high-frequency updates (like AI streaming).
**Action:** Always memoize list items in chat interfaces or similar streaming UIs.

## 2024-05-22 - [Stable Callbacks for Memoization]
**Learning:** When passing callbacks (like `handleSend`) to `React.memo` components, if the callback depends on changing state, `useCallback` alone is insufficient as it will change on every render.
**Action:** Use a `useRef` to store the latest callback and expose a stable `useCallback` wrapper that invokes `ref.current`.
## 2026-05-01 - Optimize edge mapping
**Learning:** Nested Array.prototype.find() lookups inside render loops or derivations (like calculating graph edges) result in O(N^2) time complexity, which causes severe performance degradation during UI updates.
**Action:** Extract nested lookups by creating an O(1) Map outside the inner loop and wrap the derivation in useMemo to reduce complexity to O(N) and prevent unnecessary recalculations.
