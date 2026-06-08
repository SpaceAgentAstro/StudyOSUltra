# Palette's Journal

## 2026-02-08 - Icon-Only Button Pattern
**Learning:** The Chat Interface relied heavily on icon-only buttons (Send, Attach, Stop, Tools) without accessible labels, making the core functionality invisible to screen reader users.
**Action:** When designing toolbars or chat inputs, always enforce a "label or aria-label" rule for every interactive element during the initial review.

## 2026-06-08 - Semantic HTML for Interactive Cards
**Learning:** Interactive cards modeled as `<div>`s with `onClick` handlers are completely inaccessible to keyboard and screen reader users.
**Action:** Convert clickable cards to native `<button>` elements, allowing screen readers to naturally parse child content without needing `aria-label` overrides.
