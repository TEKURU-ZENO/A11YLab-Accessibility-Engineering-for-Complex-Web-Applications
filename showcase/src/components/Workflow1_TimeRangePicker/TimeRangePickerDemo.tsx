import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useA11y } from '../../context/A11yContext';
import { Clock, ChevronLeft, ChevronRight, ZoomOut, AlertCircle, CheckCircle, Info, Calendar, X } from 'lucide-react';

interface QuickOption {
  label: string;
  from: string;
  to: string;
}

const QUICK_OPTIONS: QuickOption[] = [
  { label: 'Last 5 minutes', from: 'now-5m', to: 'now' },
  { label: 'Last 15 minutes', from: 'now-15m', to: 'now' },
  { label: 'Last 30 minutes', from: 'now-30m', to: 'now' },
  { label: 'Last 1 hour', from: 'now-1h', to: 'now' },
  { label: 'Last 3 hours', from: 'now-3h', to: 'now' },
  { label: 'Last 6 hours', from: 'now-6h', to: 'now' },
  { label: 'Last 12 hours', from: 'now-12h', to: 'now' },
  { label: 'Last 24 hours', from: 'now-24h', to: 'now' },
];

export const TimeRangePickerDemo: React.FC = () => {
  const { isRemediated, speak, setLivePoliteMessage, activeScreenReader } = useA11y();

  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [selectedRange, setSelectedRange] = useState<QuickOption>(QUICK_OPTIONS[5]); // Default: Last 6 hours
  const [focusedIndex, setFocusedIndex] = useState<number>(5);
  const [trapWarning, setTrapWarning] = useState<string | null>(null);

  const triggerRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const optionsRef = useRef<HTMLDivElement>(null);

  // Focus trap / restoration management
  useEffect(() => {
    if (isOpen) {
      if (isRemediated) {
        // Remediated: Focus inside dialog on first interactive element or current selected
        speak(
          activeScreenReader === 'voiceover'
            ? 'Time range picker dialog opened. Time ranges radio group, 8 items. Last 6 hours, radio button, 6 of 8, selected.'
            : 'Time range picker dialog, Time ranges grouping, Last 6 hours radio button checked 6 of 8.',
          'action'
        );
      } else {
        // Defective: Open without expanded state announcement
        speak(
          activeScreenReader === 'voiceover'
            ? 'Time range selected: Last 6 hours, button'
            : 'Time range selected: Last 6 hours button',
          'focus'
        );
      }
    } else {
      if (triggerRef.current && document.activeElement !== triggerRef.current) {
        triggerRef.current.focus();
      }
    }
  }, [isOpen, isRemediated, speak, activeScreenReader]);

  const handleOpenToggle = () => {
    const nextState = !isOpen;
    setIsOpen(nextState);
    setTrapWarning(null);

    if (isRemediated) {
      speak(
        activeScreenReader === 'voiceover'
          ? `Time range selected: ${selectedRange.label}, pop-up button, ${nextState ? 'expanded' : 'collapsed'}.`
          : `Time range selected: ${selectedRange.label} button ${nextState ? 'expanded' : 'collapsed'}`,
        'action'
      );
    } else {
      speak(`Time range selected: ${selectedRange.label} button`, 'action');
    }
  };

  const handleSelectOption = (option: QuickOption, index: number) => {
    setSelectedRange(option);
    setFocusedIndex(index);
    setIsOpen(false);

    if (isRemediated) {
      const msg = `Time range updated to ${option.label}. Refreshing dashboard panels.`;
      setLivePoliteMessage(msg);
      speak(msg, 'announcement');
    } else {
      // In defective upstream, selection is silent
      speak('Dialog closed.', 'action');
    }
  };

  // Keyboard navigation inside options
  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    if (!isRemediated) {
      // DEFECTIVE REPRODUCTION:
      // grafana-ui hooks.ts caught CAUGHT_KEYS including 'Tab' and called e.preventDefault()!
      if (e.key === 'Tab') {
        e.preventDefault();
        setTrapWarning(
          'KEYBOARD TRAP TRIGGERED (Upstream Defect): Tab key was intercepted with preventDefault()! You cannot tab out of this list!'
        );
        speak(
          'Tab intercepted by upstream preventDefault() hook. Focus is permanently trapped in list.',
          'error'
        );
        return;
      }
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      const next = (index + 1) % QUICK_OPTIONS.length;
      setFocusedIndex(next);
      const opt = QUICK_OPTIONS[next];
      speak(
        isRemediated
          ? `${opt.label}, radio button, ${next + 1} of ${QUICK_OPTIONS.length}`
          : `${opt.label}, checkbox`,
        'focus'
      );
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      const prev = (index - 1 + QUICK_OPTIONS.length) % QUICK_OPTIONS.length;
      setFocusedIndex(prev);
      const opt = QUICK_OPTIONS[prev];
      speak(
        isRemediated
          ? `${opt.label}, radio button, ${prev + 1} of ${QUICK_OPTIONS.length}`
          : `${opt.label}, checkbox`,
        'focus'
      );
    } else if (e.key === 'Home') {
      e.preventDefault();
      setFocusedIndex(0);
      speak(`${QUICK_OPTIONS[0].label}, 1 of ${QUICK_OPTIONS.length}`, 'focus');
    } else if (e.key === 'End') {
      e.preventDefault();
      const last = QUICK_OPTIONS.length - 1;
      setFocusedIndex(last);
      speak(`${QUICK_OPTIONS[last].label}, ${QUICK_OPTIONS.length} of ${QUICK_OPTIONS.length}`, 'focus');
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleSelectOption(QUICK_OPTIONS[index], index);
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setIsOpen(false);
      speak('Time range picker closed. Focus restored to trigger.', 'action');
    }
  };

  return (
    <div className="space-y-6">
      {/* Workflow Context Card */}
      <div className="rounded-xl border border-[#2b3038] bg-[#14171c] p-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded bg-blue-500/10 px-2 py-0.5 text-xs font-semibold text-[#5794f2] uppercase">
                Workflow 1
              </span>
              <span className="text-xs text-gray-400">Time Range Selection & Dashboard Navigation</span>
            </div>
            <h2 className="mt-1 text-lg font-bold text-white">TimeRangePicker Component Evaluation</h2>
            <p className="mt-0.5 text-xs text-gray-400 max-w-2xl">
              Audits the top dashboard time controls (`@grafana/ui/DateTimePickers/TimeRangePicker`).
              Evaluates keyboard trapping, roving tabindex, ARIA popup states, and live announcements.
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
          <div className="mt-4 rounded-lg border border-amber-500/30 bg-amber-500/10 p-3.5 text-xs text-amber-200 space-y-1">
            <div className="flex items-center gap-2 font-semibold text-amber-300">
              <AlertCircle className="h-4 w-4 shrink-0 text-amber-400" aria-hidden="true" />
              <span>Reproduced Upstream Defects (WCAG 2.1.2, 1.3.1, 4.1.2)</span>
            </div>
            <p>
              1. <strong>Keyboard Trap</strong>: In <code>hooks.ts</code>, <code>useListFocus</code> intercepts <code>Tab</code> and calls <code>preventDefault()</code>, permanently trapping keyboard users.
            </p>
            <p>
              2. <strong>Invalid ARIA</strong>: <code>TimeRangeList.tsx</code> applies <code>role="presentation"</code> combined with <code>aria-roledescription</code> (forbidden in ARIA 1.2).
            </p>
            <p>
              3. <strong>Misleading Semantics</strong>: Options render as <code>type="checkbox"</code> despite mutually exclusive selection behavior.
            </p>
          </div>
        ) : (
          <div className="mt-4 rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3.5 text-xs text-emerald-200 space-y-1">
            <div className="flex items-center gap-2 font-semibold text-emerald-300">
              <CheckCircle className="h-4 w-4 shrink-0 text-emerald-400" aria-hidden="true" />
              <span>Engineered Remediations Active (WCAG 2.2 AA Conforming)</span>
            </div>
            <p>
              1. <strong>No Keyboard Trap</strong>: Removed <code>Tab</code> from caught keys; roving tabindex strictly manages arrow keys while allowing clean tab escape.
            </p>
            <p>
              2. <strong>Semantic Radiogroup</strong>: Replaced presentation list with <code>role="radiogroup"</code> and <code>role="radio"</code> with synchronized <code>aria-checked</code>.
            </p>
            <p>
              3. <strong>Complete ARIA States</strong>: Added <code>aria-haspopup="dialog"</code> and <code>aria-expanded</code> to the trigger.
            </p>
            <p>
              4. <strong>Polite Live Feedback</strong>: Range modifications trigger <code>aria-live="polite"</code> announcements.
            </p>
          </div>
        )}
      </div>

      {/* Interactive Component Playground */}
      <div id="workflow-target" className="rounded-xl border border-[#2b3038] bg-[#181b1f] p-6 shadow-xl">
        <div className="mb-4 flex items-center justify-between border-b border-[#252830] pb-3">
          <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
            Simulated Grafana Dashboard Toolbar
          </span>
          <span className="text-xs text-gray-400">
            Tip: Press <kbd className="rounded bg-[#2a2d35] px-1.5 py-0.5 font-mono text-[11px] text-gray-200">Tab</kbd> to focus button, then <kbd className="rounded bg-[#2a2d35] px-1.5 py-0.5 font-mono text-[11px] text-gray-200">Enter</kbd>
          </span>
        </div>

        {/* Toolbar Component */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Quick Backward Button */}
          <button
            type="button"
            className="flex items-center justify-center h-8 w-8 rounded border border-[#30343d] bg-[#22252b] text-gray-300 hover:bg-[#2c3036] hover:text-white transition focus-visible:ring-2 focus-visible:ring-[#5794f2]"
            aria-label="Move time range backwards"
            onClick={() => speak('Moved time range backwards by 6 hours', 'action')}
          >
            <ChevronLeft className="h-4 w-4" aria-hidden="true" />
          </button>

          {/* Target TimeRangePicker Button */}
          <div className="relative">
            <button
              ref={triggerRef}
              type="button"
              onClick={handleOpenToggle}
              aria-label={
                isRemediated
                  ? `Time range selected: ${selectedRange.label}`
                  : `Time range selected: ${selectedRange.label}`
              }
              aria-haspopup={isRemediated ? 'dialog' : undefined}
              aria-expanded={isRemediated ? isOpen : undefined}
              aria-controls={isRemediated && isOpen ? 'TimePickerContent' : undefined}
              className={`flex items-center gap-2 h-8 px-3 rounded border font-medium text-xs transition focus-visible:ring-2 focus-visible:ring-[#5794f2] ${
                isOpen
                  ? 'border-[#5794f2] bg-[#2a374f] text-white'
                  : 'border-[#30343d] bg-[#22252b] text-gray-200 hover:bg-[#2c3036] hover:text-white'
              }`}
            >
              <Clock className="h-3.5 w-3.5 text-[#5794f2]" aria-hidden="true" />
              <span>{selectedRange.label}</span>
            </button>

            {/* Dropdown Content */}
            {isOpen && (
              <div
                id="TimePickerContent"
                ref={dialogRef}
                role={isRemediated ? 'dialog' : undefined}
                aria-label={isRemediated ? 'Time range picker' : undefined}
                aria-modal={isRemediated ? 'true' : undefined}
                className="absolute left-0 mt-2 z-40 w-80 rounded-xl border border-[#3b404d] bg-[#1b1e24] shadow-2xl p-4 text-xs"
              >
                <div className="flex items-center justify-between border-b border-[#2a2e38] pb-2 mb-3">
                  <div className="font-semibold text-gray-200 flex items-center gap-1.5">
                    <Calendar className="h-4 w-4 text-[#5794f2]" aria-hidden="true" />
                    <span>Select Time Range</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    aria-label="Close time range dialog"
                    className="rounded p-1 text-gray-400 hover:bg-[#282c35] hover:text-white transition"
                  >
                    <X className="h-3.5 w-3.5" aria-hidden="true" />
                  </button>
                </div>

                {trapWarning && (
                  <div className="mb-3 rounded bg-rose-500/20 border border-rose-500/40 p-2 text-[11px] text-rose-200 font-semibold animate-pulse">
                    {trapWarning}
                  </div>
                )}

                {/* Quick Ranges Section */}
                <div className="space-y-1.5">
                  <div className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider px-1">
                    Quick Ranges
                  </div>

                  {/* Radiogroup or Defective List */}
                  {isRemediated ? (
                    // REMEDIATED WCAG 2.2 AA RADIOGROUP
                    <div
                      role="radiogroup"
                      aria-label="Time ranges"
                      ref={optionsRef}
                      className="space-y-0.5 rounded-lg bg-[#14161b] p-1.5 border border-[#252830]"
                    >
                      {QUICK_OPTIONS.map((opt, idx) => {
                        const isSelected = opt.label === selectedRange.label;
                        const isFocused = idx === focusedIndex;
                        return (
                          <div
                            key={opt.label}
                            role="radio"
                            aria-checked={isSelected}
                            tabIndex={isFocused ? 0 : -1}
                            onClick={() => handleSelectOption(opt, idx)}
                            onKeyDown={(e) => handleKeyDown(e, idx)}
                            onFocus={() => {
                              setFocusedIndex(idx);
                              speak(`${opt.label}, radio button, ${idx + 1} of ${QUICK_OPTIONS.length}`, 'focus');
                            }}
                            className={`flex items-center justify-between px-2.5 py-1.5 rounded cursor-pointer transition select-none ${
                              isSelected
                                ? 'bg-[#3871dc]/20 text-[#5794f2] font-semibold'
                                : 'text-gray-300 hover:bg-[#20232b]'
                            } ${isFocused ? 'ring-1 ring-[#5794f2]' : ''}`}
                          >
                            <span>{opt.label}</span>
                            {isSelected && (
                              <span className="h-1.5 w-1.5 rounded-full bg-[#5794f2]" aria-hidden="true" />
                            )}
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    // DEFECTIVE UPSTREAM LIST (Keyboard trap & checkbox semantics)
                    <ul
                      role="presentation"
                      aria-roledescription="Time range selection"
                      className="space-y-0.5 rounded-lg bg-[#14161b] p-1.5 border border-[#252830]"
                    >
                      {QUICK_OPTIONS.map((opt, idx) => {
                        const isSelected = opt.label === selectedRange.label;
                        const isFocused = idx === focusedIndex;
                        return (
                          <li key={opt.label} className="relative">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              tabIndex={-1}
                              onChange={() => handleSelectOption(opt, idx)}
                              className="sr-only"
                              id={`defective-opt-${idx}`}
                            />
                            <label
                              htmlFor={`defective-opt-${idx}`}
                              tabIndex={isFocused ? 0 : -1}
                              onKeyDown={(e) => handleKeyDown(e, idx)}
                              onClick={() => handleSelectOption(opt, idx)}
                              onFocus={() => {
                                setFocusedIndex(idx);
                                speak(`${opt.label}, checkbox`, 'focus');
                              }}
                              className={`flex items-center justify-between px-2.5 py-1.5 rounded cursor-pointer transition select-none ${
                                isSelected
                                  ? 'bg-[#3871dc]/20 text-[#5794f2] font-semibold'
                                  : 'text-gray-300 hover:bg-[#20232b]'
                              } ${isFocused ? 'ring-1 ring-rose-500' : ''}`}
                            >
                              <span>{opt.label}</span>
                              <span className="text-[10px] text-gray-500">(checkbox)</span>
                            </label>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </div>

                {/* Additional Dialog Controls (Tabbing Target) */}
                <div className="mt-3 pt-3 border-t border-[#2a2e38] space-y-2">
                  <div className="text-[11px] font-medium text-gray-400">Custom Range Inputs:</div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      defaultValue="now-6h"
                      aria-label="From custom time"
                      className="w-1/2 rounded bg-[#121418] border border-[#30343d] px-2 py-1 text-xs text-white focus-visible:ring-1 focus-visible:ring-[#5794f2]"
                    />
                    <input
                      type="text"
                      defaultValue="now"
                      aria-label="To custom time"
                      className="w-1/2 rounded bg-[#121418] border border-[#30343d] px-2 py-1 text-xs text-white focus-visible:ring-1 focus-visible:ring-[#5794f2]"
                    />
                  </div>
                  <div className="flex justify-end gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setIsOpen(false)}
                      className="px-2.5 py-1 rounded bg-[#2b2f38] text-gray-300 hover:bg-[#353a45] text-xs transition"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setIsOpen(false);
                        const msg = `Applied custom range: now-6h to now`;
                        setLivePoliteMessage(msg);
                        speak(msg, 'announcement');
                      }}
                      className="px-2.5 py-1 rounded bg-[#3871dc] text-white hover:bg-[#2f5ebb] text-xs font-medium transition"
                    >
                      Apply Range
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Quick Forward Button */}
          <button
            type="button"
            className="flex items-center justify-center h-8 w-8 rounded border border-[#30343d] bg-[#22252b] text-gray-300 hover:bg-[#2c3036] hover:text-white transition focus-visible:ring-2 focus-visible:ring-[#5794f2]"
            aria-label="Move time range forwards"
            onClick={() => speak('Moved time range forwards by 6 hours', 'action')}
          >
            <ChevronRight className="h-4 w-4" aria-hidden="true" />
          </button>

          {/* Zoom Out Button */}
          <button
            type="button"
            className="flex items-center justify-center h-8 w-8 rounded border border-[#30343d] bg-[#22252b] text-gray-300 hover:bg-[#2c3036] hover:text-white transition focus-visible:ring-2 focus-visible:ring-[#5794f2]"
            aria-label="Zoom out time range"
            onClick={() => {
              const msg = 'Zoomed out time range to Last 12 hours';
              setSelectedRange(QUICK_OPTIONS[6]);
              setLivePoliteMessage(msg);
              speak(msg, 'announcement');
            }}
          >
            <ZoomOut className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      </div>
    </div>
  );
};
