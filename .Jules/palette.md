# Palette's Journal

## 2026-02-08 - Icon-Only Button Pattern
**Learning:** The Chat Interface relied heavily on icon-only buttons (Send, Attach, Stop, Tools) without accessible labels, making the core functionality invisible to screen reader users.
**Action:** When designing toolbars or chat inputs, always enforce a "label or aria-label" rule for every interactive element during the initial review.

## 2026-02-08 - Async Form Input Desynchronization
**Learning:** Text inputs tied to long-running async AI operations (like generation in LessonStudio) were left enabled during processing, allowing users to type and causing UI state desynchronization.
**Action:** Always link form inputs explicitly via `id` and `<label>` (using `.sr-only` if needed), and implement a `disabled={isLoading}` state with `disabled:opacity-50` and `disabled:cursor-not-allowed` to prevent interaction during processing.
