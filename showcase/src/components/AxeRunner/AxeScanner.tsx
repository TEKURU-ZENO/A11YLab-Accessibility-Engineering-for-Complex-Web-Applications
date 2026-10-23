import React, { useState } from 'react';
import axe, { AxeResults, Result } from 'axe-core';
import { Play, CheckCircle2, AlertTriangle, AlertCircle, Info, RefreshCw } from 'lucide-react';

interface AxeScannerProps {
  targetSelector?: string;
  workflowName: string;
}

export const AxeScanner: React.FC<AxeScannerProps> = ({ targetSelector = '#workflow-target', workflowName }) => {
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [results, setResults] = useState<AxeResults | null>(null);

  const runAudit = async () => {
    setIsRunning(true);
    try {
      const targetElement = document.querySelector(targetSelector) || document.body;
      const axeResults = await axe.run(targetElement as HTMLElement, {
        runOnly: {
          type: 'tag',
          values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa', 'best-practice'],
        },
      });
      setResults(axeResults);
    } catch (err) {
      console.error('Axe scan failed:', err);
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="rounded-xl border border-[#2b3038] bg-[#14171c] p-4 text-sm">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#252830] pb-3">
        <div className="flex items-center gap-2">
          <div className="rounded-lg bg-blue-500/10 p-2 text-[#5794f2]">
            <Play className="h-4 w-4" aria-hidden="true" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-200">axe-core Automated Engine</h3>
            <p className="text-xs text-gray-400">
              Evaluates DOM nodes against WCAG 2.2 AA rulesets for {workflowName}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={runAudit}
          disabled={isRunning}
          className="flex items-center gap-2 rounded-lg bg-[#3871dc] px-3.5 py-1.5 font-medium text-white hover:bg-[#2f5ebb] transition disabled:opacity-50"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${isRunning ? 'animate-spin' : ''}`} aria-hidden="true" />
          <span>{isRunning ? 'Auditing DOM...' : 'Run axe-core Scan'}</span>
        </button>
      </div>

      {results && (
        <div className="mt-4 space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <div className="rounded-lg bg-[#1a1e24] p-2.5 border border-[#262a33]">
              <div className="text-xs text-gray-400">Violations</div>
              <div className={`text-xl font-bold ${results.violations.length > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                {results.violations.length}
              </div>
            </div>
            <div className="rounded-lg bg-[#1a1e24] p-2.5 border border-[#262a33]">
              <div className="text-xs text-gray-400">Passed Rules</div>
              <div className="text-xl font-bold text-emerald-400">{results.passes.length}</div>
            </div>
            <div className="rounded-lg bg-[#1a1e24] p-2.5 border border-[#262a33]">
              <div className="text-xs text-gray-400">Incomplete</div>
              <div className="text-xl font-bold text-amber-400">{results.incomplete.length}</div>
            </div>
            <div className="rounded-lg bg-[#1a1e24] p-2.5 border border-[#262a33]">
              <div className="text-xs text-gray-400">Inapplicable</div>
              <div className="text-xl font-bold text-gray-500">{results.inapplicable.length}</div>
            </div>
          </div>

          {results.violations.length === 0 ? (
            <div className="flex items-center gap-3 rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3 text-emerald-300">
              <CheckCircle2 className="h-5 w-5 shrink-0" aria-hidden="true" />
              <div>
                <div className="font-semibold text-emerald-200">Zero Automated Violations</div>
                <div className="text-xs text-emerald-400/90">
                  Target container passed all evaluated W3C WCAG 2.2 Level A and AA automated rules.
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-2.5">
              <div className="text-xs font-semibold text-rose-400 uppercase tracking-wider">
                Detected Violations ({results.violations.length})
              </div>
              {results.violations.map((violation: Result) => (
                <div
                  key={violation.id}
                  className="rounded-lg border border-rose-500/30 bg-rose-500/5 p-3 text-xs"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="font-semibold text-rose-300 flex items-center gap-1.5">
                      <AlertCircle className="h-4 w-4 shrink-0 text-rose-400" aria-hidden="true" />
                      <span>{violation.id}</span>
                      <span className="rounded bg-rose-500/20 px-1.5 py-0.5 text-[10px] text-rose-300 uppercase">
                        {violation.impact || 'minor'}
                      </span>
                    </div>
                    <div className="flex gap-1">
                      {violation.tags.slice(0, 3).map((tag: string) => (
                        <span key={tag} className="rounded bg-[#20242c] px-1 py-0.5 text-[10px] text-gray-400">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                  <p className="mt-1 text-gray-300">{violation.help}</p>
                  <div className="mt-2 rounded bg-[#0f1115] p-2 font-mono text-[11px] text-gray-400">
                    <div className="font-medium text-gray-300 mb-0.5">Affected selector(s):</div>
                    {violation.nodes.map((node, i) => (
                      <div key={i} className="text-rose-300/90 truncate">
                        {node.target.join(' ')}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
