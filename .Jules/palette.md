# Palette's Journal

## 2026-02-08 - Icon-Only Button Pattern
**Learning:** The Chat Interface relied heavily on icon-only buttons (Send, Attach, Stop, Tools) without accessible labels, making the core functionality invisible to screen reader users.
**Action:** When designing toolbars or chat inputs, always enforce a "label or aria-label" rule for every interactive element during the initial review.

## 2026-02-08 - Detail Panel Accessibility Pattern
**Learning:** Dismissible dynamic UI panels (like the Knowledge Universe detail view) often rely on icon-only close buttons without accessible labels or focus states, breaking keyboard navigation.
**Action:** Always enforce descriptive `aria-label` attributes and clear focus states (e.g., `focus-visible:ring-2 rounded-full`) on close buttons for dynamic overlays.
