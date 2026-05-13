## 2024-05-22 - [Chat Message Memoization]
**Learning:** Extracting complex list items (like chat messages with markdown parsing) into `React.memo` components significantly reduces re-render cost during high-frequency updates (like AI streaming).
**Action:** Always memoize list items in chat interfaces or similar streaming UIs.

## 2024-05-22 - [Stable Callbacks for Memoization]
**Learning:** When passing callbacks (like `handleSend`) to `React.memo` components, if the callback depends on changing state, `useCallback` alone is insufficient as it will change on every render.
**Action:** Use a `useRef` to store the latest callback and expose a stable `useCallback` wrapper that invokes `ref.current`.

## 2026-05-13 - [O(n^2) DOM Render Optimizations]
**Learning:** Repeatedly calling array.find() inside an inner loop (for computing node connections) inside a React component creates an O(N^2) render loop that slows down significantly with large node graphs.
**Action:** Create a pre-computed Map of nodes (O(1) lookup) outside the inner loop and memoize the resulting JSX nodes with useMemo.
