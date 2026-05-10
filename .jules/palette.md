# Palette's Journal

## 2026-02-08 - Icon-Only Button Pattern
**Learning:** The Chat Interface relied heavily on icon-only buttons (Send, Attach, Stop, Tools) without accessible labels, making the core functionality invisible to screen reader users.
**Action:** When designing toolbars or chat inputs, always enforce a "label or aria-label" rule for every interactive element during the initial review.
## 2026-05-10 - Detail Panel Close Button Pattern
**Learning:** Custom data visualizations and modal/HUD detail panels often feature icon-only close buttons (like Compass or X icons) that lack `aria-label` attributes and keyboard focus styling, making them inaccessible to screen readers and difficult to navigate via keyboard.
**Action:** Always add an `aria-label` and `focus-visible` classes to these interactive elements.
