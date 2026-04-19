# Palette's Journal

## 2026-02-08 - Icon-Only Button Pattern
**Learning:** The Chat Interface relied heavily on icon-only buttons (Send, Attach, Stop, Tools) without accessible labels, making the core functionality invisible to screen reader users.
**Action:** When designing toolbars or chat inputs, always enforce a "label or aria-label" rule for every interactive element during the initial review.

## 2025-04-19 - Dismissible Dynamic Panels
**Learning:** Dismissible dynamic UI panels (e.g., Knowledge Universe detail view) often rely on generic close icons without an accessible label or visible focus state, making it difficult for keyboard and screen reader users to dismiss them.
**Action:** Always ensure that close buttons in dynamic panels or modals have descriptive `aria-label`s and clear focus indicators (e.g., `focus-visible:ring-2`).
