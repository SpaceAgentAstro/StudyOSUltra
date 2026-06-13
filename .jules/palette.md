# Palette's Journal

## 2026-02-08 - Icon-Only Button Pattern
**Learning:** The Chat Interface relied heavily on icon-only buttons (Send, Attach, Stop, Tools) without accessible labels, making the core functionality invisible to screen reader users.
**Action:** When designing toolbars or chat inputs, always enforce a "label or aria-label" rule for every interactive element during the initial review.
## 2026-03-09 - Accessible Detail Panel Close Buttons
**Learning:** Icon-only close buttons in slide-out details panels (like KnowledgeUniverse) lack accessibility without `aria-label`s, rendering them invisible to screen readers, and require explicit focus states (`focus-visible`) for keyboard navigability.
**Action:** Always ensure icon-only buttons receive `aria-label`, `title`, and explicit `focus-visible` ring styling to maintain full accessibility and usability for both screen readers and keyboard users.
