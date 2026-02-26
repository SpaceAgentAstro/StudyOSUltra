# Palette's Journal

## 2026-02-08 - Icon-Only Button Pattern
**Learning:** The Chat Interface relied heavily on icon-only buttons (Send, Attach, Stop, Tools) without accessible labels, making the core functionality invisible to screen reader users.
**Action:** When designing toolbars or chat inputs, always enforce a "label or aria-label" rule for every interactive element during the initial review.

## 2026-02-08 - Toggle Button State
**Learning:** Icon-only toggle buttons (like Thinking Mode) had labels but no programmatic state indication, leaving screen reader users guessing if they were active.
**Action:** Use `aria-pressed={isActive}` on all toggle buttons to explicitly communicate state.
