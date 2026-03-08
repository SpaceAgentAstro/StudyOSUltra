# Palette's Journal

## 2026-02-08 - Icon-Only Button Pattern
**Learning:** The Chat Interface relied heavily on icon-only buttons (Send, Attach, Stop, Tools) without accessible labels, making the core functionality invisible to screen reader users.
**Action:** When designing toolbars or chat inputs, always enforce a "label or aria-label" rule for every interactive element during the initial review.

## 2026-03-08 - Dynamic Panel Accessibility
**Learning:** Dismissible dynamic UI panels (like the Knowledge Universe detail view) often use icon-only close buttons lacking screen-reader accessible labels, causing frustration as users get trapped in views.
**Action:** When implementing new sliding or modal panels, verify that the exit interactions (`<button onClick={close}>`) include descriptive `aria-label` attributes (e.g. `aria-label="Close details"`).
