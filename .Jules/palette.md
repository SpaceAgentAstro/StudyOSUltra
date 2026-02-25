# Palette's Journal

## 2026-02-08 - Icon-Only Button Pattern
**Learning:** The Chat Interface relied heavily on icon-only buttons (Send, Attach, Stop, Tools) without accessible labels, making the core functionality invisible to screen reader users.
**Action:** When designing toolbars or chat inputs, always enforce a "label or aria-label" rule for every interactive element during the initial review.

## 2026-02-08 - Toggle State Communication
**Learning:** Toggle buttons (Thinking Mode, Search, etc.) had `aria-label` but lacked state communication (`aria-pressed`), making it impossible for screen reader users to know if a feature was active.
**Action:** For any button that toggles a state, always include `aria-pressed={isActive}` to explicitly communicate the current status.
