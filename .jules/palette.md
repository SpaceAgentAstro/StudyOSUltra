# Palette's Journal

## 2026-02-08 - Icon-Only Button Pattern
**Learning:** The Chat Interface relied heavily on icon-only buttons (Send, Attach, Stop, Tools) without accessible labels, making the core functionality invisible to screen reader users.
**Action:** When designing toolbars or chat inputs, always enforce a "label or aria-label" rule for every interactive element during the initial review.

## 2023-10-27 - Detail Modal Accessibility Pattern
**Learning:** Detailed inspector modals (like in KnowledgeUniverse) often use icon-only close buttons lacking ARIA labels or keyboard focus styling. Since these panels appear asynchronously or dynamically based on user interaction, poor focus visibility combined with the lack of screen reader text breaks accessibility flows for critical information.
**Action:** Always add an `aria-label` and `focus-visible` classes to any interactive icon element inside a modal or HUD panel that closes or toggles visibility.
