# A11YLab — Accessibility Engineering for Complex Web Applications
### Flagship Case Study · Open-Source Remediation · Assistive Technology Testing · Regression Protection
**Target Application:** Grafana (Data-dense Observability & Analytics Platform)  
**Standards:** W3C Web Content Accessibility Guidelines (WCAG) 2.2 Level AA · WAI-ARIA 1.2 / 1.3 · W3C ARIA Authoring Practices Guide (APG)  

---

## 1. Executive Summary & Engineering Mission

Modern enterprise web applications—especially monitoring dashboards, telemetry tools, and cloud consoles—exhibit extreme interactive density. While consumer-facing content sites can often achieve high compliance through automated linters alone, data-dense applications like **Grafana** present compound accessibility challenges:
- High-frequency time-series telemetry rendered directly onto HTML5 `<canvas>`.
- Multi-tiered roving tabindex navigation models and dynamic flyout menus.
- Complex state-driven dialogs, popovers, and drawer overlays.
- Dynamic condition and query expression builders where DOM mutations easily disorient assistive technologies.

**A11YLab** is an engineering case study in auditing, diagnosing, and remediating high-complexity client-side workflows:
1. **Real-world Audit & Root Cause Analysis**: Establishing an automated baseline with Lighthouse and axe-core, followed by deep manual source code investigations rather than superficial warning counts.
2. **Deep Semantic Remediation**: Authoring production-ready patches for upstream Grafana components with semantic HTML, accessible names, keyboard ergonomics, roving tabindex, focus management, and screen-reader announcements.
3. **Assistive Technology Parity**: Testing and documenting exact reading flow, rotor behavior, and speech synthesis differences across **VoiceOver** (macOS / iOS Safari) and **NVDA** (Windows Chrome / Edge).
4. **Regression Protection**: Implementing automated Playwright tests powered by `@axe-core/playwright` asserting on both automated rulesets and critical behavioral accessibility journeys.
5. **Engineering Judgment**: Prioritizing real user equivalence over audit score inflation, scoping to three high-impact workflows, and producing upstream git patches ready for contribution.

---

## 2. Scoped Workflows & Defect Analysis

Per project constraints, the scope focuses on three representative workflows from `grafana/grafana`:

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                                   A11YLab Workflows                                    │
├──────────────────────────┬─────────────────────────────┬───────────────────────────────┤
│ Workflow 1: Navigation   │ Workflow 2: Charts & Panels │ Workflow 3: Alert Builder     │
│ TimeRangePicker          │ TimeSeries & VizLegend      │ Unified Alerting & Slider     │
├──────────────────────────┼─────────────────────────────┼───────────────────────────────┤
│ • Keyboard Trap (2.1.2)  │ • Label in Name (2.5.3)     │ • Focus Drop to Body (2.4.3)  │
│ • Presentation Role+ARIA │ • Canvas Graph (1.1.1)      │ • Instructional Name (4.1.2)  │
│ • Checkbox vs Radio      │ • Color-Only Series (1.4.1) │ • Companion Input (1.3.1)     │
│ • Live Status Feedback   │ • Accessible Data Table     │ • Accessible Errors (3.3.1)   │
└──────────────────────────┴─────────────────────────────┴───────────────────────────────┘
```

### Detailed Breakdown

| Workflow | Target Component | WCAG Criterion | Upstream Defect Description | Engineered Remediation |
| :--- | :--- | :--- | :--- | :--- |
| **Workflow 1: Navigation** | `TimeRangePicker/hooks.ts` | **WCAG 2.1.2 (Level A)** | In `useListFocus`, `'Tab'` was included in `CAUGHT_KEYS` with `event.preventDefault()`, trapping keyboard users permanently in the option list. | Removed `'Tab'` from caught keys. Directional arrow keys strictly manage roving tabindex, while `Tab` cleanly exits the list. |
| **Workflow 1: Navigation** | `TimeRangeList.tsx` | **WCAG 1.3.1 (Level A)** | `<ul role="presentation" aria-roledescription="Time range selection">` violates ARIA 1.2 rules against roledescription on presentation elements. | Replaced with semantic `<ul role="radiogroup" aria-label="Time ranges">` and `<input type="radio">`. |
| **Workflow 1: Navigation** | `TimeRangePicker.tsx` | **WCAG 4.1.2 (Level A)** | Trigger button omitted `aria-haspopup="dialog"` and `aria-expanded` state. | Added explicit popup, expanded attributes, and `aria-controls` referencing dialog container. |
| **Workflow 2: Visualization** | `VizLegendListItem.tsx` | **WCAG 2.5.3 (Level A)** | When all series are visible, `aria-label="All series selected"` was hardcoded on every button, completely masking the visible series name. | Accessible name begins with visible label (`item.label`), adds `aria-pressed`, and indicates isolation intent. |
| **Workflow 2: Visualization** | `uPlot` Canvas Panel | **WCAG 1.1.1 (Level A)** | Telemetry curves rendered purely via `<canvas>` without textual data fallback or table toggle. | Built Accessible Data Table Alternative (`Alt+T`) and keyboard crosshair inspector with live audio speech feedback. |
| **Workflow 2: Visualization** | TimeSeries Curves | **WCAG 1.4.1 (Level A)** | Series differentiated only by stroke color hue. | Added distinct line dash patterns (`dashed`, `dotted`, `dash-dot`) and high-contrast SVG marker borders. |
| **Workflow 3: Alert Builder** | `public/app/features/alerting` | **WCAG 2.4.3 (Level A)** | When deleting a condition row, React removed the focused node, causing browser focus to drop to `document.body`. | Implemented focus retention hook transferring focus to next adjacent row or Add button with live deletion status. |
| **Workflow 3: Alert Builder** | `Slider/Slider.tsx` | **WCAG 4.1.2 (Level A)** | Handle `aria-label` defaulted to *"Use arrow keys to change the value"* (instruction instead of element name). | Handle named with parameter; instructions routed through `aria-describedby`; unit-aware `aria-valuetext` added. |
| **Workflow 3: Alert Builder** | `Slider/Slider.tsx` | **WCAG 1.3.1 (Level A)** | Companion numeric input lacked `aria-label` or `<label>`, triggering axe-core violations. | Added explicit `aria-label` linked to slider property. |

---

## 3. Assistive Technology Comparative Evaluation: VoiceOver vs NVDA

Web accessibility engineers must understand how assistive technologies parse accessibility APIs. The table below contrasts **VoiceOver** (macOS Sonoma / iOS Safari via WebKit AX API) against **NVDA** (Windows 11 via Microsoft UI Automation & IAccessible2):

```
┌─────────────────────────────────┬────────────────────────────────────────────────────────┐
│ Assistive Technology            │ Architecture & Reading Mechanics                       │
├─────────────────────────────────┼────────────────────────────────────────────────────────┤
│ VoiceOver                       │ • Direct live DOM interaction (no decoupled buffer)    │
│ (macOS Sonoma / Safari 17)      │ • Web Rotor (VO + U) indexes Landmarks, Forms, Tables  │
│                                 │ • Strict on Label in Name (WCAG 2.5.3) for Voice Control│
├─────────────────────────────────┼────────────────────────────────────────────────────────┤
│ NVDA                            │ • Decoupled off-screen Virtual Buffer (Browse Mode)    │
│ (Windows 11 / Chrome & Edge)    │ • Automatic chime and mode switch to Focus Mode         │
│                                 │ • Single-key traversal (D=Landmark, T=Table, F=Form)    │
└─────────────────────────────────┴────────────────────────────────────────────────────────┘
```

### Verbatim Speech Output: Real-world Screen Reader Transcripts

#### VizLegend Item Selection (Workflow 2)
- **Before Remediation**:
  - **VoiceOver**: `"All series selected, button"` (Spoken identically for all 4 series in the Rotor).
  - **NVDA**: `"All series selected button"`.
  - **Voice Control (Speech Dictation)**: *"Click API Gateway Requests"* ➔ **FAILED** (Visible text did not match accessible name).
- **After Remediation**:
  - **VoiceOver**: `"API Gateway Requests, visible, toggle button, selected"`
  - **NVDA**: `"API Gateway Requests, visible button pressed"`.
  - **Voice Control**: *"Click API Gateway Requests"* ➔ **SUCCESS**.

#### TimeRangePicker Trigger Button & Radiogroup (Workflow 1)
- **Before Remediation**:
  - **VoiceOver**: `"Time range selected: Last 6 hours, button"` (Missing popup trait and expanded state).
  - Inside Quick Ranges list: Pressing `Tab` results in silence; focus is trapped by `event.preventDefault()`.
- **After Remediation**:
  - **VoiceOver**: `"Time range selected: Last 6 hours, pop-up button, expanded"`
  - Inside Quick Ranges list: `"Last 6 hours, selected, radio button, 6 of 8, Time ranges"`. Pressing `Tab` exits smoothly to the custom range text input.
  - Live Region: `"Time range updated to Last 24 hours. Refreshing dashboard panels."`

#### Condition Row Deletion in Alert Builder (Workflow 3)
- **Before Remediation**:
  - User activates "Delete Condition B".
  - **VoiceOver**: `"Web content"` (Focus dropped to document root `<body>`).
  - **NVDA**: Exits Focus mode, resets cursor to top of Virtual Buffer.
- **After Remediation**:
  - User activates "Delete Condition B".
  - **Live Announcer (`aria-live="polite"`)**: `"Condition B removed. 2 conditions remaining in rule."`
  - **VoiceOver**: Focus transferred cleanly to `"Condition C (Pod Memory Leak), region"`.

---

## 4. Repository Structure

```
A11YLab/
├── README.md                                  # Flagship engineering documentation & technical breakdown
├── package.json                               # Top-level scripts (dev, build, audit, verify)
├── docs/
│   ├── ACCESSIBILITY_AUDIT_REPORT.md         # Full WCAG 2.2 AA Conformance Traceability Matrix
│   ├── ASSISTIVE_TECH_EVALUATION.md          # VoiceOver vs NVDA comparative testing analysis
│   └── UPSTREAM_PR_PROPOSALS/
│       ├── PR_01_TIMERANGEPICKER_REMEDIATION.md # TimeRangePicker PR proposal
│       ├── PR_02_VIZLEGEND_CHART_ACCESSIBILITY.md# VizLegend & Chart Table PR proposal
│       └── PR_03_SLIDER_ALERTING_FOCUS_ORDER.md # Slider & Alert Focus PR proposal
├── patches/                                   # Verified Git format patches for grafana/grafana
│   ├── 0001-fix-timerangepicker-keyboard-trap-and-aria.patch
│   ├── 0002-fix-vizlegend-accessible-names-and-chart-table.patch
│   └── 0003-fix-slider-accessible-naming-and-alert-focus.patch
├── e2e/                                       # Playwright + axe-core automated regression test suite
│   ├── playwright.config.ts                   # Multi-browser Playwright configuration
│   └── tests/
│       ├── workflow-1-timerangepicker.spec.ts # TimeRangePicker axe + keyboard trap tests
│       ├── workflow-2-chart-legend.spec.ts    # Chart axe + Label-in-Name + table toggle tests
│       └── workflow-3-alert-builder.spec.ts   # Alert slider + focus retention tests
├── showcase/                                  # Interactive Verification Workbench (Vite + React)
│   ├── src/
│   │   ├── components/
│   │   │   ├── Workflow1_TimeRangePicker/     # Before & After TimePicker implementations
│   │   │   ├── Workflow2_ChartAccessibility/  # Canvas chart + Accessible table + Crosshair
│   │   │   ├── Workflow3_AlertBuilder/        # Dynamic rule rows with focus management
│   │   │   ├── VirtualScreenReader/           # Live Speech Viewer (VoiceOver / NVDA logs)
│   │   │   ├── AxeRunner/                     # In-browser axe-core 4.10.2 runner
│   │   │   └── DiffViewer/                    # Side-by-side upstream patch inspector
│   │   ├── context/A11yContext.tsx            # Global a11y state, speech synthesis logger
│   │   └── App.tsx                            # Showcase workbench shell
│   └── package.json
└── scripts/
    ├── run-audit.js                           # Automated Node ruleset auditor
    └── verify-all.ps1                         # PowerShell end-to-end verification script
```

---

## 5. Upstream Patches & Clean Verification

The patch files in `/patches` were generated directly against a clone of `grafana/grafana` using `git format-patch` with real commit authorship (`Dev Mehta <devmehta060505@gmail.com>`). All three patches pass `git apply --check` cleanly against Grafana's current `main` branch.

### Applying Upstream Patches to Grafana
```bash
# In your Grafana repository clone:
git apply --check /path/to/A11YLab/patches/0001-fix-timerangepicker-keyboard-trap-and-aria.patch
git apply /path/to/A11YLab/patches/0001-fix-timerangepicker-keyboard-trap-and-aria.patch

git apply --check /path/to/A11YLab/patches/0002-fix-vizlegend-accessible-names-and-chart-table.patch
git apply /path/to/A11YLab/patches/0002-fix-vizlegend-accessible-names-and-chart-table.patch

git apply --check /path/to/A11YLab/patches/0003-fix-slider-accessible-naming-and-alert-focus.patch
git apply /path/to/A11YLab/patches/0003-fix-slider-accessible-naming-and-alert-focus.patch
```

---

## 6. Verification & Quick Start

### 6.1 Launch Interactive Workbench (Showcase)
Experience the live before-and-after workflows, test keyboard navigation, inspect the real-time VoiceOver/NVDA speech viewer, and run in-browser axe scans:

```bash
# From workspace root
cd showcase
npm install
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in Safari, Chrome, or Firefox.

### 6.2 Run Automated Verification Script
Run the automated verification pipeline:

```powershell
powershell -ExecutionPolicy Bypass -File scripts/verify-all.ps1
```
Or via npm:
```bash
npm run audit
npm run build
```

---

## 7. Accessibility Engineering Core Principles

This project demonstrates five fundamental accessibility engineering principles:
1. **WCAG 2.2 AA & WAI-ARIA Mastery**: Addresses newer criteria (2.5.8 Target Size Minimum, 2.4.11 Focus Appearance) alongside classic pitfalls (2.1.2 Keyboard Traps, 2.5.3 Label in Name).
2. **Beyond Automated Scanners**: Automated audits only catch ~30–40% of critical barriers; complex bugs (such as `event.preventDefault()` traps, missing table fallbacks, and focus loss during DOM unmounting) require rigorous manual inspection.
3. **Data Visualization Accessibility**: Transforms canvas visualizations into multi-modal experiences with sonified crosshairs and accessible tabular equivalents (`Shift + Alt + T`).
4. **Platform-Specific Knowledge**: Respects the differences between VoiceOver's live DOM interaction model and NVDA's virtual buffer browse mode.
5. **Deterministic Focus Control**: Preserves user spatial orientation during asynchronous and client-side DOM mutations.
