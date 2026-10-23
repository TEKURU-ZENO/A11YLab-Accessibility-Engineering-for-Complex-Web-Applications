import React, { useState } from 'react';
import { A11yProvider, useA11y } from './context/A11yContext';
import { TimeRangePickerDemo } from './components/Workflow1_TimeRangePicker/TimeRangePickerDemo';
import { ChartAccessibilityDemo } from './components/Workflow2_ChartAccessibility/ChartAccessibilityDemo';
import { AlertBuilderDemo } from './components/Workflow3_AlertBuilder/AlertBuilderDemo';
import { DiffViewer } from './components/DiffViewer/DiffViewer';
import { AuditReportViewer } from './components/AuditReportViewer';
import { AxeScanner } from './components/AxeRunner/AxeScanner';
import { SpeechViewer } from './components/VirtualScreenReader/SpeechViewer';
import {
  Clock,
  BarChart2,
  Bell,
  GitPullRequest,
  ShieldCheck,
  ToggleLeft,
  ToggleRight,
  Sun,
  Moon,
  Apple,
  ExternalLink,
  Code2,
} from 'lucide-react';

type TabKey = 'w1' | 'w2' | 'w3' | 'diffs' | 'report';

const AppContent: React.FC = () => {
  const { isRemediated, setIsRemediated, isHighContrast, setIsHighContrast, speak } = useA11y();
  const [activeTab, setActiveTab] = useState<TabKey>('w1');

  const handleToggleRemediated = () => {
    const nextVal = !isRemediated;
    setIsRemediated(nextVal);
    speak(
      nextVal
        ? 'Switched to Remediated WCAG 2.2 AA mode. All fixes active.'
        : 'Switched to Upstream Defective mode. Baseline accessibility issues active.',
      'action'
    );
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#111217] text-[#d8d9da]">
      {/* Top Banner & Header */}
      <header className="border-b border-[#252830] bg-[#181b1f]/90 backdrop-blur sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center justify-between gap-4 py-3">
            {/* Logo & Project Title */}
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-[#3871dc] to-[#5794f2] text-white font-bold shadow-md shadow-blue-500/20">
                A11Y
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-sm font-bold text-white tracking-wide">
                    A11YLab — Web Accessibility Engineering
                  </h1>
                  <span className="rounded bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-300 border border-emerald-500/30">
                    Apple Web A11Y Benchmark
                  </span>
                </div>
                <p className="text-xs text-gray-400">
                  Target Application: <strong>Grafana</strong> · Evidence-Backed Remediation & Assistive Tech Evaluation
                </p>
              </div>
            </div>

            {/* Global Controls: State Toggle & Contrast */}
            <div className="flex flex-wrap items-center gap-3">
              {/* Remediated vs Defective Toggle */}
              <div className="flex items-center gap-2 rounded-xl border border-[#30343d] bg-[#14161b] px-3 py-1.5 shadow-inner">
                <span className="text-xs font-medium text-gray-400">Mode:</span>
                <button
                  type="button"
                  onClick={handleToggleRemediated}
                  aria-label={`Toggle accessibility state. Currently ${
                    isRemediated ? 'Remediated WCAG 2.2 AA' : 'Upstream Defective'
                  }`}
                  className="flex items-center gap-2 text-xs font-semibold focus-visible:ring-2 focus-visible:ring-[#5794f2] rounded"
                >
                  <span className={!isRemediated ? 'text-rose-400' : 'text-gray-500'}>
                    Upstream Defect
                  </span>
                  {isRemediated ? (
                    <ToggleRight className="h-6 w-6 text-emerald-400" aria-hidden="true" />
                  ) : (
                    <ToggleLeft className="h-6 w-6 text-rose-400" aria-hidden="true" />
                  )}
                  <span className={isRemediated ? 'text-emerald-300' : 'text-gray-500'}>
                    Remediated (WCAG 2.2 AA)
                  </span>
                </button>
              </div>

              {/* High Contrast Mode Toggle */}
              <button
                type="button"
                onClick={() => setIsHighContrast(!isHighContrast)}
                title="Toggle High Contrast Mode simulation"
                aria-label={`Toggle high contrast mode. Currently ${isHighContrast ? 'enabled' : 'disabled'}`}
                className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition ${
                  isHighContrast
                    ? 'border-yellow-400 bg-yellow-400/10 text-yellow-300'
                    : 'border-[#30343d] bg-[#1c1f26] text-gray-300 hover:bg-[#252932]'
                }`}
              >
                {isHighContrast ? (
                  <Sun className="h-3.5 w-3.5 text-yellow-400" aria-hidden="true" />
                ) : (
                  <Moon className="h-3.5 w-3.5" aria-hidden="true" />
                )}
                <span>Contrast</span>
              </button>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav aria-label="Workflow Navigation" className="flex space-x-1 border-t border-[#252830] pt-1">
            <button
              type="button"
              onClick={() => setActiveTab('w1')}
              aria-current={activeTab === 'w1' ? 'page' : undefined}
              className={`flex items-center gap-2 px-3 py-2 text-xs font-medium border-b-2 transition ${
                activeTab === 'w1'
                  ? 'border-[#5794f2] text-white bg-[#1c2029]'
                  : 'border-transparent text-gray-400 hover:text-gray-200 hover:border-gray-600'
              }`}
            >
              <Clock className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Workflow 1: TimeRangePicker</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('w2')}
              aria-current={activeTab === 'w2' ? 'page' : undefined}
              className={`flex items-center gap-2 px-3 py-2 text-xs font-medium border-b-2 transition ${
                activeTab === 'w2'
                  ? 'border-[#5794f2] text-white bg-[#1c2029]'
                  : 'border-transparent text-gray-400 hover:text-gray-200 hover:border-gray-600'
              }`}
            >
              <BarChart2 className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Workflow 2: Charts & VizLegend</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('w3')}
              aria-current={activeTab === 'w3' ? 'page' : undefined}
              className={`flex items-center gap-2 px-3 py-2 text-xs font-medium border-b-2 transition ${
                activeTab === 'w3'
                  ? 'border-[#5794f2] text-white bg-[#1c2029]'
                  : 'border-transparent text-gray-400 hover:text-gray-200 hover:border-gray-600'
              }`}
            >
              <Bell className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Workflow 3: Alert Rule Builder</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('diffs')}
              aria-current={activeTab === 'diffs' ? 'page' : undefined}
              className={`flex items-center gap-2 px-3 py-2 text-xs font-medium border-b-2 transition ${
                activeTab === 'diffs'
                  ? 'border-[#5794f2] text-white bg-[#1c2029]'
                  : 'border-transparent text-gray-400 hover:text-gray-200 hover:border-gray-600'
              }`}
            >
              <GitPullRequest className="h-3.5 w-3.5 text-emerald-400" aria-hidden="true" />
              <span>Upstream PR Patches</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('report')}
              aria-current={activeTab === 'report' ? 'page' : undefined}
              className={`flex items-center gap-2 px-3 py-2 text-xs font-medium border-b-2 transition ${
                activeTab === 'report'
                  ? 'border-[#5794f2] text-white bg-[#1c2029]'
                  : 'border-transparent text-gray-400 hover:text-gray-200 hover:border-gray-600'
              }`}
            >
              <ShieldCheck className="h-3.5 w-3.5 text-purple-400" aria-hidden="true" />
              <span>WCAG 2.2 AA Audit Matrix</span>
            </button>
          </nav>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {activeTab === 'w1' && (
          <div className="space-y-6">
            <TimeRangePickerDemo />
            <AxeScanner targetSelector="#workflow-target" workflowName="TimeRangePicker (Workflow 1)" />
          </div>
        )}

        {activeTab === 'w2' && (
          <div className="space-y-6">
            <ChartAccessibilityDemo />
            <AxeScanner targetSelector="#workflow-target" workflowName="TimeSeries & VizLegend (Workflow 2)" />
          </div>
        )}

        {activeTab === 'w3' && (
          <div className="space-y-6">
            <AlertBuilderDemo />
            <AxeScanner targetSelector="#workflow-target" workflowName="Alert Rule Builder (Workflow 3)" />
          </div>
        )}

        {activeTab === 'diffs' && <DiffViewer />}

        {activeTab === 'report' && <AuditReportViewer />}
      </main>

      {/* Global Virtual Screen Reader Speech Viewer */}
      <SpeechViewer />

      {/* Footer */}
      <footer className="border-t border-[#252830] bg-[#14161b] py-4 text-xs text-gray-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-wrap items-center justify-between gap-2">
          <div>
            A11YLab Flagship Case Study · Produced for Apple Web Accessibility Engineering Evaluation
          </div>
          <div className="flex items-center gap-4">
            <span>WCAG 2.2 Level AA</span>
            <span>WAI-ARIA 1.2 / 1.3</span>
            <span>Apple VoiceOver & NVDA Verified</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <A11yProvider>
      <AppContent />
    </A11yProvider>
  );
};

export default App;
