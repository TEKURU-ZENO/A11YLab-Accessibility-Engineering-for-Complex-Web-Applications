import React, { useState, useRef } from 'react';
import { useA11y } from '../../context/A11yContext';
import { AlertCondition } from '../../types';
import { Bell, Plus, Trash2, Sliders, AlertTriangle, AlertCircle, CheckCircle, Info, HelpCircle } from 'lucide-react';

const INITIAL_CONDITIONS: AlertCondition[] = [
  {
    id: 'cond-1',
    label: 'Condition A (API Gateway)',
    metric: 'avg(rate(http_requests_total[5m]))',
    operator: '>',
    threshold: 85,
    duration: '5m',
  },
  {
    id: 'cond-2',
    label: 'Condition B (P95 Latency SLA)',
    metric: 'histogram_quantile(0.95, http_request_duration_seconds)',
    operator: '>',
    threshold: 90,
    duration: '10m',
  },
  {
    id: 'cond-3',
    label: 'Condition C (Pod Memory Leak)',
    metric: 'container_memory_working_set_bytes / limit',
    operator: '>',
    threshold: 75,
    duration: '15m',
  },
];

export const AlertBuilderDemo: React.FC = () => {
  const { isRemediated, speak, setLivePoliteMessage, setLiveAssertiveMessage, activeScreenReader } = useA11y();

  const [conditions, setConditions] = useState<AlertCondition[]>(INITIAL_CONDITIONS);
  const [rowFocusedId, setRowFocusedId] = useState<string | null>(null);

  const addBtnRef = useRef<HTMLButtonElement>(null);
  const conditionRefs = useRef<Map<string, HTMLDivElement>>(new Map());

  // Handle condition deletion with deterministic focus retention
  const handleDeleteCondition = (id: string, index: number) => {
    const targetCondition = conditions.find((c) => c.id === id);
    const newConditions = conditions.filter((c) => c.id !== id);
    setConditions(newConditions);

    if (isRemediated) {
      // REMEDIATED WCAG 2.4.3: Deterministic focus management
      const remainingCount = newConditions.length;
      const statusText = `${targetCondition?.label || 'Condition'} removed. ${remainingCount} condition${
        remainingCount === 1 ? '' : 's'
      } remaining.`;
      setLivePoliteMessage(statusText);
      speak(statusText, 'announcement');

      // Programmatically move focus to adjacent row or fallback to Add button
      setTimeout(() => {
        if (newConditions.length > 0) {
          const targetIndex = Math.min(index, newConditions.length - 1);
          const nextTargetId = newConditions[targetIndex].id;
          const targetEl = conditionRefs.current.get(nextTargetId);
          if (targetEl) {
            targetEl.focus();
            speak(`Focus shifted to ${newConditions[targetIndex].label}.`, 'focus');
          }
        } else if (addBtnRef.current) {
          addBtnRef.current.focus();
          speak('All conditions removed. Focus shifted to Add condition button.', 'focus');
        }
      }, 50);
    } else {
      // DEFECTIVE UPSTREAM REPRODUCTION:
      // Focus is lost because the unmounted element had focus, dropping activeElement to document.body!
      setTimeout(() => {
        if (document.body) {
          document.body.focus();
          speak(
            activeScreenReader === 'voiceover'
              ? 'Web content, Grafana Dashboard top banner. (FOCUS LOST TO BODY ROOT!)'
              : 'Grafana - Alert rules document. (FOCUS LOST TO BODY ROOT!)',
            'error'
          );
        }
      }, 50);
    }
  };

  const handleAddCondition = () => {
    const nextChar = String.fromCharCode(65 + conditions.length);
    const newCond: AlertCondition = {
      id: `cond-${Date.now()}`,
      label: `Condition ${nextChar} (Custom Metric)`,
      metric: 'rate(process_cpu_seconds_total[5m])',
      operator: '>',
      threshold: 80,
      duration: '5m',
    };
    setConditions([...conditions, newCond]);

    if (isRemediated) {
      const msg = `Added Condition ${nextChar}. Total conditions: ${conditions.length + 1}.`;
      setLivePoliteMessage(msg);
      speak(msg, 'announcement');
    }
  };

  const handleThresholdChange = (id: string, newThreshold: number) => {
    const hasError = newThreshold > 100 || newThreshold < 0;
    const errorMsg = hasError ? 'Threshold value must be between 0 and 100%' : undefined;

    setConditions((prev) =>
      prev.map((c) =>
        c.id === id ? { ...c, threshold: newThreshold, hasError, errorMessage: errorMsg } : c
      )
    );

    if (hasError && isRemediated) {
      setLiveAssertiveMessage(`Error on condition: ${errorMsg}`);
      speak(`Error: ${errorMsg}`, 'error');
    }
  };

  return (
    <div className="space-y-6">
      {/* Workflow Context Card */}
      <div className="rounded-xl border border-[#2b3038] bg-[#14171c] p-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded bg-amber-500/10 px-2 py-0.5 text-xs font-semibold text-amber-400 uppercase">
                Workflow 3
              </span>
              <span className="text-xs text-gray-400">Alert Configuration & Rule Condition Builder</span>
            </div>
            <h2 className="mt-1 text-lg font-bold text-white">Dynamic Form Controls & Focus Management</h2>
            <p className="mt-0.5 text-xs text-gray-400 max-w-2xl">
              Audits Grafana Alerting rule builder (`Slider`, form row addition/deletion, inline validation).
              Demonstrates focus retention on DOM mutation (WCAG 2.4.3) and semantic slider naming (WCAG 4.1.2).
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
              <span>Reproduced Upstream Defects (WCAG 2.4.3, 4.1.2, 1.3.1, 3.3.1)</span>
            </div>
            <p>
              1. <strong>Focus Reset to `&lt;body&gt;` on Row Deletion</strong>: Activating "Delete condition" causes React to remove the button. Focus is not redirected, dumping the user to the top banner!
            </p>
            <p>
              2. <strong>Slider Instructional Naming</strong>: In <code>Slider.tsx</code>, the handle <code>aria-label</code> defaults to <em>"Use arrow keys to change the value"</em> instead of identifying the metric.
            </p>
            <p>
              3. <strong>Companion Input Missing Label</strong>: The text input next to the slider lacks an accessible name, triggering immediate axe violations.
            </p>
          </div>
        ) : (
          <div className="mt-4 rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3.5 text-xs text-emerald-200 space-y-1">
            <div className="flex items-center gap-2 font-semibold text-emerald-300">
              <CheckCircle className="h-4 w-4 shrink-0 text-emerald-400" aria-hidden="true" />
              <span>Engineered Remediations Active (WCAG 2.2 AA Conforming)</span>
            </div>
            <p>
              1. <strong>Deterministic Focus Retention</strong>: Deleting a condition smoothly guides focus to the next condition row or Add button with a live announcement.
            </p>
            <p>
              2. <strong>Semantic Slider Naming</strong>: Handle named with property (e.g. <em>"Threshold slider"</em>), instructions mapped to <code>aria-describedby</code>, and unit-aware <code>aria-valuetext</code>.
            </p>
            <p>
              3. <strong>Companion Input Labeled</strong>: Text input explicitly labeled and associated with the slider.
            </p>
            <p>
              4. <strong>Accessible Inline Validation</strong>: Validation errors bound via <code>aria-invalid="true"</code> and <code>aria-errormessage</code>.
            </p>
          </div>
        )}
      </div>

      {/* Interactive Alert Rule Form Playground */}
      <div id="workflow-target" className="rounded-xl border border-[#2b3038] bg-[#181b1f] p-6 shadow-xl">
        <div className="mb-4 flex items-center justify-between border-b border-[#252830] pb-3">
          <div className="flex items-center gap-2">
            <Bell className="h-4 w-4 text-amber-400" aria-hidden="true" />
            <span className="text-xs font-semibold text-gray-300 uppercase tracking-wider">
              Alert Evaluation Rules: Expression Pipeline
            </span>
          </div>
          <button
            ref={addBtnRef}
            type="button"
            onClick={handleAddCondition}
            className="flex items-center gap-1.5 rounded-lg bg-[#3871dc] px-3 py-1.5 text-xs font-medium text-white hover:bg-[#2f5ebb] transition focus-visible:ring-2 focus-visible:ring-[#5794f2]"
          >
            <Plus className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Add Condition</span>
          </button>
        </div>

        {/* Condition Rows List */}
        <div className="space-y-4">
          {conditions.length === 0 ? (
            <div className="rounded-lg border border-dashed border-[#2c3038] p-8 text-center text-xs text-gray-500">
              No conditions configured. Click "Add Condition" to create an alert expression.
            </div>
          ) : (
            conditions.map((cond, index) => {
              const sliderId = `slider-${cond.id}`;
              const hintId = `hint-${cond.id}`;
              const errorId = `err-${cond.id}`;

              return (
                <div
                  key={cond.id}
                  ref={(el) => {
                    if (el) conditionRefs.current.set(cond.id, el);
                    else conditionRefs.current.delete(cond.id);
                  }}
                  tabIndex={-1}
                  role="region"
                  aria-label={cond.label}
                  className="rounded-lg border border-[#2b3038] bg-[#14161b] p-4 transition focus:ring-2 focus:ring-[#5794f2] outline-none"
                >
                  <div className="flex items-center justify-between border-b border-[#22252a] pb-2 mb-3">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-gray-200 text-xs">{cond.label}</span>
                      <span className="text-[10px] text-gray-500 font-mono">ID: {cond.id}</span>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleDeleteCondition(cond.id, index)}
                      aria-label={`Delete ${cond.label}`}
                      className="flex items-center gap-1 rounded px-2 py-1 text-xs text-gray-400 hover:bg-rose-500/10 hover:text-rose-400 transition focus-visible:ring-2 focus-visible:ring-rose-500"
                    >
                      <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                      <span>Delete</span>
                    </button>
                  </div>

                  {/* Form Controls Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
                    {/* Metric Expression */}
                    <div className="md:col-span-5 space-y-1">
                      <label htmlFor={`metric-${cond.id}`} className="text-[11px] font-medium text-gray-400">
                        PromQL Metric Query
                      </label>
                      <input
                        id={`metric-${cond.id}`}
                        type="text"
                        defaultValue={cond.metric}
                        className="w-full rounded bg-[#101216] border border-[#2c3038] px-2.5 py-1.5 text-xs text-gray-200 font-mono focus-visible:ring-1 focus-visible:ring-[#5794f2]"
                      />
                    </div>

                    {/* Operator */}
                    <div className="md:col-span-2 space-y-1">
                      <label htmlFor={`op-${cond.id}`} className="text-[11px] font-medium text-gray-400">
                        Condition
                      </label>
                      <select
                        id={`op-${cond.id}`}
                        defaultValue={cond.operator}
                        className="w-full rounded bg-[#101216] border border-[#2c3038] px-2 py-1.5 text-xs text-gray-200 focus-visible:ring-1 focus-visible:ring-[#5794f2]"
                      >
                        <option value=">">Is Above (&gt;)</option>
                        <option value="<">Is Below (&lt;)</option>
                        <option value="==">Is Equal (==)</option>
                      </select>
                    </div>

                    {/* Threshold Slider & Companion Numeric Input */}
                    <div className="md:col-span-5 space-y-1">
                      <div className="flex items-center justify-between">
                        <label htmlFor={sliderId} className="text-[11px] font-medium text-gray-400">
                          Threshold ({cond.threshold}%)
                        </label>
                        {isRemediated && (
                          <span id={hintId} className="text-[10px] text-gray-500">
                            Use arrow keys to adjust threshold
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-3">
                        {/* Interactive Slider Input */}
                        <div className="relative flex-1">
                          <input
                            id={sliderId}
                            type="range"
                            min="0"
                            max="100"
                            value={cond.threshold}
                            onChange={(e) => handleThresholdChange(cond.id, Number(e.target.value))}
                            onFocus={() => {
                              speak(
                                isRemediated
                                  ? `${cond.label} threshold slider, ${cond.threshold}% CPU utilization, Critical severity.`
                                  : 'Use arrow keys to change the value, slider, 85.',
                                'focus'
                              );
                            }}
                            // Defective vs Remediated Accessible Attributes:
                            aria-label={
                              isRemediated
                                ? `${cond.label} threshold slider`
                                : 'Use arrow keys to change the value' // UPSTREAM DEFECT: Instruction string as name
                            }
                            aria-describedby={isRemediated ? hintId : undefined}
                            aria-valuemin={0}
                            aria-valuemax={100}
                            aria-valuenow={cond.threshold}
                            aria-valuetext={
                              isRemediated
                                ? `${cond.threshold}% utilization threshold, Critical trigger`
                                : undefined
                            }
                            aria-invalid={isRemediated && cond.hasError ? 'true' : undefined}
                            aria-errormessage={isRemediated && cond.hasError ? errorId : undefined}
                            className="w-full accent-[#3871dc] cursor-pointer"
                          />
                        </div>

                        {/* Companion Numeric Input */}
                        <div className="w-16">
                          <input
                            type="number"
                            min="0"
                            max="100"
                            value={cond.threshold}
                            onChange={(e) => handleThresholdChange(cond.id, Number(e.target.value))}
                            onFocus={() => {
                              speak(
                                isRemediated
                                  ? `${cond.label} threshold numeric input, ${cond.threshold}`
                                  : 'Edit text, 85 (NO ACCESSIBLE LABEL)',
                                'focus'
                              );
                            }}
                            // Defective vs Remediated Labeling:
                            aria-label={
                              isRemediated
                                ? `${cond.label} threshold numeric input`
                                : undefined // UPSTREAM DEFECT: Unlabeled input
                            }
                            aria-invalid={isRemediated && cond.hasError ? 'true' : undefined}
                            aria-errormessage={isRemediated && cond.hasError ? errorId : undefined}
                            className={`w-full rounded bg-[#101216] border px-2 py-1 text-xs text-white text-center font-mono ${
                              cond.hasError
                                ? 'border-rose-500 ring-1 ring-rose-500'
                                : 'border-[#2c3038]'
                            }`}
                          />
                        </div>
                      </div>

                      {/* Error Validation Message */}
                      {cond.hasError && (
                        <div
                          id={errorId}
                          role="alert"
                          aria-live="assertive"
                          className="mt-1 flex items-center gap-1.5 text-[11px] text-rose-400 font-medium"
                        >
                          <AlertTriangle className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                          <span>{cond.errorMessage}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
