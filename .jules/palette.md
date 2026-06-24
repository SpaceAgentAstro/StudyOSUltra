# Palette's Journal

## 2026-02-08 - Icon-Only Button Pattern
**Learning:** The Chat Interface relied heavily on icon-only buttons (Send, Attach, Stop, Tools) without accessible labels, making the core functionality invisible to screen reader users.
**Action:** When designing toolbars or chat inputs, always enforce a "label or aria-label" rule for every interactive element during the initial review.

## 2025-03-08 - Semantic Buttons for Interactive Cards
**Learning:** Using `div` with `onClick` for interactive cards like the Dashboard actions breaks keyboard accessibility because they lack focus states and key events (Enter/Space).
**Action:** Always use semantic `<button>` elements with `w-full text-left` classes for interactive card components to ensure screen readers and keyboard navigation function correctly without layout breakage.
