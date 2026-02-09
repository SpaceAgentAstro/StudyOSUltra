## 2025-05-15 - File Upload Accessibility
**Learning:** File upload areas implemented as clickable `div`s are inaccessible to keyboard users.
**Action:** Always add `role="button"`, `tabIndex={0}`, and `onKeyDown` (handling Enter/Space) to non-button interactive elements, or wrap them in a `<button>`.
