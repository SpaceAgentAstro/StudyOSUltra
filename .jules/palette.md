# Palette's Journal

## 2026-02-08 - Icon-Only Button Pattern
**Learning:** The Chat Interface relied heavily on icon-only buttons (Send, Attach, Stop, Tools) without accessible labels, making the core functionality invisible to screen reader users.
**Action:** When designing toolbars or chat inputs, always enforce a "label or aria-label" rule for every interactive element during the initial review.
## 2024-05-24 - Convert interactive dashboard cards to semantic buttons
**Learning:** Interactive div wrappers with `onClick` handlers fail keyboard accessibility because they are not focusable and cannot be triggered via Enter/Space. Changing them to semantic `<button>` elements requires neutralizing default button styles (using `w-full text-left`) and ensuring any nested interactive elements (like another `<button>`) are converted to non-interactive elements (like `<span>`) to avoid invalid HTML.
**Action:** Use `<button className="w-full text-left focus-visible:ring-2 focus-visible:outline-none ...">` for interactive cards and update associated tests to trigger events using `.closest('button')!` when targeting inner text.
