# Palette's Journal

## 2026-02-08 - Icon-Only Button Pattern
**Learning:** The Chat Interface relied heavily on icon-only buttons (Send, Attach, Stop, Tools) without accessible labels, making the core functionality invisible to screen reader users.
**Action:** When designing toolbars or chat inputs, always enforce a "label or aria-label" rule for every interactive element during the initial review.
## 2026-05-28 - Fix nested interactive elements
**Learning:** Interactive div wrappers with onClick handlers should be refactored to semantic button tags for a11y. However, when doing so, nested button elements must be converted to non-interactive tags (like span) to prevent invalid HTML nested buttons.
**Action:** Always check for and convert nested interactive elements when upgrading wrapper divs to buttons.
