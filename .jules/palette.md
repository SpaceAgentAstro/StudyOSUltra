# Palette's Journal

## 2026-02-08 - Icon-Only Button Pattern
**Learning:** The Chat Interface relied heavily on icon-only buttons (Send, Attach, Stop, Tools) without accessible labels, making the core functionality invisible to screen reader users.
**Action:** When designing toolbars or chat inputs, always enforce a "label or aria-label" rule for every interactive element during the initial review.

## 2026-02-09 - Confirmation Dialog Pattern
**Learning:** The FileUploader component allowed immediate deletion of processed files without confirmation. Users can accidentally lose indexed data.
**Action:** When designing destructive actions for processed or critical data, always enforce a confirmation dialog (e.g., `window.confirm`) and provide clear visual/keyboard focus feedback on the trigger button.
