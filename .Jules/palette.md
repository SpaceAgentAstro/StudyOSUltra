# Palette's Journal

## 2026-02-08 - Icon-Only Button Pattern
**Learning:** The Chat Interface relied heavily on icon-only buttons (Send, Attach, Stop, Tools) without accessible labels, making the core functionality invisible to screen reader users.
**Action:** When designing toolbars or chat inputs, always enforce a "label or aria-label" rule for every interactive element during the initial review.

## 2024-05-24 - Accessibility on Icon-Only Dismiss Buttons
**Learning:** Dismissible dynamic UI panels (e.g., Knowledge Universe detail view) often rely on icon-only buttons without accessible labels or clear focus states, making them difficult to close for keyboard and screen reader users.
**Action:** When creating modals, slide-outs, or detail panels, ensure the close button has a descriptive `aria-label` (e.g., "Close details") and visible focus indicators (`focus-visible:ring-2`) to ensure full accessibility.
