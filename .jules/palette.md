# Palette's Journal

## 2026-02-08 - Icon-Only Button Pattern
**Learning:** The Chat Interface relied heavily on icon-only buttons (Send, Attach, Stop, Tools) without accessible labels, making the core functionality invisible to screen reader users.
**Action:** When designing toolbars or chat inputs, always enforce a "label or aria-label" rule for every interactive element during the initial review.
## 2026-05-16 - Use Semantic Buttons for Card Navigation
**Learning:** Interactive cards built with `div` and `onClick` handlers completely break keyboard navigation (Tab/Enter) and screen reader support, even if they look clickable.
**Action:** Always replace interactive `div` wrappers with semantic `<button className="w-full text-left">`, adding focus-visible styles, and ensure there are no nested buttons inside them to maintain valid HTML.
