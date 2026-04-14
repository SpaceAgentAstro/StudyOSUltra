# Palette's Journal

## 2026-02-08 - Icon-Only Button Pattern
**Learning:** The Chat Interface relied heavily on icon-only buttons (Send, Attach, Stop, Tools) without accessible labels, making the core functionality invisible to screen reader users.
**Action:** When designing toolbars or chat inputs, always enforce a "label or aria-label" rule for every interactive element during the initial review.

## 2026-02-08 - Dismissible Panels Focus States
**Learning:** Dismissible dynamic UI panels (e.g., Knowledge Universe detail view) relied on icon-only close buttons lacking aria labels and focus indicators, making them functionally invisible to screen readers and keyboard navigators.
**Action:** When working on dynamic panels, always include descriptive `aria-label` attributes and clear focus states (e.g., `focus-visible:ring-2`) on close buttons to ensure full accessibility.
