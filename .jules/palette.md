# Palette's Journal

## 2026-02-08 - Icon-Only Button Pattern
**Learning:** The Chat Interface relied heavily on icon-only buttons (Send, Attach, Stop, Tools) without accessible labels, making the core functionality invisible to screen reader users.
**Action:** When designing toolbars or chat inputs, always enforce a "label or aria-label" rule for every interactive element during the initial review.
## 2024-05-20 - Semantic Interactive Cards
**Learning:** Converting interactive <div> wrappers into semantic <button> elements requires neutralizing default button styling using utility classes (like `w-full text-left`) and properly handling nested interactive elements (converting inner `<button>` to `<span>`) to avoid invalid HTML.
**Action:** Always use `<button>` instead of `<div onClick>` for interactive cards, add `focus-visible` classes, ensure layout isn't broken by adding text alignment classes, and avoid nested buttons.
