# Palette's Journal

## 2026-02-08 - Icon-Only Button Pattern
**Learning:** The Chat Interface relied heavily on icon-only buttons (Send, Attach, Stop, Tools) without accessible labels, making the core functionality invisible to screen reader users.
**Action:** When designing toolbars or chat inputs, always enforce a "label or aria-label" rule for every interactive element during the initial review.

## 2026-02-09 - Accessible Modal Patterns
**Learning:** The Detail Panel (modal) in the `KnowledgeUniverse` component used an icon-only `Compass` close button without an `aria-label` or `focus-visible` styling. Without these, screen reader users lacked context, and keyboard users lacked visual feedback, breaking navigation within the modal.
**Action:** Always verify that interactive icon-only close buttons in modals/HUDs include an `aria-label` and explicit `focus-visible` utility classes.
