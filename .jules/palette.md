# Palette's Journal

## 2026-02-08 - Icon-Only Button Pattern
**Learning:** The Chat Interface relied heavily on icon-only buttons (Send, Attach, Stop, Tools) without accessible labels, making the core functionality invisible to screen reader users.
**Action:** When designing toolbars or chat inputs, always enforce a "label or aria-label" rule for every interactive element during the initial review.
## 2026-02-08 - Accessible Interactive Cards
**Learning:** The Dashboard used standard `<div>` elements with `onClick` handlers for interactive cards (Knowledge Universe, Recommended Actions), which are completely inaccessible to keyboard and screen reader users. Furthermore, it contained a nested button within an interactive block element.
**Action:** When creating large interactive clickable areas (cards), convert the wrapper `<div>` to a semantic `<button>` to ensure it is naturally focusable and triggered by keyboard events (Enter/Space). Apply utility classes like `w-full text-left` to neutralize default button styling, and ensure any internal visual buttons are converted to `<span>` or `<div>` to prevent invalid HTML (nested buttons).
