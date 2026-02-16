## 2025-02-17 - Chat Interface Memoization
**Learning:** React state updates during high-frequency events (like streaming AI responses) can cause massive re-renders of list components (O(N)). Extracting list items into memoized components is critical.
**Action:** Always wrap complex list items in `React.memo` and ensure callback props are stable (using `useCallback` or `useRef` pattern) to prevent prop churn.
