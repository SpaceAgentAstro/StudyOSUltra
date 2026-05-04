# Palette's Journal

## 2026-02-08 - Icon-Only Button Pattern
**Learning:** The Chat Interface relied heavily on icon-only buttons (Send, Attach, Stop, Tools) without accessible labels, making the core functionality invisible to screen reader users.
**Action:** When designing toolbars or chat inputs, always enforce a "label or aria-label" rule for every interactive element during the initial review.
## 2026-05-04 - Focus Visible and ARIA Label Pattern in Detail Panels
**Learning:** Icon-only close buttons inside dynamically rendered detail panels (like the HUD in KnowledgeUniverse) often omit `aria-label` attributes and proper keyboard focus indicators (`focus-visible`).
**Action:** Apply `aria-label` and tailwind `focus-visible` utility classes to icon-only buttons to ensure they are accessible via keyboard navigation and screen readers.
