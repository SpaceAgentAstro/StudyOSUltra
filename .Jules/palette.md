# Palette's Journal

## 2026-02-08 - Icon-Only Button Pattern
**Learning:** The Chat Interface relied heavily on icon-only buttons (Send, Attach, Stop, Tools) without accessible labels, making the core functionality invisible to screen reader users.
**Action:** When designing toolbars or chat inputs, always enforce a "label or aria-label" rule for every interactive element during the initial review.

## 2026-02-08 - Dynamic UI Close Button Pattern
**Learning:** Dismissible dynamic UI panels (e.g., detail panels, modals) consistently implement icon-only close buttons without accessible names (`aria-label`) or adequate keyboard focus indicators.
**Action:** When working on dynamic overlay/detail views, proactively ensure all close buttons feature both descriptive `aria-label`s and visible focus states (e.g., `focus-visible:ring-2`) to support screen reader and keyboard-only users.
