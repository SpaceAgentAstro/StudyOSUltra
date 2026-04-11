# Palette's Journal

## 2026-02-08 - Icon-Only Button Pattern
**Learning:** The Chat Interface relied heavily on icon-only buttons (Send, Attach, Stop, Tools) without accessible labels, making the core functionality invisible to screen reader users.
**Action:** When designing toolbars or chat inputs, always enforce a "label or aria-label" rule for every interactive element during the initial review.
## 2026-04-11 - Knowledge Universe Detail Panel Accessibility
**Learning:** Dismissible dynamic UI panels (e.g., detail views in Knowledge Universe) containing icon-only close buttons often lack explicit descriptive ARIA labels, making screen reader navigation difficult when inspecting complex visualizations.
**Action:** When designing or refactoring dynamic detail panels or modals, ensure close buttons have descriptive `aria-label` attributes and explicit focus indicators (e.g., `focus-visible:ring-2`) to support both screen readers and keyboard users.
