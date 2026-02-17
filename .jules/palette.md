## 2024-05-22 - Accessibility in File Upload Zones
**Learning:** Custom interactive elements like file upload zones often lack keyboard accessibility (tabindex, role, keydown handlers), making them unusable for keyboard-only users.
**Action:** Always ensure non-button interactive elements have `role="button"`, `tabIndex={0}`, and an `onKeyDown` handler that triggers on Enter/Space.

## 2026-02-17 - Accessible Navigation
**Learning:** Responsive layouts that hide text labels on mobile (using `hidden` classes) leave buttons without accessible names unless `aria-label` is present.
**Action:** Always add `aria-label` matching the text label to navigation buttons, and `title` for hover tooltips.
