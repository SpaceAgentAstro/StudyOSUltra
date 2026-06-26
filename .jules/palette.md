# Palette's Journal

## 2026-02-08 - Icon-Only Button Pattern
**Learning:** The Chat Interface relied heavily on icon-only buttons (Send, Attach, Stop, Tools) without accessible labels, making the core functionality invisible to screen reader users.
**Action:** When designing toolbars or chat inputs, always enforce a "label or aria-label" rule for every interactive element during the initial review.
## 2024-06-26 - Interactive Elements and Semantic Buttons
**Learning:** When converting interactive `<div>` blocks into semantic `<button>` elements for accessibility, default browser button styles can break the layout by centering text and shrinking width. Avoid invalid HTML by removing nested buttons inside the main button block.
**Action:** Always apply `w-full text-left` classes to neutralize default browser styling, use `focus-visible` for keyboard navigation, and convert nested interactive elements (like smaller buttons) to non-interactive semantics (e.g., `<div>`) if they reside inside the main `<button>`.
