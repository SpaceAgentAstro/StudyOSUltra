## 2024-05-22 - Accessibility in File Upload Zones
**Learning:** Custom interactive elements like file upload zones often lack keyboard accessibility (tabindex, role, keydown handlers), making them unusable for keyboard-only users.
**Action:** Always ensure non-button interactive elements have `role="button"`, `tabIndex={0}`, and an `onKeyDown` handler that triggers on Enter/Space.

## 2024-05-23 - Responsive Navigation Accessibility
**Learning:** Hiding text labels with `hidden md:block` on mobile layouts removes the accessible name for screen readers, leaving them with unannounced icon-only buttons.
**Action:** When hiding text labels responsively, always add `aria-label` and `title` to the parent button to ensure it remains accessible and provides tooltips.
