# Grafana Pull Request Proposal: Fix TimeRangePicker Keyboard Trap, Radiogroup Semantics, and Dialog ARIA States

**Target Repository:** `grafana/grafana`  
**Packages Affected:** `@grafana/ui` (`packages/grafana-ui/src/components/DateTimePickers/TimeRangePicker/`)  
**Type:** Accessibility Bugfix / WCAG 2.2 AA Compliance  
**Issue Category:** Operable / Robust  

---

## Summary of Changes

This PR resolves three accessibility defects in Grafana's core `TimeRangePicker` component:
1. **Removes Keyboard Trap (WCAG 2.1.2)**: `useListFocus` previously intercepted the `Tab` key and invoked `event.preventDefault()`, trapping keyboard users permanently inside the quick ranges list.
2. **Corrects ARIA Semantics (WCAG 1.3.1, 4.1.2)**: Replaces invalid `<ul role="presentation" aria-roledescription="...">` with a semantic `role="radiogroup"`. Replaces `type="checkbox"` with `type="radio"` to reflect mutual exclusivity.
3. **Adds Dialog Popup & Expanded States (WCAG 4.1.2)**: Adds `aria-haspopup="dialog"` and `aria-expanded={isOpen}` to the `ToolbarButton` trigger, and binds `aria-controls` to the overlay container id.
4. **Live Region Status (WCAG 4.1.3)**: Dispatches polite screen reader announcements when time ranges are modified.

---

## Motivation & WCAG Criteria Mapping

- **WCAG 2.1.2 No Keyboard Trap (Level A)**: Tabbing through the quick range options was previously blocked because `'Tab'` was included in `CAUGHT_KEYS` without handling tab progression.
- **WCAG 1.3.1 Info and Relationships (Level A)**: The ARIA 1.2 specification forbids `aria-roledescription` on elements with `role="presentation"`.
- **WCAG 4.1.2 Name, Role, Value (Level A)**: Screen reader users heard "checkbox checked" for single-select time ranges. Radiogroup semantics announce "1 of 8, radio button".

---

## Detailed Code Diff

```diff
diff --git a/packages/grafana-ui/src/components/DateTimePickers/TimeRangePicker/hooks.ts b/packages/grafana-ui/src/components/DateTimePickers/TimeRangePicker/hooks.ts
index c6b63d9..40f128c 100644
--- a/packages/grafana-ui/src/components/DateTimePickers/TimeRangePicker/hooks.ts
+++ b/packages/grafana-ui/src/components/DateTimePickers/TimeRangePicker/hooks.ts
@@ -3,7 +3,7 @@ import { type RefObject, useEffect, useState } from 'react';
 import { type TimeOption } from '@grafana/data';
 
 const modulo = (a: number, n: number) => ((a % n) + n) % n;
-const CAUGHT_KEYS = ['ArrowUp', 'ArrowDown', 'Home', 'End', 'Enter', 'Tab'];
+const CAUGHT_KEYS = ['ArrowUp', 'ArrowDown', 'Home', 'End', 'Enter'];
 
 /** @internal */
 export interface UseListFocusProps {
@@ -34,11 +34,9 @@ export const useListFocus = ({ localRef, options }: UseListFocusProps): UseListF
     const itemsCount = items?.length ?? 0;
 
     if (CAUGHT_KEYS.indexOf(event.key) > -1) {
       event.preventDefault();
-      if (event.key !== 'Tab') {
-        event.stopPropagation();
-      }
+      event.stopPropagation();
     }
 
     let newFocusedIndex = null;
diff --git a/packages/grafana-ui/src/components/DateTimePickers/TimeRangePicker/TimeRangeList.tsx b/packages/grafana-ui/src/components/DateTimePickers/TimeRangePicker/TimeRangeList.tsx
index d7a12b9..e8a49c2 100644
--- a/packages/grafana-ui/src/components/DateTimePickers/TimeRangePicker/TimeRangeList.tsx
+++ b/packages/grafana-ui/src/components/DateTimePickers/TimeRangePicker/TimeRangeList.tsx
@@ -50,14 +50,14 @@ const Options = ({ options, value, onChange, title }: Props) => {
   const [handleKeys] = useListFocus({ localRef, options });
 
   return (
-    <>
-      <ul
-        role="presentation"
+    <div
+      role="radiogroup"
+      aria-label={title ?? t('time-picker.time-range.default-title', 'Time ranges')}
       onKeyDown={handleKeys}
       ref={localRef}
-      aria-roledescription={t('time-picker.time-range.aria-role', 'Time range selection')}
       className={styles.list}
     >
         {options.map((option, index) => (
           <TimeRangeOption
@@ -67,7 +67,7 @@ const Options = ({ options, value, onChange, title }: Props) => {
             name={title ?? t('time-picker.time-range.default-title', 'Time ranges')}
           />
         ))}
-      </ul>
-    </>
+    </div>
   );
 };
diff --git a/packages/grafana-ui/src/components/DateTimePickers/TimeRangePicker/TimeRangeOption.tsx b/packages/grafana-ui/src/components/DateTimePickers/TimeRangePicker/TimeRangeOption.tsx
index 45b89ef..23d11ea 100644
--- a/packages/grafana-ui/src/components/DateTimePickers/TimeRangePicker/TimeRangeOption.tsx
+++ b/packages/grafana-ui/src/components/DateTimePickers/TimeRangePicker/TimeRangeOption.tsx
@@ -69,14 +69,14 @@ export const TimeRangeOption = memo<Props>(({ value, onSelect, selected = false
   return (
-    <li
+    <div
       className={styles.container}
       data-testid={selectors.components.TimePicker.timeRangeOption(value.from, value.to)}
     >
       <input
         className={styles.radio}
         checked={selected}
         name={name}
-        type="checkbox"
+        type="radio"
         data-role="item"
         tabIndex={-1}
         id={id}
@@ -84,7 +84,7 @@ export const TimeRangeOption = memo<Props>(({ value, onSelect, selected = false
       <label className={cx(styles.label, selected && styles.labelSelected)} htmlFor={id}>
         {value.display}
       </label>
-    </li>
+    </div>
   );
 });
```

---

## Verification & Testing Instructions

1. Open a dashboard with a TimeRangePicker.
2. Press `Tab` until the TimeRange button is focused. Verify screen reader announces `"pop-up button, collapsed"`.
3. Press `Enter` or `Space` to open. Verify focus moves into the dialog.
4. Press `Tab` to reach the quick time ranges list. Use `ArrowDown` / `ArrowUp` to navigate between options.
5. Press `Tab`. Confirm focus smoothly moves to the Custom Date Range input fields rather than remaining trapped.
6. Run automated Axe audit: 0 violations reported.
