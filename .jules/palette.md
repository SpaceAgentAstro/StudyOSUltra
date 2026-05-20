# Palette's Journal

## 2026-02-08 - Icon-Only Button Pattern
**Learning:** The Chat Interface relied heavily on icon-only buttons (Send, Attach, Stop, Tools) without accessible labels, making the core functionality invisible to screen reader users.
**Action:** When designing toolbars or chat inputs, always enforce a "label or aria-label" rule for every interactive element during the initial review.
## 2026-05-20 - Semantic Button Wrappers
**Learning:** In React components like Dashboard cards, interactive wrappers using `div` elements with `onClick` lack keyboard accessibility and screen reader support. However, converting them directly to `<button>` elements can lead to invalid HTML if there are nested `<button>` elements inside them.
**Action:** Always convert interactive wrapper `div`s to semantic `<button>` elements for keyboard/a11y support, and simultaneously convert any nested interactive elements (like inner `<button>`s) to visual equivalents (e.g., `<div>` or `<span>`) to avoid nested button HTML violations.
