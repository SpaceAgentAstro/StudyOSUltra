# Palette's Journal

## 2026-02-08 - Icon-Only Button Pattern
**Learning:** The Chat Interface relied heavily on icon-only buttons (Send, Attach, Stop, Tools) without accessible labels, making the core functionality invisible to screen reader users.
**Action:** When designing toolbars or chat inputs, always enforce a "label or aria-label" rule for every interactive element during the initial review.

## 2024-05-19 - Added ARIA label to KnowledgeUniverse close button
**Learning:** Found an icon-only button (a 45-degree rotated Compass icon) being used as a close button without an accessible name.
**Action:** Always verify icon-only buttons used for dismissive actions have an `aria-label` to clearly indicate their purpose to screen reader users.
