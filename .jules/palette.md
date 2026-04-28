# Palette's Journal

## 2026-02-08 - Icon-Only Button Pattern
**Learning:** The Chat Interface relied heavily on icon-only buttons (Send, Attach, Stop, Tools) without accessible labels, making the core functionality invisible to screen reader users.
**Action:** When designing toolbars or chat inputs, always enforce a "label or aria-label" rule for every interactive element during the initial review.
## 2025-04-28 - Knowledge Universe Detail Panel Accessibility
**Learning:** Found an icon-only button (a rotated Compass icon acting as an 'X') used to close the Detail Panel in the Knowledge Universe component. It lacked an `aria-label` and keyboard focus styling, making it difficult for screen readers and keyboard users to navigate.
**Action:** Always verify that interactive elements, especially custom modal or panel close buttons that use icons, include an `aria-label` and `focus-visible` classes to ensure they are fully accessible.
