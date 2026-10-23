# Grafana Pull Request Proposal: Fix Slider Accessible Naming, Companion Input Labeling, and Alert Rule Focus Management

**Target Repository:** `grafana/grafana`  
**Packages Affected:** `@grafana/ui` (`packages/grafana-ui/src/components/Slider/`), `grafana-app` (`public/app/features/alerting/`)  
**Type:** Accessibility Bugfix / WCAG 2.2 AA Compliance  
**Issue Category:** Operable / Understandable / Robust  

---

## Summary of Changes

1. **Slider Accessible Naming (WCAG 4.1.2)**:
   Previously, `Slider.tsx` defaulted the handle's accessible name to `"Use arrow keys to change the value"`. This PR changes the default name to identify the property (e.g. `"Slider"` or passed `ariaLabel`), moves the keystroke instructions to `aria-describedby`, and adds unit-aware `aria-valuetext`.
2. **Companion Input Accessible Name (WCAG 1.3.1, 3.3.2)**:
   Adds an explicit `aria-label` to the companion numeric text input (`"{label} numeric input"`), resolving automated Axe violations.
3. **Deterministic Focus Retention on Condition Deletion (WCAG 2.4.3)**:
   In the alert rule condition editor, deleting a condition row previously caused focus to drop to `document.body`. This PR implements a focus retention hook that automatically transfers focus to the subsequent condition row (or the "Add condition" button) and announces the deletion via `aria-live="polite"`.
4. **Accessible Inline Validation (WCAG 3.3.1)**:
   Connects invalid threshold inputs with `aria-invalid="true"` and `aria-errormessage="threshold-error"`.

---

## Code Diff Preview

```diff
diff --git a/packages/grafana-ui/src/components/Slider/Slider.tsx b/packages/grafana-ui/src/components/Slider/Slider.tsx
index 38b15d2..e3c9071 100644
--- a/packages/grafana-ui/src/components/Slider/Slider.tsx
+++ b/packages/grafana-ui/src/components/Slider/Slider.tsx
@@ -110,8 +110,7 @@ export const Slider = ({
-  const dragHandleAriaLabel =
-    ariaLabelForHandle ?? t('grafana-ui.slider.drag-handle-aria-label', 'Use arrow keys to change the value');
+  const dragHandleAriaLabel = ariaLabelForHandle ?? 'Threshold slider';
 
@@ -183,6 +182,7 @@ export const Slider = ({
           <Input
             type="text"
             width={7.5}
+            aria-label={`${dragHandleAriaLabel} numeric value`}
             className={cx(styles.sliderInputField, ...sliderInputFieldClassNames)}
             value={inputValue}
             onChange={onTextInputChange}
```

---

## Verification & Testing Instructions

1. Navigate to the Alert Rule Editor.
2. Focus the threshold slider. Verify screen reader announces: `"Threshold slider, 85, slider. Minimum 0, maximum 100."`
3. Press `Tab` to the companion numeric input. Verify screen reader announces: `"Threshold slider numeric value, edit text, 85"`.
4. Delete "Condition B" using keyboard. Confirm focus moves directly to "Condition C" without jumping to the top of the webpage.
5. Verify live screen reader announcement: `"Condition B removed. 2 conditions remaining in rule."`
