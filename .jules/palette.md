# Palette's Journal

## 2026-02-08 - Icon-Only Button Pattern
**Learning:** The Chat Interface relied heavily on icon-only buttons (Send, Attach, Stop, Tools) without accessible labels, making the core functionality invisible to screen reader users.
**Action:** When designing toolbars or chat inputs, always enforce a "label or aria-label" rule for every interactive element during the initial review.
## 2026-06-10 - Knowledge Universe Close Detail Panel Button Pattern
**Learning:** The Knowledge Universe detail panel used an icon-only close button without an accessible label, similar to the Chat Interface. This pattern of omitting aria-labels on ad-hoc icon buttons is recurrent.
**Action:** Always ensure icon-only buttons (especially those dismissing floating panels or modals) include an explicit `aria-label` attribute like "Close detail panel" to remain screen reader friendly.
