## 2024-05-22 - [Chat Message Memoization]
**Learning:** Extracting complex list items (like chat messages with markdown parsing) into `React.memo` components significantly reduces re-render cost during high-frequency updates (like AI streaming).
**Action:** Always memoize list items in chat interfaces or similar streaming UIs.

## 2024-05-22 - [Stable Callbacks for Memoization]
**Learning:** When passing callbacks (like `handleSend`) to `React.memo` components, if the callback depends on changing state, `useCallback` alone is insufficient as it will change on every render.
**Action:** Use a `useRef` to store the latest callback and expose a stable `useCallback` wrapper that invokes `ref.current`.

## 2024-05-22 - [Optimizing Multiple useMemo Dependencies]
**Learning:** When multiple `useMemo` hooks derive state by applying the exact same O(N) array transformations (like `.map()`) using identical dependencies, it causes redundant operations on every update.
**Action:** Extract the shared transformation into a single `useMemo` hook and pass the resulting normalized array as a dependency to the subsequent hooks. This drastically reduces the time complexity per re-render.
