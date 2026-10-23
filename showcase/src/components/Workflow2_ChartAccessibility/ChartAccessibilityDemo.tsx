import React, { useState, useEffect, useRef } from 'react';
import { useA11y } from '../../context/A11yContext';
import { MetricPoint, MetricSeries } from '../../types';
import { Table, BarChart2, Eye, EyeOff, AlertCircle, CheckCircle, Navigation, Info } from 'lucide-react';

const INITIAL_SERIES: MetricSeries[] = [
  { id: 's1', name: 'API Gateway Requests', color: '#5794f2', lineStyle: 'solid', unit: 'req/s', disabled: false },
  { id: 's2', name: 'Latency p95 (Critical)', color: '#f2495c', lineStyle: 'dashed', unit: 'ms', disabled: false },
  { id: 's3', name: 'Pod Memory Usage', color: '#ff780a', lineStyle: 'dotted', unit: '%', disabled: false },
  { id: 's4', name: 'HTTP 5xx Error Rate', color: '#73bf69', lineStyle: 'dash-dot', unit: '%', disabled: false },
];

const TELEMETRY_DATA: MetricPoint[] = [
  { timestamp: '14:00', apiRequests: 820, latencyP95: 115, memoryUsage: 54, errorRate: 0.02 },
  { timestamp: '14:15', apiRequests: 940, latencyP95: 130, memoryUsage: 58, errorRate: 0.03 },
  { timestamp: '14:30', apiRequests: 1420, latencyP95: 450, memoryUsage: 78, errorRate: 1.85 }, // Peak anomaly
  { timestamp: '14:45', apiRequests: 1210, latencyP95: 280, memoryUsage: 74, errorRate: 0.65 },
  { timestamp: '15:00', apiRequests: 980, latencyP95: 160, memoryUsage: 66, errorRate: 0.12 },
  { timestamp: '15:15', apiRequests: 890, latencyP95: 125, memoryUsage: 61, errorRate: 0.04 },
];

export const ChartAccessibilityDemo: React.FC = () => {
  const { isRemediated, speak, setLivePoliteMessage, activeScreenReader, isHighContrast } = useA11y();

  const [seriesList, setSeriesList] = useState<MetricSeries[]>(INITIAL_SERIES);
  const [showTableView, setShowTableView] = useState<boolean>(false);
  const [crosshairIndex, setCrosshairIndex] = useState<number>(2); // Focused on peak
  const [isCrosshairActive, setIsCrosshairActive] = useState<boolean>(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const plotRegionRef = useRef<HTMLDivElement>(null);

  const allItemsSelected = seriesList.every((s) => !s.disabled);

  // Canvas drawing effect
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    ctx.clearRect(0, 0, width, height);

    // Background grid
    ctx.strokeStyle = isHighContrast ? '#444' : '#22252a';
    ctx.lineWidth = 1;
    for (let y = 30; y < height - 30; y += 40) {
      ctx.beginPath();
      ctx.moveTo(40, y);
      ctx.lineTo(width - 20, y);
      ctx.stroke();
    }

    // Draw active series lines
    seriesList.forEach((s) => {
      if (s.disabled) return;

      ctx.beginPath();
      ctx.strokeStyle = isHighContrast ? '#ffffff' : s.color;
      ctx.lineWidth = 2.5;

      // Apply line dash patterns for WCAG 1.4.1 non-color reliance
      if (isRemediated) {
        if (s.lineStyle === 'dashed') ctx.setLineDash([8, 4]);
        else if (s.lineStyle === 'dotted') ctx.setLineDash([3, 3]);
        else if (s.lineStyle === 'dash-dot') ctx.setLineDash([8, 3, 2, 3]);
        else ctx.setLineDash([]);
      } else {
        ctx.setLineDash([]); // Upstream defect: pure solid lines differentiated only by color hue
      }

      const step = (width - 70) / (TELEMETRY_DATA.length - 1);
      TELEMETRY_DATA.forEach((pt, i) => {
        const x = 50 + i * step;
        let normVal = 0;
        if (s.id === 's1') normVal = (pt.apiRequests - 700) / 900;
        else if (s.id === 's2') normVal = pt.latencyP95 / 500;
        else if (s.id === 's3') normVal = pt.memoryUsage / 100;
        else if (s.id === 's4') normVal = pt.errorRate / 2;

        const y = height - 40 - normVal * (height - 80);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.stroke();
    });

    // Draw crosshair vertical indicator if active
    if (isCrosshairActive && isRemediated) {
      const step = (width - 70) / (TELEMETRY_DATA.length - 1);
      const crosshairX = 50 + crosshairIndex * step;

      ctx.save();
      ctx.setLineDash([4, 4]);
      ctx.strokeStyle = '#5794f2';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(crosshairX, 20);
      ctx.lineTo(crosshairX, height - 30);
      ctx.stroke();
      ctx.restore();
    }
  }, [seriesList, isRemediated, crosshairIndex, isCrosshairActive, isHighContrast]);

  // Keyboard shortcut listener for accessible table toggle (Alt + T or Shift + Alt + T)
  useEffect(() => {
    const handleGlobalKeys = (e: KeyboardEvent) => {
      if (e.altKey && (e.key === 't' || e.key === 'T')) {
        e.preventDefault();
        setShowTableView((prev) => {
          const next = !prev;
          speak(
            next
              ? 'Switched to accessible telemetry data table. 5 columns, 6 data rows.'
              : 'Switched to visual canvas chart view.',
            'action'
          );
          return next;
        });
      }
    };
    window.addEventListener('keydown', handleGlobalKeys);
    return () => window.removeEventListener('keydown', handleGlobalKeys);
  }, [speak]);

  // Series toggle handler
  const handleToggleSeries = (targetSeries: MetricSeries) => {
    setSeriesList((prev) =>
      prev.map((s) => (s.id === targetSeries.id ? { ...s, disabled: !s.disabled } : s))
    );

    const willBeDisabled = !targetSeries.disabled;
    if (isRemediated) {
      const msg = `${targetSeries.name} is now ${willBeDisabled ? 'hidden' : 'visible'}. Chart updated.`;
      setLivePoliteMessage(msg);
      speak(msg, 'action');
    } else {
      // In defective upstream, toggles use "All series selected" label without state feedback
      speak('Series toggled.', 'action');
    }
  };

  // Keyboard crosshair inspection handler
  const handlePlotKeyDown = (e: React.KeyboardEvent) => {
    if (!isRemediated) return; // Defective mode lacks keyboard inspection

    if (e.key === 'ArrowRight') {
      e.preventDefault();
      const next = Math.min(crosshairIndex + 1, TELEMETRY_DATA.length - 1);
      setCrosshairIndex(next);
      announcePoint(next);
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      const prev = Math.max(crosshairIndex - 1, 0);
      setCrosshairIndex(prev);
      announcePoint(prev);
    }
  };

  const announcePoint = (index: number) => {
    const pt = TELEMETRY_DATA[index];
    const isPeak = pt.latencyP95 > 300;
    const msg = `${pt.timestamp}: Latency ${pt.latencyP95}ms ${
      isPeak ? '(Critical SLA breach)' : ''
    }, Requests ${pt.apiRequests} req/s, Errors ${pt.errorRate}%.`;
    setLivePoliteMessage(msg);
    speak(msg, 'announcement');
  };

  return (
    <div className="space-y-6">
      {/* Workflow Context Card */}
      <div className="rounded-xl border border-[#2b3038] bg-[#14171c] p-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded bg-indigo-500/10 px-2 py-0.5 text-xs font-semibold text-indigo-400 uppercase">
                Workflow 2
              </span>
              <span className="text-xs text-gray-400">Data Visualization & Panel Interactions</span>
            </div>
            <h2 className="mt-1 text-lg font-bold text-white">TimeSeries & VizLegend Accessibility</h2>
            <p className="mt-0.5 text-xs text-gray-400 max-w-2xl">
              Audits chart accessibility (`@grafana/ui/VizLegend` and canvas rendering).
              Demonstrates Label-in-Name (WCAG 2.5.3) fix, keyboard crosshair inspection, and accessible data table alternatives (WCAG 1.1.1).
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="text-gray-400">Current State:</span>
            <span
              className={`rounded-full px-2.5 py-1 font-semibold ${
                isRemediated
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                  : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
              }`}
            >
              {isRemediated ? 'Remediated (WCAG 2.2 AA)' : 'Upstream Defective (Baseline)'}
            </span>
          </div>
        </div>

        {/* Defect Alert or Remediation Success */}
        {!isRemediated ? (
          <div className="mt-4 rounded-lg border border-rose-500/30 bg-rose-500/10 p-3.5 text-xs text-rose-200 space-y-1">
            <div className="flex items-center gap-2 font-semibold text-rose-300">
              <AlertCircle className="h-4 w-4 shrink-0 text-rose-400" aria-hidden="true" />
              <span>Reproduced Upstream Defects (WCAG 1.1.1, 2.5.3, 1.4.1)</span>
            </div>
            <p>
              1. <strong>Label-in-Name Defect (WCAG 2.5.3)</strong>: In <code>VizLegendListItem.tsx</code>, when all series are visible, <code>aria-label="All series selected"</code> is hardcoded on every button! VoiceOver and Voice Control users cannot see or speak the series names.
            </p>
            <p>
              2. <strong>Canvas Graph Unperceivable (WCAG 1.1.1)</strong>: Pure HTML5 canvas without textual data fallback or table toggle. Blind engineers cannot access any metric data points.
            </p>
            <p>
              3. <strong>Sole Reliance on Color (WCAG 1.4.1)</strong>: All lines are solid strokes distinguished only by color; deuteranopia users cannot differentiate metric streams.
            </p>
          </div>
        ) : (
          <div className="mt-4 rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3.5 text-xs text-emerald-200 space-y-1">
            <div className="flex items-center gap-2 font-semibold text-emerald-300">
              <CheckCircle className="h-4 w-4 shrink-0 text-emerald-400" aria-hidden="true" />
              <span>Engineered Remediations Active (WCAG 2.2 AA Conforming)</span>
            </div>
            <p>
              1. <strong>Label-in-Name Conformance</strong>: Legend buttons start with visible series names (e.g. <code>"API Gateway Requests, visible"</code>) and expose <code>aria-pressed</code> toggle state.
            </p>
            <p>
              2. <strong>Accessible Data Table (`Alt + T`)</strong>: Full semantic HTML table alternative for screen readers with formatted units and header relationships.
            </p>
            <p>
              3. <strong>Keyboard Crosshair Inspection</strong>: Focus plot area and use <kbd className="rounded bg-[#2a2d35] px-1 font-mono">←</kbd> / <kbd className="rounded bg-[#2a2d35] px-1 font-mono">→</kbd> to step through time increments with live speech feedback.
            </p>
            <p>
              4. <strong>Pattern Differentiation</strong>: Distinct dash patterns (dashed, dotted, dash-dot) and high-contrast borders for colorblind and monochrome viewing.
            </p>
          </div>
        )}
      </div>

      {/* Interactive Panel Container */}
      <div id="workflow-target" className="rounded-xl border border-[#2b3038] bg-[#181b1f] shadow-xl overflow-hidden">
        {/* Panel Header */}
        <div className="flex items-center justify-between border-b border-[#252830] px-4 py-3 bg-[#1e2229]">
          <div className="flex items-center gap-2">
            <BarChart2 className="h-4 w-4 text-[#5794f2]" aria-hidden="true" />
            <h3 className="font-semibold text-white text-sm">Cluster Gateway: Latency & Error Rate</h3>
            <span className="rounded bg-[#282d36] px-1.5 py-0.5 text-[10px] text-gray-400 font-mono">
              6 data points · Last 2 hours
            </span>
          </div>

          <div className="flex items-center gap-2">
            {isRemediated && (
              <button
                type="button"
                onClick={() => {
                  setShowTableView(!showTableView);
                  speak(
                    !showTableView
                      ? 'Switched to accessible telemetry table.'
                      : 'Switched to visual canvas chart view.',
                    'action'
                  );
                }}
                className="flex items-center gap-1.5 rounded-lg border border-[#3b404d] bg-[#282c35] px-2.5 py-1 text-xs font-medium text-gray-200 hover:bg-[#323742] hover:text-white transition focus-visible:ring-2 focus-visible:ring-[#5794f2]"
                title="Toggle between Canvas visualization and Accessible Data Table (Alt+T)"
                aria-label={showTableView ? 'Switch to visual chart' : 'Switch to accessible data table'}
              >
                <Table className="h-3.5 w-3.5 text-[#5794f2]" aria-hidden="true" />
                <span>{showTableView ? 'View Chart' : 'Accessible Table (Alt+T)'}</span>
              </button>
            )}
          </div>
        </div>

        {/* Chart Body or Accessible Table */}
        <div className="p-4">
          {!showTableView ? (
            <div>
              {/* Canvas Plot Container */}
              <div
                ref={plotRegionRef}
                tabIndex={isRemediated ? 0 : -1}
                role={isRemediated ? 'region' : undefined}
                aria-label={
                  isRemediated
                    ? 'Time series telemetry chart. Showing 4 metrics over the last 2 hours. Peak latency reached 450 milliseconds at 14:30. Use left and right arrow keys to inspect data points.'
                    : undefined
                }
                onFocus={() => {
                  if (isRemediated) {
                    setIsCrosshairActive(true);
                    speak(
                      'TimeSeries chart focused. Use Left and Right Arrow keys to inspect telemetry metrics point by point.',
                      'focus'
                    );
                  }
                }}
                onBlur={() => setIsCrosshairActive(false)}
                onKeyDown={handlePlotKeyDown}
                className={`relative rounded-lg bg-[#111317] border border-[#252830] p-2 ${
                  isRemediated ? 'focus:ring-2 focus:ring-[#5794f2] cursor-crosshair' : ''
                }`}
              >
                <canvas
                  ref={canvasRef}
                  width={640}
                  height={220}
                  className="w-full h-56 block"
                  aria-hidden={isRemediated ? 'true' : undefined}
                />

                {isRemediated && isCrosshairActive && (
                  <div className="absolute top-3 right-3 rounded bg-[#1e2229]/95 border border-[#3b404d] p-2 text-[11px] shadow-lg backdrop-blur">
                    <div className="font-semibold text-[#5794f2]">
                      Point: {TELEMETRY_DATA[crosshairIndex].timestamp}
                    </div>
                    <div className="text-gray-300">
                      Requests: {TELEMETRY_DATA[crosshairIndex].apiRequests} req/s
                    </div>
                    <div
                      className={
                        TELEMETRY_DATA[crosshairIndex].latencyP95 > 300
                          ? 'font-bold text-rose-400'
                          : 'text-gray-300'
                      }
                    >
                      Latency p95: {TELEMETRY_DATA[crosshairIndex].latencyP95}ms
                    </div>
                    <div className="text-gray-300">
                      Memory: {TELEMETRY_DATA[crosshairIndex].memoryUsage}%
                    </div>
                  </div>
                )}
              </div>

              {isRemediated && (
                <div className="mt-2 text-[11px] text-gray-400 flex items-center justify-between">
                  <span>Interactive Crosshair: Click or tab into plot, then use Arrow keys</span>
                  <span className="text-[#5794f2]">WCAG 1.1.1 & 2.1.1 Conforming</span>
                </div>
              )}
            </div>
          ) : (
            // REMEDIATED ACCESSIBLE DATA TABLE ALTERNATIVE (WCAG 1.1.1 & 1.3.1)
            <div className="overflow-x-auto rounded-lg border border-[#252830]">
              <table
                className="w-full text-left text-xs text-gray-300"
                aria-label="Cluster Gateway Latency & Error Rate Data Table"
              >
                <caption className="sr-only">
                  Telemetry data showing API requests, p95 latency, memory usage, and error rate from 14:00 to 15:15
                </caption>
                <thead className="bg-[#1b1e25] text-gray-400 font-semibold uppercase text-[10px] tracking-wider border-b border-[#252830]">
                  <tr>
                    <th scope="col" className="px-3 py-2.5">Timestamp</th>
                    <th scope="col" className="px-3 py-2.5">API Requests (req/s)</th>
                    <th scope="col" className="px-3 py-2.5">Latency p95 (ms)</th>
                    <th scope="col" className="px-3 py-2.5">Memory Usage (%)</th>
                    <th scope="col" className="px-3 py-2.5">5xx Error Rate (%)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#20232b]">
                  {TELEMETRY_DATA.map((row, i) => (
                    <tr
                      key={row.timestamp}
                      className={`hover:bg-[#1f232b] transition ${
                        row.latencyP95 > 300 ? 'bg-rose-500/10' : ''
                      }`}
                    >
                      <th scope="row" className="px-3 py-2 font-mono font-medium text-gray-200">
                        {row.timestamp}
                      </th>
                      <td className="px-3 py-2 font-mono">{row.apiRequests}</td>
                      <td
                        className={`px-3 py-2 font-mono ${
                          row.latencyP95 > 300 ? 'text-rose-400 font-bold' : ''
                        }`}
                      >
                        {row.latencyP95} {row.latencyP95 > 300 ? '(CRITICAL)' : ''}
                      </td>
                      <td className="px-3 py-2 font-mono">{row.memoryUsage}%</td>
                      <td className="px-3 py-2 font-mono">{row.errorRate}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* VizLegend Section */}
          <div className="mt-4 pt-3 border-t border-[#252830]">
            <div className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-2">
              Metric Series Legend
            </div>

            <div className="flex flex-wrap gap-2">
              {seriesList.map((s) => {
                // Compute aria-label according to mode
                const computedAriaLabel = isRemediated
                  ? `${s.name}, ${s.disabled ? 'hidden' : 'visible'}. Click to toggle series.`
                  : allItemsSelected
                  ? 'All series selected' // UPSTREAM DEFECT: Masking visible series name!
                  : `Only ${s.name} selected`;

                return (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => handleToggleSeries(s)}
                    onFocus={() => {
                      speak(
                        isRemediated
                          ? `${s.name}, ${s.disabled ? 'hidden' : 'visible'}, toggle button`
                          : `${computedAriaLabel}, button`,
                        'focus'
                      );
                    }}
                    aria-label={computedAriaLabel}
                    aria-pressed={isRemediated ? !s.disabled : undefined}
                    className={`flex items-center gap-2 rounded-lg border px-3 py-1.5 text-xs font-medium transition focus-visible:ring-2 focus-visible:ring-[#5794f2] ${
                      s.disabled
                        ? 'border-[#2d313a] bg-[#16181d] text-gray-500 line-through'
                        : 'border-[#383d47] bg-[#22252c] text-gray-200 hover:bg-[#2c3039] hover:text-white'
                    }`}
                  >
                    {/* Visual Series Pattern Indicator */}
                    <span
                      className="h-2.5 w-4 rounded-sm flex items-center justify-center shrink-0"
                      style={{ backgroundColor: s.color }}
                      aria-hidden="true"
                    >
                      {isRemediated && s.lineStyle !== 'solid' && (
                        <span className="block w-full border-t border-black/60" />
                      )}
                    </span>

                    <span>{s.name}</span>

                    {/* Defective Warning Tag */}
                    {!isRemediated && (
                      <span className="text-[9px] text-rose-400 font-mono ml-1">
                        [aria: "All series selected"]
                      </span>
                    )}

                    {s.disabled ? (
                      <EyeOff className="h-3 w-3 text-gray-500 shrink-0" aria-hidden="true" />
                    ) : (
                      <Eye className="h-3 w-3 text-emerald-400 shrink-0" aria-hidden="true" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
