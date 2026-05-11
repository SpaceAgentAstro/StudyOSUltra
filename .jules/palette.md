# Palette's Journal

## 2026-02-08 - Icon-Only Button Pattern
**Learning:** The Chat Interface relied heavily on icon-only buttons (Send, Attach, Stop, Tools) without accessible labels, making the core functionality invisible to screen reader users.
**Action:** When designing toolbars or chat inputs, always enforce a "label or aria-label" rule for every interactive element during the initial review.
## 2026-05-11 - Missing ARIA Labels on Detail Panels
**Learning:** Modal and detail panels (like in KnowledgeUniverse) often use icon-only close buttons lacking `aria-label` and keyboard focus styles, creating an accessibility barrier.
**Action:** Always verify that dismissive/close icon buttons include an `aria-label` and `focus-visible` utility classes.
