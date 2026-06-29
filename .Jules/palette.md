# Palette's Journal

## 2026-02-08 - Icon-Only Button Pattern
**Learning:** The Chat Interface relied heavily on icon-only buttons (Send, Attach, Stop, Tools) without accessible labels, making the core functionality invisible to screen reader users.
**Action:** When designing toolbars or chat inputs, always enforce a "label or aria-label" rule for every interactive element during the initial review.

## 2026-03-01 - Interactive Div Pattern
**Learning:** Interactive blocks were built as clickable `<div>` wrappers. When converting to `<button>` for keyboard accessibility, default button styling will break the layout unless CSS utility classes like `w-full text-left` are added. Also, nested buttons inside these blocks must be converted to `<div>` to avoid invalid HTML. Tests using `screen.getByText` must also be updated to `.closest('button')!` to trigger events on the actual button element instead of child nodes.
**Action:** Always check interactive cards/blocks for semantic `<button>` wrappers and ensure `w-full text-left` is applied to preserve layout, and convert any fake inner buttons to divs.
