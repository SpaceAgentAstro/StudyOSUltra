# Palette's Journal

## 2026-02-08 - Icon-Only Button Pattern
**Learning:** The Chat Interface relied heavily on icon-only buttons (Send, Attach, Stop, Tools) without accessible labels, making the core functionality invisible to screen reader users.
**Action:** When designing toolbars or chat inputs, always enforce a "label or aria-label" rule for every interactive element during the initial review.
## 2026-02-09 - Interactive Card Accessibility
**Learning:** Interactive cards designed as `div`s with `onClick` handlers completely lack keyboard accessibility, excluding users who navigate via keyboard. Nested interactive elements (like a button inside a clickable card) also violate HTML specifications and create a confusing experience for screen readers.
**Action:** Convert interactive wrapper `div`s into semantic `<button>` elements with `text-left`, `w-full`, and `focus-visible` styles. Ensure any inner visually-styled buttons are replaced with non-interactive tags like `<div>` or `<span>`.
