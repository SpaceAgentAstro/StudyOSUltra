# Palette's Journal

## 2026-02-08 - Icon-Only Button Pattern
**Learning:** The Chat Interface relied heavily on icon-only buttons (Send, Attach, Stop, Tools) without accessible labels, making the core functionality invisible to screen reader users.
**Action:** When designing toolbars or chat inputs, always enforce a "label or aria-label" rule for every interactive element during the initial review.

## 2026-03-31 - Dismissible Panel Pattern
**Learning:** Dismissible dynamic UI panels (like the Knowledge Universe detail view) often rely on icon-only close buttons that lack descriptive accessible names, making it impossible for screen reader users to identify how to close the panel.
**Action:** When creating modals, slide-outs, or detail panels, ensure the dismiss/close button explicitly includes an `aria-label` attribute (e.g., `aria-label="Close details"`).
