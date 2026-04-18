# Palette's Journal

## 2026-02-08 - Icon-Only Button Pattern
**Learning:** The Chat Interface relied heavily on icon-only buttons (Send, Attach, Stop, Tools) without accessible labels, making the core functionality invisible to screen reader users.
**Action:** When designing toolbars or chat inputs, always enforce a "label or aria-label" rule for every interactive element during the initial review.

## 2026-04-18 - Dismissible Overlay Focus Pattern
**Learning:** Dismissible dynamic UI panels (like the detail panel in Knowledge Universe) often contain icon-only close buttons lacking clear accessible names and focus indicators, making them difficult to close for keyboard and screen reader users.
**Action:** When implementing or reviewing any modal, detail view, or overlay, always verify that the close button has an `aria-label` (e.g., 'Close details') and a distinct `focus-visible` style (e.g., `focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:outline-none rounded-lg`).
