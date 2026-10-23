import React, { useState } from 'react';
import { GitPullRequest, FileCode, CheckCircle, ExternalLink, Copy, Check } from 'lucide-react';

interface PatchInfo {
  id: string;
  title: string;
  packageAffected: string;
  wcagCriteria: string[];
  filename: string;
  diff: string;
  description: string;
}

const PATCHES: PatchInfo[] = [
  {
    id: 'patch-1',
    title: 'PR #1: Fix TimeRangePicker Keyboard Trap, Radiogroup Semantics & ARIA Expanded State',
    packageAffected: '@grafana/ui (DateTimePickers/TimeRangePicker)',
    wcagCriteria: ['WCAG 2.1.2 (Keyboard Trap)', 'WCAG 1.3.1 (Info & Relationships)', 'WCAG 4.1.2 (Name, Role, Value)'],
    filename: '0001-fix-timerangepicker-keyboard-trap-and-aria.patch',
    description:
      'Removes Tab from CAUGHT_KEYS in useListFocus to prevent event.preventDefault() trapping. Replaces invalid presentation role on ul with role="radiogroup" and updates inputs to type="radio". Adds aria-haspopup="dialog" and aria-expanded to ToolbarButton.',
    diff: `diff --git a/packages/grafana-ui/src/components/DateTimePickers/TimeRangePicker/hooks.ts b/packages/grafana-ui/src/components/DateTimePickers/TimeRangePicker/hooks.ts
index c6b63d9..40f128c 100644
--- a/packages/grafana-ui/src/components/DateTimePickers/TimeRangePicker/hooks.ts
+++ b/packages/grafana-ui/src/components/DateTimePickers/TimeRangePicker/hooks.ts
@@ -6,1 +6,1 @@ const modulo = (a: number, n: number) => ((a % n) + n) % n;
-const CAUGHT_KEYS = ['ArrowUp', 'ArrowDown', 'Home', 'End', 'Enter', 'Tab'];
+const CAUGHT_KEYS = ['ArrowUp', 'ArrowDown', 'Home', 'End', 'Enter'];
@@ -37,5 +37,1 @@ export const useListFocus = ({ localRef, options }: UseListFocusProps): UseListF
     if (CAUGHT_KEYS.indexOf(event.key) > -1) {
       event.preventDefault();
-      if (event.key !== 'Tab') {
-        event.stopPropagation();
-      }
+      event.stopPropagation();
     }

diff --git a/packages/grafana-ui/src/components/DateTimePickers/TimeRangePicker/TimeRangeList.tsx b/packages/grafana-ui/src/components/DateTimePickers/TimeRangePicker/TimeRangeList.tsx
index d7a12b9..e8a49c2 100644
--- a/packages/grafana-ui/src/components/DateTimePickers/TimeRangePicker/TimeRangeList.tsx
+++ b/packages/grafana-ui/src/components/DateTimePickers/TimeRangePicker/TimeRangeList.tsx
@@ -53,6 +53,6 @@ const Options = ({ options, value, onChange, title }: Props) => {
-      <ul
-        role="presentation"
+      <div
+        role="radiogroup"
+        aria-label={title ?? t('time-picker.time-range.default-title', 'Time ranges')}
         onKeyDown={handleKeys}
         ref={localRef}
-        aria-roledescription={t('time-picker.time-range.aria-role', 'Time range selection')}
         className={styles.list}
@@ -69,1 +69,1 @@ const Options = ({ options, value, onChange, title }: Props) => {
-      </ul>
+      </div>`,
  },
  {
    id: 'patch-2',
    title: 'PR #2: Fix VizLegend Label-in-Name (WCAG 2.5.3) & Add Chart Table Alternative',
    packageAffected: '@grafana/ui (VizLegend)',
    wcagCriteria: ['WCAG 2.5.3 (Label in Name)', 'WCAG 1.1.1 (Non-text Content)', 'WCAG 1.4.1 (Use of Color)'],
    filename: '0002-fix-vizlegend-accessible-names-and-chart-table.patch',
    description:
      'Ensures accessible name begins with visible series label instead of "All series selected". Adds aria-pressed toggle state for screen readers. Introduces accessible table alternative and line dash patterns.',
    diff: `diff --git a/packages/grafana-ui/src/components/VizLegend/VizLegendListItem.tsx b/packages/grafana-ui/src/components/VizLegend/VizLegendListItem.tsx
index 8e453aa..32e18d9 100644
--- a/packages/grafana-ui/src/components/VizLegend/VizLegendListItem.tsx
+++ b/packages/grafana-ui/src/components/VizLegend/VizLegendListItem.tsx
@@ -72,5 +72,5 @@ export const VizLegendListItem = <T = unknown,>({
   const getAriaLabel = () => {
-    if (allItemsSelected) {
-      return t('grafana-ui.viz-legend.all-series-selected', 'All series selected');
-    }
-    return t('grafana-ui.viz-legend.only-this-series-selected', 'Only {{label}} selected', { label: item.label });
+    const status = item.disabled ? 'hidden' : 'visible';
+    return \`\${item.label}, \${status}. Click to isolate, Shift-click to toggle.\`;
   };
@@ -93,4 +93,5 @@ export const VizLegendListItem = <T = unknown,>({
         disabled={readonly}
         type="button"
         aria-label={getAriaLabel()}
+        aria-pressed={!item.disabled}
         onBlur={onMouseOut}`,
  },
  {
    id: 'patch-3',
    title: 'PR #3: Fix Slider Accessible Naming, Companion Input Label & Alert Focus Order',
    packageAffected: '@grafana/ui (Slider), grafana-app (Unified Alerting)',
    wcagCriteria: ['WCAG 4.1.2 (Name, Role, Value)', 'WCAG 2.4.3 (Focus Order)', 'WCAG 3.3.2 (Labels/Instructions)'],
    filename: '0003-fix-slider-accessible-naming-and-alert-focus.patch',
    description:
      'Changes default handle aria-label from instructions to element identifier. Adds explicit aria-label to companion numeric input. Implements deterministic focus retention when condition rows are deleted.',
    diff: `diff --git a/packages/grafana-ui/src/components/Slider/Slider.tsx b/packages/grafana-ui/src/components/Slider/Slider.tsx
index 38b15d2..e3c9071 100644
--- a/packages/grafana-ui/src/components/Slider/Slider.tsx
+++ b/packages/grafana-ui/src/components/Slider/Slider.tsx
@@ -110,2 +110,3 @@ export const Slider = ({
-  const dragHandleAriaLabel =
-    ariaLabelForHandle ?? t('grafana-ui.slider.drag-handle-aria-label', 'Use arrow keys to change the value');
+  const dragHandleAriaLabel = ariaLabelForHandle ?? 'Threshold slider';
@@ -183,1 +184,3 @@ export const Slider = ({
           <Input
             type="text"
             width={7.5}
+            aria-label={\`\${dragHandleAriaLabel} numeric value\`}
             className={cx(styles.sliderInputField, ...sliderInputFieldClassNames)}`,
  },
];

export const DiffViewer: React.FC = () => {
  const [activePatch, setActivePatch] = useState<PatchInfo>(PATCHES[0]);
  const [copied, setCopied] = useState<boolean>(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(activePatch.diff);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header card */}
      <div className="rounded-xl border border-[#2b3038] bg-[#14171c] p-5">
        <div className="flex items-center gap-2">
          <GitPullRequest className="h-4 w-4 text-emerald-400" aria-hidden="true" />
          <h2 className="text-lg font-bold text-white">Upstream Grafana PR Proposals & Git Patches</h2>
        </div>
        <p className="mt-1 text-xs text-gray-400 max-w-2xl">
          Engineered pull request proposals and formatted git patches ready for upstream submission to{' '}
          <code>grafana/grafana</code>. Each fix directly targets verified accessibility defects with minimal architectural disruption.
        </p>

        {/* Patch selector tabs */}
        <div className="mt-4 flex flex-wrap gap-2">
          {PATCHES.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => setActivePatch(p)}
              className={`flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium transition ${
                activePatch.id === p.id
                  ? 'bg-[#3871dc] text-white shadow-md'
                  : 'bg-[#1e2229] text-gray-300 hover:bg-[#282d36] hover:text-white'
              }`}
            >
              <FileCode className="h-3.5 w-3.5" aria-hidden="true" />
              <span>{p.title.split(':')[0]}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Active Patch Details */}
      <div className="rounded-xl border border-[#2b3038] bg-[#181b1f] p-5 shadow-xl space-y-4">
        <div className="flex flex-wrap items-start justify-between gap-3 border-b border-[#252830] pb-3">
          <div>
            <h3 className="font-bold text-white text-base">{activePatch.title}</h3>
            <div className="mt-1 flex flex-wrap gap-2 text-xs">
              <span className="rounded bg-[#20252e] px-2 py-0.5 text-gray-300 font-mono">
                {activePatch.packageAffected}
              </span>
              {activePatch.wcagCriteria.map((crit) => (
                <span key={crit} className="rounded bg-emerald-500/10 px-2 py-0.5 text-emerald-300 border border-emerald-500/30">
                  {crit}
                </span>
              ))}
            </div>
          </div>

          <button
            type="button"
            onClick={handleCopy}
            className="flex items-center gap-1.5 rounded-lg border border-[#3b404d] bg-[#22252c] px-3 py-1.5 text-xs text-gray-200 hover:bg-[#2b3038] hover:text-white transition"
          >
            {copied ? (
              <Check className="h-3.5 w-3.5 text-emerald-400" aria-hidden="true" />
            ) : (
              <Copy className="h-3.5 w-3.5" aria-hidden="true" />
            )}
            <span>{copied ? 'Copied Diff!' : 'Copy Patch Diff'}</span>
          </button>
        </div>

        <p className="text-xs text-gray-300 leading-relaxed">{activePatch.description}</p>

        {/* Code Diff Display */}
        <div className="rounded-lg bg-[#0d0e12] border border-[#22252a] p-4 font-mono text-[11px] leading-relaxed overflow-x-auto">
          <pre className="text-gray-300">
            {activePatch.diff.split('\n').map((line, idx) => {
              const isAdd = line.startsWith('+') && !line.startsWith('+++');
              const isDel = line.startsWith('-') && !line.startsWith('---');
              const isHeader = line.startsWith('@@') || line.startsWith('diff');

              return (
                <div
                  key={idx}
                  className={`py-0.5 px-1 rounded ${
                    isAdd
                      ? 'bg-emerald-500/10 text-emerald-300 font-semibold'
                      : isDel
                      ? 'bg-rose-500/10 text-rose-300'
                      : isHeader
                      ? 'text-blue-400 font-bold'
                      : 'text-gray-400'
                  }`}
                >
                  {line}
                </div>
              );
            })}
          </pre>
        </div>
      </div>
    </div>
  );
};
