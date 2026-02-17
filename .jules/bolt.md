
## 2024-05-23 - Chat Performance Optimization

**Learning:** Expensive text parsing logic (e.g., regex splitting for code blocks and citations) inside a loop in a React component renders on every update, causing performance degradation as the list grows.
**Action:** Extract the rendering logic into a separate `React.memo` component (`MessageContent`) and use the `useRef` + `useCallback` pattern to pass stable event handlers (like `onExplain`) to avoid breaking memoization. This ensures that only new or changed messages re-render, keeping the chat interface responsive even with long histories.
