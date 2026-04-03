# Palette's Journal

## 2026-02-08 - Icon-Only Button Pattern
**Learning:** The Chat Interface relied heavily on icon-only buttons (Send, Attach, Stop, Tools) without accessible labels, making the core functionality invisible to screen reader users.
**Action:** When designing toolbars or chat inputs, always enforce a "label or aria-label" rule for every interactive element during the initial review.

## 2024-05-19 - Async Form Input Accessibility & UX
**Learning:** During AI generation (e.g. `LessonStudio.tsx`), leaving text inputs active without a `disabled` state allows the user to continue typing, causing visual desync between the input value and the generated results. Additionally, simple input placeholders are not a substitute for `aria-label` or `<label>` elements for screen reader navigation.
**Action:** When a component features asynchronous operations tied to a specific form input, ensure the input is linked via `id` and `<label>` (can be `.sr-only`) and always implement a `disabled={isLoading}` state with appropriate visual styles (`disabled:opacity-50`, `disabled:cursor-not-allowed`) to prevent desyncs.
