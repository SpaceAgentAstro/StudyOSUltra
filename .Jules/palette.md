# Palette's Journal

## 2026-02-08 - Icon-Only Button Pattern
**Learning:** The Chat Interface relied heavily on icon-only buttons (Send, Attach, Stop, Tools) without accessible labels, making the core functionality invisible to screen reader users.
**Action:** When designing toolbars or chat inputs, always enforce a "label or aria-label" rule for every interactive element during the initial review.

## 2026-02-08 - Async Generation Input Pattern
**Learning:** In highly interactive components with AI generation delays (like Lesson Studio), leaving main text inputs unlabelled and active during processing creates screen reader ambiguity and allows invalid "mid-flight" edits that desynchronize state.
**Action:** Always pair dynamic text inputs with an explicit (or `sr-only`) `<label>` linked by `id`, and enforce a `disabled={isLoading}` state with `disabled:opacity-50 disabled:cursor-not-allowed` tailwind classes.
