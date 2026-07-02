# Palette's Journal

## 2026-02-08 - Icon-Only Button Pattern
**Learning:** The Chat Interface relied heavily on icon-only buttons (Send, Attach, Stop, Tools) without accessible labels, making the core functionality invisible to screen reader users.
**Action:** When designing toolbars or chat inputs, always enforce a "label or aria-label" rule for every interactive element during the initial review.

## 2024-05-24 - Interactive wrappers converted to buttons
**Learning:** Converting interactive block-level `<div>` elements into semantic `<button>` elements improves keyboard navigation and screen reader accessibility. It's crucial to apply utility classes like `w-full text-left` to neutralize default browser styles and prevent layout breakage. It is also important to convert any nested `<button>` tags to non-interactive elements like `<span>` to prevent invalid HTML. Testing library tests should be updated to target the `.closest('button')!` element.
**Action:** Whenever converting `<div>` to `<button>`, double check for nested interactive elements and neutral styling classes. Also, update tests as necessary.
