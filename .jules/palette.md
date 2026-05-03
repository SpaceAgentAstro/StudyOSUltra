# Palette's Journal

## 2026-02-08 - Icon-Only Button Pattern
**Learning:** The Chat Interface relied heavily on icon-only buttons (Send, Attach, Stop, Tools) without accessible labels, making the core functionality invisible to screen reader users.
**Action:** When designing toolbars or chat inputs, always enforce a "label or aria-label" rule for every interactive element during the initial review.
## 2026-05-03 - Modal Close Accessibility
**Learning:** Icon-only close buttons in detail panels often lack accessibility attributes like aria-label and focus indicators.
**Action:** Always add aria-label and focus-visible classes to interactive icon-only close buttons.
