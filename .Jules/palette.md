# Palette's Journal

## 2026-02-08 - Icon-Only Button Pattern
**Learning:** The Chat Interface relied heavily on icon-only buttons (Send, Attach, Stop, Tools) without accessible labels, making the core functionality invisible to screen reader users.
**Action:** When designing toolbars or chat inputs, always enforce a "label or aria-label" rule for every interactive element during the initial review.

## 2026-02-14 - Explicit Form Labels & Required Indicators
**Learning:** Forms in `components/Onboarding.tsx` missed `htmlFor` attributes on labels and visually didn't mark required fields (like "Name", which blocked the Next button if empty). This creates confusion for both sighted and screen reader users about what is required and disrupts keyboard navigation to inputs.
**Action:** Always add explicit `htmlFor` and `id` pairings to label and input elements. If a form step blocks progress based on empty fields, explicitly mark those fields with `*` and use `required` and `aria-required="true"`.
