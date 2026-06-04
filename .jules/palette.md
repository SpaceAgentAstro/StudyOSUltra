# Palette's Journal

## 2026-02-08 - Icon-Only Button Pattern
**Learning:** The Chat Interface relied heavily on icon-only buttons (Send, Attach, Stop, Tools) without accessible labels, making the core functionality invisible to screen reader users.
**Action:** When designing toolbars or chat inputs, always enforce a "label or aria-label" rule for every interactive element during the initial review.

## 2023-10-27 - Dashboard Interactive Cards
**Learning:** Replaced interactive `div` cards with semantic `button` elements in `components/Dashboard.tsx` to improve keyboard accessibility and screen reader support. Also changed a nested button to a `div` to comply with HTML specification that prohibits nested interactive elements.
**Action:** When creating clickable cards or list items, always use semantic `<button>` or `<a>` elements instead of `div`s with `onClick` handlers. Ensure that any interactive elements are not nested within other interactive elements.
