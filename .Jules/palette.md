# Palette's Journal

## 2026-02-08 - Icon-Only Button Pattern
**Learning:** The Chat Interface relied heavily on icon-only buttons (Send, Attach, Stop, Tools) without accessible labels, making the core functionality invisible to screen reader users.
**Action:** When designing toolbars or chat inputs, always enforce a "label or aria-label" rule for every interactive element during the initial review.

## 2026-04-09 - Accessible Dismissible Panels
**Learning:** Dismissible dynamic UI panels (e.g., modals, slide-outs, Knowledge Universe detail view) often use icon-only close buttons that lack `aria-label` attributes and keyboard focus states, making them inaccessible to screen readers and keyboard users.
**Action:** Always include descriptive `aria-label` attributes and clear focus states (e.g., `focus-visible:ring-2`) on close buttons for dismissible UI panels.
