# Palette's Journal

## 2026-02-08 - Icon-Only Button Pattern
**Learning:** The Chat Interface relied heavily on icon-only buttons (Send, Attach, Stop, Tools) without accessible labels, making the core functionality invisible to screen reader users.
**Action:** When designing toolbars or chat inputs, always enforce a "label or aria-label" rule for every interactive element during the initial review.

## 2024-06-03 - Refactoring Interactive Divs to Buttons
**Learning:** Interactive wrappers like cards or list items built with `div` and `onClick` handlers must be refactored into semantic `<button>` elements to ensure proper keyboard accessibility and focus management. When doing so, nested interactive elements must be converted to non-interactive tags (e.g., `span`) to avoid violating HTML specifications.
**Action:** When creating or reviewing interactive container components, always enforce the use of semantic `<button>` elements at the root and verify that child elements do not contain nested buttons or links.
