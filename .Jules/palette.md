# Palette's Journal

## 2026-02-08 - Icon-Only Button Pattern
**Learning:** The Chat Interface relied heavily on icon-only buttons (Send, Attach, Stop, Tools) without accessible labels, making the core functionality invisible to screen reader users.
**Action:** When designing toolbars or chat inputs, always enforce a "label or aria-label" rule for every interactive element during the initial review.

## 2026-02-09 - Toggle Button State
**Learning:** Toggle buttons (Thinking Mode, Search, etc.) often rely on color alone to indicate state, leaving screen reader users in the dark about whether a feature is active.
**Action:** Always include `aria-pressed={isActive}` on toggle buttons to programmatically communicate state changes.
