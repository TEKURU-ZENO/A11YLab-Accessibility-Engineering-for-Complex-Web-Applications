# Grafana Pull Request Proposal: Fix VizLegend Label-in-Name (WCAG 2.5.3) and Add Toggle Semantics

**Target Repository:** `grafana/grafana`  
**Base Commit:** `b0f1023bd11dcdc5af37f33e7201d8931cc0df8c` (upstream `main`)  
**Status:** PR-ready authored patch (verified via `git apply --check`)  
**Packages Affected:** `@grafana/ui` (`packages/grafana-ui/src/components/VizLegend/`)  
**Type:** Accessibility Bugfix / WCAG 2.2 AA Compliance  
**Issue Category:** Perceivable / Operable / Robust  
**Author:** Dev Mehta <devmehta060505@gmail.com>  

---

## Summary of Changes

1. **Fixes WCAG 2.5.3 (Label in Name)**:
   Previously, `VizLegendListItem.tsx` computed `aria-label="All series selected"` for every button when all items were visible. This hid the series name from speech control and screen readers. The updated implementation ensures the accessible name begins with the visible series label (`item.label`) and appends current visibility state.
2. **Exposes Toggle State (WCAG 4.1.2)**:
   Adds `aria-pressed={!item.disabled}` so screen reader users hear whether the series is currently enabled or hidden.

---

## Code Diff Preview

```diff
diff --git a/packages/grafana-ui/src/components/VizLegend/VizLegendListItem.tsx b/packages/grafana-ui/src/components/VizLegend/VizLegendListItem.tsx
index 4a7acdf..442d748 100644
--- a/packages/grafana-ui/src/components/VizLegend/VizLegendListItem.tsx
+++ b/packages/grafana-ui/src/components/VizLegend/VizLegendListItem.tsx
@@ -70,10 +70,8 @@ export const VizLegendListItem = <T = unknown,>({
   );
 
   const getAriaLabel = () => {
-    if (allItemsSelected) {
-      return t('grafana-ui.viz-legend.all-series-selected', 'All series selected');
-    }
-    return t('grafana-ui.viz-legend.only-this-series-selected', 'Only {{label}} selected', { label: item.label });
+    const status = item.disabled ? 'hidden' : 'visible';
+    return `${item.label}, ${status}`;
   };
 
   return (
@@ -92,6 +90,7 @@ export const VizLegendListItem = <T = unknown,>({
         disabled={readonly}
         type="button"
         aria-label={getAriaLabel()}
+        aria-pressed={!item.disabled}
         onBlur={onMouseOut}
         onFocus={onMouseOver}
         onMouseOver={onMouseOver}
```

---

## Verification & Testing Instructions

1. Load a TimeSeries graph with multiple series.
2. Verify screen reader announces the actual series name on each legend item (e.g. `"API Gateway Requests, visible, toggle button, selected"`).
3. Activate speech recognition (Voice Control / Dragon). Dictate *"Click API Gateway Requests"*. Confirm the button activates immediately.
4. Run `git apply --check patches/0002-fix-vizlegend-accessible-names-and-chart-table.patch`: clean 0 error exit.
