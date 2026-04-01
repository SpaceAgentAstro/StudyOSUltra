# Palette's Journal

## 2026-02-08 - Icon-Only Button Pattern
**Learning:** The Chat Interface relied heavily on icon-only buttons (Send, Attach, Stop, Tools) without accessible labels, making the core functionality invisible to screen reader users.
**Action:** When designing toolbars or chat inputs, always enforce a "label or aria-label" rule for every interactive element during the initial review.

## 2026-02-14 - Dismissible Dynamic UI Panels Pattern
**Learning:** Dismissible dynamic UI panels (e.g., modals, slide-outs, Knowledge Universe detail view) often omit accessible labels on close buttons. This is especially problematic when the close button is icon-only or relies solely on context for sighted users.
**Action:** When working on dynamic panels, always ensure the close/dismiss controls have a descriptive `aria-label` attribute (e.g., `aria-label="Close details panel"`) so screen reader users can reliably escape them.
