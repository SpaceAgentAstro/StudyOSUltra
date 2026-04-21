# Palette's Journal

## 2026-02-08 - Icon-Only Button Pattern
**Learning:** The Chat Interface relied heavily on icon-only buttons (Send, Attach, Stop, Tools) without accessible labels, making the core functionality invisible to screen reader users.
**Action:** When designing toolbars or chat inputs, always enforce a "label or aria-label" rule for every interactive element during the initial review.

## 2026-02-08 - Custom Overlay/Modal Close Buttons
**Learning:** In highly custom data visualizations (like `KnowledgeUniverse` nodes or interactive canvas details), the "Close" buttons for the HUD or detail panels are frequently implemented as icon-only (e.g., a rotating compass or X) and completely miss `aria-label`s. This makes exiting detailed views impossible for screen reader users.
**Action:** When reviewing custom overlays, detail panels, or modal-like HUDs built with custom CSS/animations, strictly verify that the dismiss/close interaction has an `aria-label` (e.g., `aria-label="Close details"`).