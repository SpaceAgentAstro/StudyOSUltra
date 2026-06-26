## 2024-05-22 - [Chat Message Memoization]
**Learning:** Extracting complex list items (like chat messages with markdown parsing) into `React.memo` components significantly reduces re-render cost during high-frequency updates (like AI streaming).
**Action:** Always memoize list items in chat interfaces or similar streaming UIs.

## 2024-05-22 - [Stable Callbacks for Memoization]
**Learning:** When passing callbacks (like `handleSend`) to `React.memo` components, if the callback depends on changing state, `useCallback` alone is insufficient as it will change on every render.
**Action:** Use a `useRef` to store the latest callback and expose a stable `useCallback` wrapper that invokes `ref.current`.

## 2024-06-26 - [Duplicate Render Tree Bottleneck]
**Learning:** Found a massive performance sink where an entire complex component tree (`ChatInterface`) was duplicated and hidden via `display: none` in `App.tsx`. Since `display: none` doesn't prevent React from mounting and keeping the tree in memory, this doubled the rendering overhead and state management for the app's heaviest feature.
**Action:** Always verify that conditional UI branches use conditional rendering (e.g., `{condition && <Component />}`) rather than CSS display toggling to prevent duplicating heavy component lifecycles.
