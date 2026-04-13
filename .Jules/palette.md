# Palette's Journal

## 2026-02-08 - Icon-Only Button Pattern
**Learning:** The Chat Interface relied heavily on icon-only buttons (Send, Attach, Stop, Tools) without accessible labels, making the core functionality invisible to screen reader users.
**Action:** When designing toolbars or chat inputs, always enforce a "label or aria-label" rule for every interactive element during the initial review.
## 2026-02-08 - Accessible Dynamic Panel Actions
**Learning:** Dismissible dynamic UI panels (like the slide-out detail view in Knowledge Universe) often implement "close" actions using icon-only buttons without `aria-label`s or focus states, which completely isolates keyboard and screen reader users from escaping the overlay context.
**Action:** When auditing or implementing dynamic side-panels or modals, immediately assert that the dismiss/close button explicitly defines an `aria-label` and `focus-visible` outline to guarantee keyboard escapability.
