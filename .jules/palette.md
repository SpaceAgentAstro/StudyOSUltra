# Palette's Journal

## 2026-02-08 - Icon-Only Button Pattern
**Learning:** The Chat Interface relied heavily on icon-only buttons (Send, Attach, Stop, Tools) without accessible labels, making the core functionality invisible to screen reader users.
**Action:** When designing toolbars or chat inputs, always enforce a "label or aria-label" rule for every interactive element during the initial review.

## 2026-02-09 - Interactive Card Pattern
**Learning:** Interactive cards throughout the app (like in Dashboard and CognitiveLab) were implemented as clickable `<div>` wrappers instead of native `<button>` elements, breaking keyboard navigation and screen reader functionality.
**Action:** When creating or reviewing interactive card layouts, ensure the outer wrapper is a `<button type="button">` with `w-full text-left` classes to neutralize default button styling while preserving native accessibility features.
