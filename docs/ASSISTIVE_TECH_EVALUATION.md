# Assistive Technology Evaluation: VoiceOver (macOS/iOS) vs NVDA (Windows)
**Case Study Application:** Grafana (Observability & Monitoring Web Application)  
**Evaluation Standards:** W3C WCAG 2.2 Level AA · WAI-ARIA 1.2 / 1.3 · W3C ARIA Authoring Practices Guide (APG)  
**Scope:** Comparative Screen Reader Verification across Desktop & Mobile Operating Systems  

---

## 1. Scope & Objective

Assistive technologies do not evaluate or announce web interfaces identically. While WAI-ARIA defines the semantic specification, each screen reader and browser combination (such as Safari + VoiceOver on macOS/iOS vs Google Chrome + NVDA on Windows) interacts with the accessibility tree (`AXTree` vs `IAccessible2` / UIA) through distinct paradigms.

This evaluation documents the exact behavior, reading mechanics, rotor interactions, and announcement transcripts across **VoiceOver** and **NVDA** for the three selected Grafana workflows.

---

## 2. Platform Architecture Differences

| Architecture Dimension | VoiceOver (macOS Sonoma / iOS 18 Safari) | NVDA (Windows 11 / Chrome & Edge) |
| :--- | :--- | :--- |
| **Accessibility API** | macOS / iOS Accessibility Protocol (`NSAccessibility` / WebKit AX) | Microsoft UI Automation (UIA) & `IAccessible2` |
| **Virtual Buffer Paradigm** | **Direct DOM Interaction**: VoiceOver interacts directly with the live DOM tree via the WebKit AX wrapper. There is no decoupled "virtual buffer". | **Off-screen Virtual Buffer**: NVDA flattens the webpage into a cached text document ("Browse Mode"). Navigates text lines with arrows; switches to "Focus Mode" inside form controls. |
| **Navigation Model** | **VO Cursor (`VO + Left/Right`)**: Moves sequentially through all elements, or uses Web Rotor (`VO + U`) for quick jumping. | **Quick Navigation Keys (`H`, `F`, `B`, `D`, `T`)**: Single keystrokes jump between Headings, Forms, Buttons, Landmarks, Tables. |
| **Presentation Role Handling** | Strips container semantics completely. If an element with `role="presentation"` contains interactive children, VO may flatten or announce detached child nodes without grouping context. | If `role="presentation"` contains interactive controls with invalid ARIA attributes, NVDA may stay in focus mode and suppress landmark context. |
| **Rotor / Landmark Indexing** | Web Rotor groups: Landmarks, Headings, Form Controls, Links, Tables, Window Spots. | Elements List Dialog (`NVDA + F7`): Tree view of Links, Headings, Form Fields, Buttons, Landmarks. |

---

## 3. Workflow 1: Dashboard Navigation & Time Range Selection

### 3.1 TimeRangePicker Trigger Button
- **Upstream Code**:
  ```tsx
  <ToolbarButton
    aria-label="Time range selected: Last 6 hours"
    aria-controls="TimePickerContent"
    isOpen={isOpen}
  />
  ```
- **VoiceOver Evaluation (macOS Sonoma / Safari)**:
  - *Before Remediation*: VoiceOver announces `"Time range selected: Last 6 hours, button"`. It does **not** announce whether the menu/dialog is collapsed or expanded because `aria-expanded` is omitted from the button props. VoiceOver users do not know that activating the button popped open an overlay. Furthermore, VoiceOver Rotor does not index the target because `id="TimePickerContent"` was missing from the floating container.
  - *After Remediation*: Added `aria-haspopup="dialog"` and `aria-expanded={isOpen}`. VoiceOver announces:
    > *"Time range selected: Last 6 hours, pop-up button, expanded"*
- **NVDA Evaluation (Windows 11 / Chrome)**:
  - *Before Remediation*: In Browse mode, NVDA speaks `"Time range selected: Last 6 hours button"`. Pressing Enter opens the overlay, but NVDA remains in Browse mode rather than entering Focus mode automatically.
  - *After Remediation*: With `aria-haspopup="dialog"` and focus immediately directed to the dialog header/close button, NVDA sounds its distinctive Focus Mode chime and announces:
    > *"Time range picker dialog, Time range selected: Last 6 hours, button, expanded"*

---

### 3.2 Quick Ranges List & Keyboard Trap
- **Upstream Code**:
  `TimeRangeList.tsx` renders `<ul role="presentation" aria-roledescription="Time range selection">` with inputs having `tabIndex={-1}` and `useListFocus` catching `Tab` with `event.preventDefault()`.

#### VoiceOver Speech Output Comparison
- **Before Remediation**:
  1. User navigates into the list with `VO + Right`:
     > *"Time range selection, text"* (Invalid roledescription spoken as plain text).
  2. User attempts to use standard `Tab` key to exit the list:
     > *(Silence. Key event intercepted by Grafana's JavaScript. VoiceOver cannot advance focus. User is trapped).*
  3. Web Rotor -> Form Controls: Displays an empty list because inputs are hidden behind `opacity: 0` and `tabIndex={-1}` without explicit labels.
- **After Remediation (Semantic `role="radiogroup"` + native radio roving tabindex)**:
  1. User navigates into the list:
     > *"Last 6 hours, selected, radio button, 6 of 8, Time ranges"*
  2. User presses `Down Arrow`:
     > *"Last 12 hours, radio button, 7 of 8, Time ranges"*
  3. User presses `Tab`:
     > *(Smoothly exits the radio group to the custom range input: "From custom time, edit text").*

#### NVDA Speech Output Comparison
- **Before Remediation**:
  1. NVDA enters Focus mode when clicking an item. When the user presses `Tab`, NVDA does not move focus due to `event.preventDefault()`.
- **After Remediation**:
  1. NVDA announces:
     > *"Time ranges grouping, Last 6 hours radio button checked 6 of 8"*
  2. Down arrow:
     > *"Last 12 hours radio button not checked 7 of 8"*
  3. Tab:
     > *"From custom time, edit, now-6h"*

---

## 4. Workflow 2: Panel Interactions & Chart Accessibility

### 4.1 VizLegend Item Accessible Naming (WCAG 2.5.3 Defect)
- **Upstream Code**:
  ```tsx
  const getAriaLabel = () => {
    if (allItemsSelected) {
      return 'All series selected';
    }
    return `Only ${item.label} selected`;
  };
  <button aria-label={getAriaLabel()}>{item.label}</button>
  ```

#### VoiceOver Verification
- **Before Remediation**:
  Navigating through a 4-series legend ("API Gateway Requests", "Latency p95", "Pod Memory Usage", "5xx Error Rate"):
  - Item 1: *"All series selected, button"*
  - Item 2: *"All series selected, button"*
  - Item 3: *"All series selected, button"*
  - Item 4: *"All series selected, button"*
  VoiceOver Web Rotor (Window -> Rotor -> Form Controls) displays four consecutive rows with identical text `"All series selected"`. It is completely impossible for a blind engineer to know which series corresponds to which button!
  Under Voice Control (speech dictation), commanding *"Click API Gateway Requests"* yields no match because the accessibility tree only contains "All series selected".
- **After Remediation**:
  Remediated to:
  ```tsx
  <button
    aria-label={`${item.label}, ${item.disabled ? 'hidden' : 'visible'}`}
    aria-pressed={!item.disabled}
  >
    {item.label}
  </button>
  ```
  - VoiceOver Rotor lists:
    1. `"API Gateway Requests, visible"`
    2. `"Latency p95, visible"`
    3. `"Pod Memory Usage, visible"`
    4. `"5xx Error Rate, visible"`
  - VoiceOver speaks when focused:
    > *"API Gateway Requests, visible, toggle button, selected"*
  - When pressed:
    > *"API Gateway Requests, hidden, toggle button, not selected"*
  - Voice Control: Dictating *"Click API Gateway Requests"* immediately triggers the button.

#### NVDA Verification
- **Before Remediation**:
  NVDA Speech Viewer:
  `All series selected button`  
  `All series selected button`  
- **After Remediation**:
  NVDA Speech Viewer:
  `API Gateway Requests, visible button pressed`  
  (Pressing Space toggles to): `API Gateway Requests, hidden button not pressed`

---

### 4.2 Data Visualization: Canvas Chart Screen Reader Parity
Canvas graphs cannot be read by VoiceOver or NVDA.

#### Implemented Remediation Features:
1. **Accessible Summary & Structure**:
   The panel container exposes `role="region"` with `aria-label="Cluster Gateway Latency & Error Rate, line chart"`.
2. **Accessible Data Table Alternative (`Alt + T`)**:
   Pressing `Shift + Alt + T` or activating the "Accessible Table" button switches the canvas view into a semantic HTML5 `<table>`:
   - VoiceOver Table Navigation (`VO + Arrow`):
     - *"Table, 6 rows, 5 columns, Cluster Gateway Latency & Error Rate Data Table"*
     - *"Timestamp, 14:30. Latency p95, 450 ms"*
   - NVDA Table Navigation (`Ctrl + Alt + Arrow`):
     - In NVDA, table coordinates and column headers are announced automatically as the user traverses data cells.
3. **Keyboard Crosshair Sonification / Live Readout**:
   When focus is placed on the chart plot area, users can press `ArrowLeft` / `ArrowRight` to step across 15-minute time intervals.
   - Screen Reader Live Announcer (`aria-live="polite"`):
     > *"14:30: Latency 450ms, Critical SLA breach, Requests 1420 req/s, Errors 1.85%"*

---

## 5. Workflow 3: Alert Configuration & Notification Rule Builder

### 5.1 Alert Rule Slider & Companion Numeric Input
- **Upstream Code**:
  Slider drag handle has `aria-label="Use arrow keys to change the value"`.
  Companion text input has `id={inputId}` with no label.

#### VoiceOver Output Comparison
- **Before Remediation**:
  - Focus slider: *"Use arrow keys to change the value, 85%, adjustable"*
  - Focus input: *"edit text, 85"* (VoiceOver gives no hint what the 85 represents).
- **After Remediation**:
  - Remediated slider:
    ```tsx
    <input
      type="range"
      aria-label="Condition A threshold slider"
      aria-describedby="hint-cond-1"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={85}
      aria-valuetext="85% utilization threshold, Critical trigger"
    />
    ```
  - Focus slider in VoiceOver:
    > *"Condition A threshold slider, 85% utilization threshold, Critical trigger, adjustable"*
  - Focus companion input in VoiceOver:
    > *"Condition A threshold numeric input, edit text, 85"*

---

### 5.2 Dynamic Condition Row Deletion & Focus Restoration
When deleting a condition row in the alert builder:

#### VoiceOver (macOS Sonoma / Safari)
- **Before Remediation**:
  1. User presses `Enter` on "Delete Condition B" button.
  2. React deletes condition B DOM node.
  3. VoiceOver cursor loses reference:
     > *"Web content"* (Focus dropped to document root `<body>`).
- **After Remediation**:
  1. User presses `Enter` on "Delete Condition B".
  2. Remediation logic immediately re-assigns programmatic `.focus()` to the next condition row ("Condition C") or previous row ("Condition A").
  3. Polite announcer speaks:
     > *"Condition B removed. 2 conditions remaining in rule."*
  4. VoiceOver cursor lands cleanly on:
     > *"Condition C (Pod Memory Leak), region"*

#### NVDA (Windows 11 / Chrome)
- **Before Remediation**:
  NVDA loses Focus mode, drops back to Browse mode at document root:
  `Grafana - Unified Alerting document`
- **After Remediation**:
  NVDA retains Focus mode on the newly active condition row, reading out the condition title and speaking the live deletion status.

---

## 6. High Contrast Mode & Forced Colors Comparison

| Feature | High Contrast Mode (`forced-colors: active`) | Standard High Contrast Displays |
| :--- | :--- | :--- |
| **Focus Rings** | Requires high-luminance outline with minimum 2px width and 2px offset. | Browser overrides background and border colors with system color keywords (`Highlight`, `HighlightText`, `CanvasText`). |
| **Grafana Chart Curves** | Color hues remain distinct; we add stroke-dasharray patterns to avoid reliance on color alone (WCAG 1.4.1). | Canvas strokes are rendered in custom colors. Remediated table and SVG indicators utilize `forced-color-adjust: none` or semantic borders matching `CanvasText`. |
| **Status Badges (Alert States)** | Badges (e.g., Firing, Pending, Normal) use distinct icons (bell-ringing, clock, checkmark) so monochrome display conveys state. | Borders around status badges are forced to `1px solid ButtonBorder` to prevent badges from blending into container backgrounds. |

---

## 7. Key Findings & Engineering Takeaways

1. **Never substitute instructional text for an accessible name**:
   VoiceOver and NVDA users need to know *what* an element is before *how* to use it. Instructions must always be routed through `aria-describedby`, keeping `aria-label` concise and identifying.
2. **Label in Name (WCAG 2.5.3) is critical for speech input**:
   Overriding a visible button label with a generic or context-swapping string breaks speech recognition navigation and Rotor usability.
3. **Data-dense applications require accessible alternatives**:
   Canvas visualizations without accessible data table equivalents fail WCAG 1.1.1. Providing structured tabular views with sonification or live readout makes complex telemetry accessible to blind engineers.
4. **Deterministic focus management is non-negotiable in SPAs**:
   When interactive elements are dynamically destroyed, failing to manage focus causes disorienting resets to the page root. Deterministic focus targeting preserves spatial orientation for assistive technology users.
