## 2024-05-22 - Chat Interface Rendering Optimization
**Learning:** React re-renders all list items when parent state changes unless memoized. In `ChatInterface`, typing in the input caused full re-parsing of all chat history messages (regex split + mapping). This is O(N*M) where N is history length and M is message complexity.
**Action:** Extracted message parsing logic into `MessageContent` component wrapped with `React.memo`. Used `useRef` to maintain a stable `onExplain` callback reference to prevent breaking memoization, as the parent `handleSend` function is recreated on every render. Validated with `benchmark_parsing.js` showing ~0.6ms parse time per message.

## 2024-05-22 - Environment Constraints
**Learning:** The sandbox environment may lack `node_modules`, preventing `npm run dev`, `vitest`, `tsc`, and `playwright` from running.
**Action:** Rely on manual code verification and isolated Node.js scripts (using `bun` or `node`) to verify logic when standard tooling fails. Document these limitations in PRs.
