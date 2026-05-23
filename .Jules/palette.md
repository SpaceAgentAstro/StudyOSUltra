# Palette's Journal

## 2026-02-08 - Icon-Only Button Pattern
**Learning:** The Chat Interface relied heavily on icon-only buttons (Send, Attach, Stop, Tools) without accessible labels, making the core functionality invisible to screen reader users.
**Action:** When designing toolbars or chat inputs, always enforce a "label or aria-label" rule for every interactive element during the initial review.

## 2026-05-23 - Interactive Card Accessibility
**Learning:** Using 'div' with 'onClick' for cards prevents keyboard accessibility. Converting them to 'button' elements is required, but beware of nested buttons which violate HTML specs. Inner buttons must be styled as non-interactive spans or divs.
**Action:** Always convert interactive card wrappers to semantic 'button' elements with 'text-left w-full' and appropriate 'focus-visible' outline classes. Convert any nested inner buttons into visually equivalent spans.
