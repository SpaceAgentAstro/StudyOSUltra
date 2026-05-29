# Palette's Journal

## 2026-02-08 - Icon-Only Button Pattern
**Learning:** The Chat Interface relied heavily on icon-only buttons (Send, Attach, Stop, Tools) without accessible labels, making the core functionality invisible to screen reader users.
**Action:** When designing toolbars or chat inputs, always enforce a "label or aria-label" rule for every interactive element during the initial review.

## 2026-02-08 - Interactive Divs vs Semantic Buttons
**Learning:** Interactive wrappers like cards often use 'div' with 'onClick', completely hiding them from keyboard and screen reader users.
**Action:** Always convert interactive 'div' containers to '<button>' or add 'role="button"' and keyboard event listeners to ensure accessibility standards.
