## 2024-05-22 - Accessibility in File Upload Zones
**Learning:** Custom interactive elements like file upload zones often lack keyboard accessibility (tabindex, role, keydown handlers), making them unusable for keyboard-only users.
**Action:** Always ensure non-button interactive elements have `role="button"`, `tabIndex={0}`, and an `onKeyDown` handler that triggers on Enter/Space.

## 2024-05-24 - Accessibility of Responsive Icon-Only Buttons
**Learning:** When using responsive utilities like `hidden md:block` to hide button text on mobile, the button becomes icon-only. Without `aria-label` or `title`, screen readers may announce nothing or just "button", and sighted users lose context.
**Action:** Always add `aria-label` and `title` to buttons that might become icon-only in responsive layouts, ensuring the label matches the hidden text.
