# Palette's Journal

## 2026-02-08 - Icon-Only Button Pattern
**Learning:** The Chat Interface relied heavily on icon-only buttons (Send, Attach, Stop, Tools) without accessible labels, making the core functionality invisible to screen reader users.
**Action:** When designing toolbars or chat inputs, always enforce a "label or aria-label" rule for every interactive element during the initial review.
## 2026-05-19 - Interactive Div Refactor
**Learning:** The Dashboard used interactive `div` elements for its cards which are not accessible by keyboard or screen readers. Also, nested buttons are invalid HTML.
**Action:** Always refactor interactive `div`s to semantic `<button>` tags and convert inner interactive elements to `<span>` to maintain visual style while ensuring a11y compliance and valid HTML.
