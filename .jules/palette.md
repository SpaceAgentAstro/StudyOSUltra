# Palette's Journal

## 2026-02-08 - Icon-Only Button Pattern
**Learning:** The Chat Interface relied heavily on icon-only buttons (Send, Attach, Stop, Tools) without accessible labels, making the core functionality invisible to screen reader users.
**Action:** When designing toolbars or chat inputs, always enforce a "label or aria-label" rule for every interactive element during the initial review.

## 2024-05-22 - [Keyboard Accessible Cards]
**Learning:** Using `div`s with `onClick` for interactive cards breaks keyboard accessibility because they can't be focused with the Tab key and don't trigger on Enter/Space.
**Action:** Always use `<button>` elements (or `a` if navigating) with `text-left` and `w-full` for interactive card components to ensure proper keyboard navigation and screen reader support. Added focus rings (`focus:ring-2`, `focus:outline-none`) for visible focus state.
