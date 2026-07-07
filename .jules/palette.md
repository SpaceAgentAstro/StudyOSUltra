# Palette's Journal

## 2026-02-08 - Icon-Only Button Pattern
**Learning:** The Chat Interface relied heavily on icon-only buttons (Send, Attach, Stop, Tools) without accessible labels, making the core functionality invisible to screen reader users.
**Action:** When designing toolbars or chat inputs, always enforce a "label or aria-label" rule for every interactive element during the initial review.
## 2024-07-07 - Convert Interactive Dashboard Cards to Semantic Buttons
**Learning:** Interactive blocks created with `<div>` lack built-in keyboard accessibility and are not recognized as interactive controls by screen readers. When converting a large interactive block to a `<button>`, applying utility classes like `w-full text-left` helps neutralize browser defaults while adding `focus-visible` styles ensures a clear keyboard focus state. Crucially, nested interactive elements (like a visually styled button inside the block) must be converted to non-interactive elements (like a `<div>`) to prevent invalid HTML (nested `<button>` elements).
**Action:** When creating large interactive cards, always use semantic `<button>` elements as the primary wrapper, neutralize their default styling with utilities, ensure they have a `focus-visible` state, and never nest other buttons inside them. Update associated test queries to target the new `.closest('button')`.
