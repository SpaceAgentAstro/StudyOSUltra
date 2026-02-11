## 2024-05-22 - Accessibility in File Upload Zones
**Learning:** Custom interactive elements like file upload zones often lack keyboard accessibility (tabindex, role, keydown handlers), making them unusable for keyboard-only users.
**Action:** Always ensure non-button interactive elements have `role="button"`, `tabIndex={0}`, and an `onKeyDown` handler that triggers on Enter/Space.
