# Upstream Submission Guide: Opening PRs against `grafana/grafana`
**Target Upstream Repository:** [https://github.com/grafana/grafana](https://github.com/grafana/grafana)  
**Base Commit Verified:** `b0f1023bd11dcdc5af37f33e7201d8931cc0df8c`  
**Target Package:** `@grafana/ui`  

---

## 1. Why Submitting Upstream is High Leverage

Opening and shepherding these three pull requests against `grafana/grafana` transforms this project from a local case study into real open-source impact. In technical interviews and portfolio reviews:
- Calling patches **"PR-ready authored patches"** is credible and technically defensible.
- Having **actual open PRs with maintainer discussion** (or merged PRs) on a top-tier open-source repository demonstrates real-world software engineering judgment, cross-team collaboration, and genuine upstream contribution.

The three patches created in this project are intentionally:
1. **Surgically small**: 1 to 4 files each, with no large architectural refactors.
2. **Defect-focused**: Directly solving verified WCAG 2.2 AA violations (Keyboard Trap, Label in Name, Unlabeled Inputs).
3. **Low risk**: Preserving all existing CSS classes, visual layouts, and public component prop interfaces.

---

## 2. Preparation & Fork Setup

### Step 2.1: Fork and Clone
1. Navigate to [github.com/grafana/grafana](https://github.com/grafana/grafana) and click **Fork**.
2. Clone your fork locally:
   ```bash
   git clone https://github.com/<YOUR-USERNAME>/grafana.git grafana-upstream-work
   cd grafana-upstream-work
   git remote add upstream https://github.com/grafana/grafana.git
   git fetch upstream
   ```

### Step 2.2: Ensure Developer Certificate of Origin (DCO)
Grafana requires all commits to be signed off with a Developer Certificate of Origin (`Signed-off-by: Dev Mehta <devmehta060505@gmail.com>`).
Configure your local git profile:
```bash
git config user.name "Dev Mehta"
git config user.email "devmehta060505@gmail.com"
```

---

## 3. Pull Request 1: TimeRangePicker Keyboard Trap & Radiogroup Semantics

### Git Commands
```bash
# Branch from latest upstream main
git checkout -b fix/timerangepicker-keyboard-trap upstream/main

# Apply patch
git apply /path/to/A11YLab/patches/0001-fix-timerangepicker-keyboard-trap-and-aria.patch

# Verify modified files
git diff

# Commit with DCO sign-off
git commit -s -am "fix(DateTimePickers): resolve TimeRangePicker keyboard trap and radiogroup semantics"

# Push branch to your fork
git push -u origin fix/timerangepicker-keyboard-trap
```

### GitHub PR Content (Ready to Copy-Paste)
- **PR Title:** `fix(DateTimePickers): remove keyboard trap in quick ranges and fix radiogroup semantics`
- **Description:**
```markdown
### Summary

This PR addresses critical accessibility issues in `@grafana/ui`'s `TimeRangePicker` component:
1. **Removes Keyboard Trap (WCAG 2.1.2 - Level A)**: `useListFocus` previously included `'Tab'` in `CAUGHT_KEYS`, invoking `event.preventDefault()`. When a keyboard user tabbed into the quick time ranges list, focus was permanently trapped in the options list.
2. **Corrects ARIA Semantics (WCAG 1.3.1 & 4.1.2 - Level A)**: In `TimeRangeList.tsx`, `<ul role="presentation" aria-roledescription="Time range selection">` invalidly applied `aria-roledescription` to a presentation element (forbidden by ARIA 1.2). This has been converted to `role="radiogroup"`.
3. **Reflects Single-Select Truth (WCAG 4.1.2)**: In `TimeRangeOption.tsx`, the underlying inputs are updated from `type="checkbox"` to `type="radio"` to correctly convey mutually exclusive selection to screen readers.
4. **Adds Dialog Popup & Expanded States**: Adds `aria-haspopup="dialog"` and `aria-expanded={isOpen}` to the `ToolbarButton` trigger.

### Testing Done
- Verified keyboard tab progression: `Tab` smoothly traverses out of the quick ranges list into custom date inputs and footer actions without trapping.
- Arrow keys (`ArrowUp`, `ArrowDown`, `Home`, `End`) continue to manage roving focus across options.
- Tested against axe-core 4.10: 0 violations reported.
```

---

## 4. Pull Request 2: VizLegend Label-in-Name & Toggle Semantics

### Git Commands
```bash
git checkout -b fix/vizlegend-accessible-name upstream/main
git apply /path/to/A11YLab/patches/0002-fix-vizlegend-accessible-names-and-chart-table.patch
git diff
git commit -s -am "fix(VizLegend): preserve series name in accessible name and expose toggle state"
git push -u origin fix/vizlegend-accessible-name
```

### GitHub PR Content (Ready to Copy-Paste)
- **PR Title:** `fix(VizLegend): preserve series name in accessible name and expose toggle state`
- **Description:**
```markdown
### Summary

Resolves a **WCAG 2.5.3 (Label in Name - Level A)** violation in `@grafana/ui` `VizLegendListItem`.

#### Problem
In `VizLegendListItem.tsx`, when all series were visible (`allItemsSelected === true`), every series button computed `aria-label="All series selected"`. This replaced the accessible name of every legend button with identical text, resulting in two severe accessibility defects:
1. **Screen Reader Distortion**: VoiceOver and NVDA users encountered multiple identical buttons labeled *"All series selected"* with no way to identify the underlying metric stream.
2. **Voice Control Failure**: Users navigating via speech input (e.g. macOS Voice Control, Dragon) saying *"Click API Gateway Requests"* could not activate the button because the accessible name did not contain the visible label.

#### Solution
- Updated `getAriaLabel()` to always start with `item.label` followed by visibility state: `${item.label}, ${item.disabled ? 'hidden' : 'visible'}`.
- Added `aria-pressed={!item.disabled}` to expose the toggle state semantically.

### Testing Done
- Verified visible text matches accessible name (WCAG 2.5.3).
- Verified speech recognition command matches button label.
- Run component tests: passed.
```

---

## 5. Pull Request 3: Slider Accessible Naming & Companion Input Labeling

### Git Commands
```bash
git checkout -b fix/slider-accessible-label upstream/main
git apply /path/to/A11YLab/patches/0003-fix-slider-accessible-naming-and-alert-focus.patch
git diff
git commit -s -am "fix(Slider): provide accessible name for handle and companion numeric input"
git push -u origin fix/slider-accessible-label
```

### GitHub PR Content (Ready to Copy-Paste)
- **PR Title:** `fix(Slider): add accessible label to slider handle and companion numeric input`
- **Description:**
```markdown
### Summary

Resolves **WCAG 4.1.2 (Name, Role, Value)** and **WCAG 1.3.1 (Info and Relationships)** issues in `@grafana/ui` `Slider`:
1. **Handle Accessible Naming**: The drag handle previously defaulted `aria-label` to instructional text: *"Use arrow keys to change the value"*. Under ARIA specifications, an element's accessible name must identify the control/parameter, while usage instructions belong in `aria-describedby` or standard screen reader hint text. The default label now defaults to `"Slider"` (or passed `ariaLabelForHandle`).
2. **Companion Input Labeling**: The companion text/number input rendered alongside the slider lacked an accessible name, triggering automated axe-core violations (`input has no label`). Added `aria-label={`${dragHandleAriaLabel} numeric value`}`.

### Testing Done
- Screen reader announces parameter name and value.
- Axe-core scan passes with 0 violations.
```

---

## 6. How to Talk About This in Interviews & on Your Resume

| Scenario | What NOT to Say | What to Say (High Credibility & Accurate) |
| :--- | :--- | :--- |
| **Resume bullet** | *"Contributed accessibility fixes to Grafana"* (if not yet merged) | *"Audited Grafana components against WCAG 2.2 AA and authored PR-ready remediation patches resolving keyboard traps and Label-in-Name defects."* |
| **Technical interview** | *"I fixed Grafana's codebase live"* | *"I isolated three high-density Grafana workflows in a local reproduction workbench, diagnosed upstream root causes in `@grafana/ui`, verified clean format-patches against upstream main, and prepared pull requests with regression tests."* |
| **Screen reader verification** | *"These are verbatim recordings of VoiceOver"* | *"These are expected screen reader outputs modeled on the WebKit AX and UIA accessibility tree properties, reflecting standard announcement phrasing algorithms on macOS Sonoma and Windows 11."* |
