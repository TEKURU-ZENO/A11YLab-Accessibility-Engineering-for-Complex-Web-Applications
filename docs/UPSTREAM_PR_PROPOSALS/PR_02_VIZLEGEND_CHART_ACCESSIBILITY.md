# Grafana Pull Request Proposal: Fix VizLegend Label-in-Name (WCAG 2.5.3) and Add Accessible Chart Data Table Alternative

**Target Repository:** `grafana/grafana`  
**Packages Affected:** `@grafana/ui` (`packages/grafana-ui/src/components/VizLegend/`, `packages/grafana-ui/src/components/PanelChrome/`)  
**Type:** Accessibility Feature & Bugfix / WCAG 2.2 AA Compliance  
**Issue Category:** Perceivable / Operable / Robust  

---

## Summary of Changes

1. **Fixes WCAG 2.5.3 (Label in Name)**:
   Previously, `VizLegendListItem.tsx` computed `aria-label="All series selected"` for every button when all items were visible. This hid the series name from speech control and screen readers. The updated implementation ensures the accessible name begins with the visible series label (`item.label`), uses `aria-pressed` for toggle state, and clearly indicates whether activating will isolate or toggle the series.
2. **Accessible Chart Data Table Alternative (WCAG 1.1.1, 1.3.1)**:
   Provides a keyboard-accessible toggle (`Shift + Alt + T` or accessible toolbar action) that renders an accessible HTML `<table>` representation of the canvas telemetry data points.
3. **Keyboard Crosshair Inspector**:
   Enables low-vision and keyboard-only engineers to inspect time series metrics point-by-point using `ArrowLeft` / `ArrowRight` with live announcements (`aria-live="polite"`).
4. **Enhanced Non-Text Contrast (WCAG 1.4.11)**:
   Adds distinct line dash arrays (`solid`, `dashed`, `dotted`) and high-contrast marker borders to distinguish series under monochrome and high-contrast environments.

---

## Code Diff Preview

```diff
diff --git a/packages/grafana-ui/src/components/VizLegend/VizLegendListItem.tsx b/packages/grafana-ui/src/components/VizLegend/VizLegendListItem.tsx
index 8e453aa..32e18d9 100644
--- a/packages/grafana-ui/src/components/VizLegend/VizLegendListItem.tsx
+++ b/packages/grafana-ui/src/components/VizLegend/VizLegendListItem.tsx
@@ -72,9 +72,11 @@ export const VizLegendListItem = <T = unknown,>({
   const getAriaLabel = () => {
-    if (allItemsSelected) {
-      return t('grafana-ui.viz-legend.all-series-selected', 'All series selected');
-    }
-    return t('grafana-ui.viz-legend.only-this-series-selected', 'Only {{label}} selected', { label: item.label });
+    const status = item.disabled ? 'hidden' : 'visible';
+    return `${item.label}, ${status}. Click to isolate, Shift-click to toggle.`;
   };
 
   return (
@@ -93,7 +95,8 @@ export const VizLegendListItem = <T = unknown,>({
         disabled={readonly}
         type="button"
         aria-label={getAriaLabel()}
+        aria-pressed={!item.disabled}
         onBlur={onMouseOut}
         onFocus={onMouseOver}
```

---

## Verification & Testing Instructions

1. Load a TimeSeries graph with 4 metric lines.
2. Verify screen reader (VoiceOver / NVDA) announces the actual series name on each legend item (e.g. `"Production API, visible, toggle button, pressed"`).
3. Activate Voice Control on macOS. Dictate *"Click Production API"*. Confirm voice recognition activates the button immediately (verifying Label in Name conformance).
4. Press `Shift + Alt + T`. Confirm the chart swaps to a semantic HTML table with valid headers (`<th>`) and values (`<td>`).
