# Palette's Journal

## 2026-02-08 - Icon-Only Button Pattern
**Learning:** The Chat Interface relied heavily on icon-only buttons (Send, Attach, Stop, Tools) without accessible labels, making the core functionality invisible to screen reader users.
**Action:** When designing toolbars or chat inputs, always enforce a "label or aria-label" rule for every interactive element during the initial review.

## 2026-02-09 - Interactive Wrapper Divs Pattern
**Learning:** Interactive <div> elements (like "Enter Universe" card) relying solely on onClick are inaccessible to screen reader and keyboard users.
**Action:** Convert clickable <div> wrappers to semantic <button> elements, adding w-full text-left to preserve layout structure without breaking the design.
