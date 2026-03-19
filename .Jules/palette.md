# Palette's Journal

## 2026-02-08 - Icon-Only Button Pattern
**Learning:** The Chat Interface relied heavily on icon-only buttons (Send, Attach, Stop, Tools) without accessible labels, making the core functionality invisible to screen reader users.
**Action:** When designing toolbars or chat inputs, always enforce a "label or aria-label" rule for every interactive element during the initial review.

## 2026-02-12 - Dynamic Detail Panels Focus & Labelling
**Learning:** Dismissible dynamic UI panels (e.g., Knowledge Universe detail view, Cognitive Lab overlays) frequently use icon-only close buttons (like 'Compass rotate-45' or simple 'X') that lack `aria-label` attributes and `focus-visible` styles, rendering them invisible to screen readers and difficult to navigate via keyboard.
**Action:** When implementing or reviewing dynamic overlays and panels, ensure that all dismiss/close buttons have descriptive `aria-label` attributes (e.g., "Close concept details") and explicit `focus-visible` styling to support keyboard navigation.
