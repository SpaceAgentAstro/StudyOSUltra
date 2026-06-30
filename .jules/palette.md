# Palette's Journal

## 2026-02-08 - Icon-Only Button Pattern
**Learning:** The Chat Interface relied heavily on icon-only buttons (Send, Attach, Stop, Tools) without accessible labels, making the core functionality invisible to screen reader users.
**Action:** When designing toolbars or chat inputs, always enforce a "label or aria-label" rule for every interactive element during the initial review.
## 2024-05-30 - Convert Interactive Divs to Buttons
**Learning:** Found multiple interactive block-level `<div>` elements used as cards in the Dashboard that trigger navigation. This is inaccessible for keyboard and screen reader users. Additionally, there was an invalid nested `<button>` inside one of these interactive `<div>` elements.
**Action:** Always convert interactive `<div>` elements that act like buttons into semantic `<button>` elements, applying utility classes like `w-full text-left` to reset default button styling, and avoid nested interactive elements.
