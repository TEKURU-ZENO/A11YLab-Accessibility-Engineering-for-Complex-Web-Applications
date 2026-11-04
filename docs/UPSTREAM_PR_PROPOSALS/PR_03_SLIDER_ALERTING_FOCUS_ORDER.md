# Grafana Pull Request Proposal: Fix Slider Accessible Naming and Companion Input Labeling

**Target Repository:** `grafana/grafana`  
**Base Commit:** `b0f1023bd11dcdc5af37f33e7201d8931cc0df8c` (upstream `main`)  
**Status:** PR-ready authored patch (verified via `git apply --check`)  
**Packages Affected:** `@grafana/ui` (`packages/grafana-ui/src/components/Slider/`)  
**Type:** Accessibility Bugfix / WCAG 2.2 AA Compliance  
**Issue Category:** Operable / Understandable / Robust  
**Author:** Dev Mehta <devmehta060505@gmail.com>  

---

## Summary of Changes

1. **Slider Accessible Naming (WCAG 4.1.2)**:
   Previously, `Slider.tsx` defaulted the handle's accessible name to `"Use arrow keys to change the value"`. This PR changes the default name to identify the property (e.g. `"Slider"` or passed `ariaLabelForHandle`).
2. **Companion Input Accessible Name (WCAG 1.3.1, 3.3.2)**:
   Adds an explicit `aria-label` to the companion numeric text input (`"${dragHandleAriaLabel} numeric value"`), resolving automated Axe violations.

---

## Code Diff Preview

```diff
diff --git a/packages/grafana-ui/src/components/Slider/Slider.tsx b/packages/grafana-ui/src/components/Slider/Slider.tsx
index 3335fe4..067ad00 100644
--- a/packages/grafana-ui/src/components/Slider/Slider.tsx
+++ b/packages/grafana-ui/src/components/Slider/Slider.tsx
@@ -108,7 +108,7 @@ export const Slider = ({
   }, [externalValueChanged, value]);
 
   const dragHandleAriaLabel =
-    ariaLabelForHandle ?? t('grafana-ui.slider.drag-handle-aria-label', 'Use arrow keys to change the value');
+    ariaLabelForHandle ?? t('grafana-ui.slider.drag-handle-aria-label', 'Slider');
 
   const onSliderChange = useCallback(
     (v: number | number[]) => {
@@ -182,6 +182,7 @@ export const Slider = ({
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

1. Navigate to any view utilizing `@grafana/ui/Slider`.
2. Focus the slider handle. Verify screen reader announces element name and numeric percentage (e.g. `"Slider, 85%, adjustable"`).
3. Press `Tab` to the companion numeric input. Verify screen reader announces: `"Slider numeric value, edit text, 85"`.
4. Run `git apply --check patches/0003-fix-slider-accessible-naming-and-alert-focus.patch`: clean 0 error exit.
