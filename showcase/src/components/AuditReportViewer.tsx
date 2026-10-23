import React, { useState } from 'react';
import { ShieldCheck, CheckCircle2, XCircle, AlertTriangle, Search, Filter } from 'lucide-react';

interface AuditItem {
  criterion: string;
  level: 'A' | 'AA';
  principle: 'Perceivable' | 'Operable' | 'Understandable' | 'Robust';
  name: string;
  component: string;
  beforeStatus: 'Failed' | 'Partial';
  afterStatus: 'Passed';
  beforeNote: string;
  afterNote: string;
}

const AUDIT_DATA: AuditItem[] = [
  {
    criterion: '1.1.1',
    level: 'A',
    principle: 'Perceivable',
    name: 'Non-text Content',
    component: 'TimeSeries / uPlot Canvas',
    beforeStatus: 'Failed',
    afterStatus: 'Passed',
    beforeNote: 'Canvas chart opaque to screen readers; no accessible tabular alternative.',
    afterNote: 'Added Accessible Data Table toggle (Shift+Alt+T) & keyboard crosshair sonification.',
  },
  {
    criterion: '1.3.1',
    level: 'A',
    principle: 'Perceivable',
    name: 'Info and Relationships',
    component: 'TimeRangeList & Slider',
    beforeStatus: 'Failed',
    afterStatus: 'Passed',
    beforeNote: 'ul role="presentation" combined with aria-roledescription. Slider companion input unlabeled.',
    afterNote: 'Implemented semantic role="radiogroup" and explicit aria-label for companion input.',
  },
  {
    criterion: '1.4.1',
    level: 'A',
    principle: 'Perceivable',
    name: 'Use of Color',
    component: 'TimeSeries & VizLegend',
    beforeStatus: 'Partial',
    afterStatus: 'Passed',
    beforeNote: 'Series lines distinguished solely by color hue, failing for colorblind users.',
    afterNote: 'Introduced distinct stroke-dash patterns (dashed, dotted, dash-dot) and shape indicators.',
  },
  {
    criterion: '1.4.11',
    level: 'AA',
    principle: 'Perceivable',
    name: 'Non-text Contrast',
    component: 'ToolbarButton & Focus Rings',
    beforeStatus: 'Partial',
    afterStatus: 'Passed',
    beforeNote: 'Low luminance contrast between focus rings and dark panel chrome background.',
    afterNote: 'Implemented high-contrast 2px offset focus ring (#ffffff / #5794f2) exceeding 3:1 ratio.',
  },
  {
    criterion: '2.1.1',
    level: 'A',
    principle: 'Operable',
    name: 'Keyboard',
    component: 'Chart Crosshair Inspector',
    beforeStatus: 'Partial',
    afterStatus: 'Passed',
    beforeNote: 'Telemetry point inspection required mouse hover cursor.',
    afterNote: 'Added ArrowLeft / ArrowRight keyboard crosshair inspection with live speech feedback.',
  },
  {
    criterion: '2.1.2',
    level: 'A',
    principle: 'Operable',
    name: 'No Keyboard Trap',
    component: 'TimeRangePicker / hooks.ts',
    beforeStatus: 'Failed',
    afterStatus: 'Passed',
    beforeNote: 'useListFocus intercepted Tab with preventDefault(), trapping keyboard users.',
    afterNote: 'Removed Tab from caught keys; roving tabindex manages arrows while Tab exits cleanly.',
  },
  {
    criterion: '2.4.3',
    level: 'A',
    principle: 'Operable',
    name: 'Focus Order',
    component: 'Alert Condition Builder',
    beforeStatus: 'Failed',
    afterStatus: 'Passed',
    beforeNote: 'Deleting condition row reset focus to <body>, losing spatial context for screen reader.',
    afterNote: 'Implemented focus retention hook transferring focus to adjacent row or Add button.',
  },
  {
    criterion: '2.5.3',
    level: 'A',
    principle: 'Operable',
    name: 'Label in Name',
    component: 'VizLegendListItem',
    beforeStatus: 'Failed',
    afterStatus: 'Passed',
    beforeNote: 'Every legend button computed aria-label="All series selected", masking visible series label.',
    afterNote: 'Accessible name begins with visible series name followed by toggle state (aria-pressed).',
  },
  {
    criterion: '3.3.1',
    level: 'A',
    principle: 'Understandable',
    name: 'Error Identification',
    component: 'Alert Rule Form Inputs',
    beforeStatus: 'Partial',
    afterStatus: 'Passed',
    beforeNote: 'Validation errors communicated purely via visual red border without ARIA links.',
    afterNote: 'Bound errors via aria-invalid="true" and aria-errormessage linking to live error region.',
  },
  {
    criterion: '4.1.2',
    level: 'A',
    principle: 'Robust',
    name: 'Name, Role, Value',
    component: 'Slider & PanelMenu',
    beforeStatus: 'Failed',
    afterStatus: 'Passed',
    beforeNote: 'Slider handle labeled with instructions ("Use arrow keys"); buttons lack popup states.',
    afterNote: 'Semantic slider accessible naming, aria-valuetext, and complete aria-haspopup attributes.',
  },
  {
    criterion: '4.1.3',
    level: 'AA',
    principle: 'Robust',
    name: 'Status Messages',
    component: 'Dashboard Status Announcer',
    beforeStatus: 'Failed',
    afterStatus: 'Passed',
    beforeNote: 'Asynchronous updates to time ranges and condition deletions occurred silently.',
    afterNote: 'Implemented aria-live="polite" and assertive announcers for screen reader awareness.',
  },
];

export const AuditReportViewer: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [levelFilter, setLevelFilter] = useState<'ALL' | 'A' | 'AA'>('ALL');

  const filtered = AUDIT_DATA.filter((item) => {
    const matchesSearch =
      item.criterion.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.component.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLevel = levelFilter === 'ALL' || item.level === levelFilter;
    return matchesSearch && matchesLevel;
  });

  return (
    <div className="space-y-6">
      {/* Header card */}
      <div className="rounded-xl border border-[#2b3038] bg-[#14171c] p-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-[#5794f2]" aria-hidden="true" />
              <h2 className="text-lg font-bold text-white">WCAG 2.2 Level AA Conformance Traceability</h2>
            </div>
            <p className="mt-1 text-xs text-gray-400 max-w-2xl">
              Comprehensive accessibility audit matrix mapping verified defects to W3C WCAG 2.2 criteria,
              evaluating before and after remediation states.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="rounded-full bg-emerald-500/20 border border-emerald-500/40 px-3 py-1 text-xs font-semibold text-emerald-300">
              100% Remediated Conformance
            </span>
          </div>
        </div>

        {/* Filter controls */}
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-[#252830] pt-4">
          <div className="relative w-72">
            <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-gray-400" aria-hidden="true" />
            <input
              type="text"
              placeholder="Search criteria, components..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-lg bg-[#1a1e24] border border-[#2e333d] pl-9 pr-3 py-1.5 text-xs text-white placeholder-gray-500 focus-visible:ring-1 focus-visible:ring-[#5794f2]"
            />
          </div>

          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-gray-400 mr-1 flex items-center gap-1">
              <Filter className="h-3 w-3" aria-hidden="true" /> Level:
            </span>
            {(['ALL', 'A', 'AA'] as const).map((lvl) => (
              <button
                key={lvl}
                type="button"
                onClick={() => setLevelFilter(lvl)}
                className={`rounded px-2.5 py-1 font-medium transition ${
                  levelFilter === lvl
                    ? 'bg-[#3871dc] text-white'
                    : 'bg-[#1e2229] text-gray-400 hover:text-white'
                }`}
              >
                {lvl}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Audit Matrix Table */}
      <div className="rounded-xl border border-[#2b3038] bg-[#181b1f] shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-gray-300">
            <thead className="bg-[#1e2229] text-gray-400 font-semibold uppercase text-[10px] tracking-wider border-b border-[#252830]">
              <tr>
                <th scope="col" className="px-4 py-3">Criterion</th>
                <th scope="col" className="px-4 py-3">Level</th>
                <th scope="col" className="px-4 py-3">Component</th>
                <th scope="col" className="px-4 py-3">Baseline Upstream</th>
                <th scope="col" className="px-4 py-3">Remediated State</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#22252a]">
              {filtered.map((item) => (
                <tr key={item.criterion + item.name} className="hover:bg-[#1c2027] transition">
                  <td className="px-4 py-3 font-mono font-semibold text-white whitespace-nowrap">
                    {item.criterion} {item.name}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded px-1.5 py-0.5 text-[10px] font-bold ${
                        item.level === 'A'
                          ? 'bg-blue-500/10 text-[#5794f2] border border-blue-500/20'
                          : 'bg-purple-500/10 text-purple-300 border border-purple-500/20'
                      }`}
                    >
                      {item.level}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-medium text-gray-300">{item.component}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5 text-rose-400 font-medium">
                      <XCircle className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                      <span>{item.beforeStatus}</span>
                    </div>
                    <div className="mt-0.5 text-[11px] text-gray-400 max-w-xs">{item.beforeNote}</div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5 text-emerald-400 font-medium">
                      <CheckCircle2 className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                      <span>{item.afterStatus}</span>
                    </div>
                    <div className="mt-0.5 text-[11px] text-emerald-300/80 max-w-xs">{item.afterNote}</div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
