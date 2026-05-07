## 2024-05-22 - [Chat Message Memoization]
**Learning:** Extracting complex list items (like chat messages with markdown parsing) into `React.memo` components significantly reduces re-render cost during high-frequency updates (like AI streaming).
**Action:** Always memoize list items in chat interfaces or similar streaming UIs.

## 2024-05-22 - [Stable Callbacks for Memoization]
**Learning:** When passing callbacks (like `handleSend`) to `React.memo` components, if the callback depends on changing state, `useCallback` alone is insufficient as it will change on every render.
**Action:** Use a `useRef` to store the latest callback and expose a stable `useCallback` wrapper that invokes `ref.current`.
## 2026-05-07 - [O(N^2) Render Loop Optimization]
**Learning:** Nested array lookups inside React derivations cause severe performance drops as datasets grow. Moving the lookup to a pre-computed Map inside a useMemo hook reduces time complexity to O(N).
**Action:** Use a Map for O(1) lookups and wrap expensive derivations in useMemo to prevent unnecessary recalculations.
