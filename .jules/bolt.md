## 2024-05-23 - Chat Interface Performance
**Learning:** Extracting list items into memoized components (`ChatMessage`) significantly reduces re-renders in chat applications where the parent component manages frequent state updates (like user input).
**Action:** When refactoring lists for performance, always ensure callbacks passed to memoized children are stable (using `useCallback` or stable refs) to prevent breaking memoization.

## 2024-05-23 - Dependency Management
**Learning:** Using `pnpm install` in a repository with `package-lock.json` generates a `pnpm-lock.yaml`, which can be flagged as an unwanted file in code reviews if not intended.
**Action:** Always check existing lockfiles before running install commands. Use `npm install` if `package-lock.json` exists to avoid generating conflicting lockfiles.
