# Palette's Journal

## 2026-02-08 - Icon-Only Button Pattern
**Learning:** The Chat Interface relied heavily on icon-only buttons (Send, Attach, Stop, Tools) without accessible labels, making the core functionality invisible to screen reader users.
**Action:** When designing toolbars or chat inputs, always enforce a "label or aria-label" rule for every interactive element during the initial review.
## 2026-05-14 - Component Icon-Only Validation
**Learning:** The 'Compass' close icon inside the detail panel of `KnowledgeUniverse.tsx` lacked an accessible label and keyboard focus state, continuing the pattern of inaccessible icon-only buttons.
**Action:** Add `aria-label` and keyboard focus styling (`focus-visible:outline-none focus-visible:ring-2 rounded-lg`) to all icon-only action buttons.
