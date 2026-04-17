# Palette's Journal

## 2026-02-08 - Icon-Only Button Pattern
**Learning:** The Chat Interface relied heavily on icon-only buttons (Send, Attach, Stop, Tools) without accessible labels, making the core functionality invisible to screen reader users.
**Action:** When designing toolbars or chat inputs, always enforce a "label or aria-label" rule for every interactive element during the initial review.

## 2026-02-08 - Dismissible Panel Close Buttons Pattern
**Learning:** Dismissible dynamic UI panels (e.g., modals, slide-outs, Knowledge Universe detail view) often use icon-only close buttons without descriptive `aria-label` attributes and clear focus states. This makes them inaccessible to screen reader users and difficult to navigate via keyboard.
**Action:** When creating or reviewing dismissible panels, always ensure the close button includes a descriptive `aria-label` (e.g., `aria-label="Close details"`) and explicit focus states (e.g., `focus-visible:ring-2`, `focus-visible:outline-none`) to ensure keyboard accessibility.
