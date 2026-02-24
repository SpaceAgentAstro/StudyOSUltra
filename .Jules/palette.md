# Palette's Journal

## 2026-02-08 - Icon-Only Button Pattern
**Learning:** The Chat Interface relied heavily on icon-only buttons (Send, Attach, Stop, Tools) without accessible labels, making the core functionality invisible to screen reader users.
**Action:** When designing toolbars or chat inputs, always enforce a "label or aria-label" rule for every interactive element during the initial review.

## 2026-02-14 - Duplicate Component Instances
**Learning:** The Chat Interface was being rendered twice in the DOM (one hidden, one visible?), causing screen readers to announce duplicate controls and confusing keyboard navigation.
**Action:** Verify component hierarchy for unintentional double-rendering, especially when conditional rendering logic is complex or spread across multiple locations.
