# Palette's Journal

## 2026-02-08 - Icon-Only Button Pattern
**Learning:** The Chat Interface relied heavily on icon-only buttons (Send, Attach, Stop, Tools) without accessible labels, making the core functionality invisible to screen reader users.
**Action:** When designing toolbars or chat inputs, always enforce a "label or aria-label" rule for every interactive element during the initial review.

## 2026-02-08 - Semantic Interactive Elements
**Learning:** Interactive block-level `<div>` elements used as cards/tiles fail to provide keyboard accessibility (focus states, tab order) and screen reader semantics.
**Action:** Always convert interactive wrapper `<div>`s into `<button>` elements, applying utility classes like `w-full text-left focus-visible:ring-2 focus-visible:outline-none` to neutralize default browser styling and prevent layout breakage.
