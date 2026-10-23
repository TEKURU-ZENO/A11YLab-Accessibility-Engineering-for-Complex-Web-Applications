import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('Workflow 2: Chart & VizLegend Accessibility & Data Parity', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: /Workflow 2/i }).click();
  });

  test('Remediated TimeSeries and VizLegend pass WCAG 2.2 AA automated axe audit', async ({ page }) => {
    const axeResults = await new AxeBuilder({ page })
      .include('#workflow-target')
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
      .analyze();

    expect(axeResults.violations).toEqual([]);
  });

  test('VizLegend buttons strictly conform to Label in Name (WCAG 2.5.3) & aria-pressed', async ({ page }) => {
    // Upstream defect was computing aria-label="All series selected" for every button
    const gatewayBtn = page.getByRole('button', { name: /API Gateway Requests/i });
    await expect(gatewayBtn).toBeVisible();

    // Verify accessible name starts with visible label
    const accessibleName = await gatewayBtn.getAttribute('aria-label');
    expect(accessibleName).toMatch(/^API Gateway Requests/i);

    // Verify toggle semantics
    await expect(gatewayBtn).toHaveAttribute('aria-pressed', 'true');

    // Click to toggle
    await gatewayBtn.click();
    await expect(gatewayBtn).toHaveAttribute('aria-pressed', 'false');
  });

  test('Keyboard shortcut (Alt+T) renders accessible HTML data table alternative', async ({ page }) => {
    // Press Alt+T to toggle table view
    await page.keyboard.press('Alt+t');

    // Semantic HTML table must be rendered
    const table = page.getByRole('table', { name: /Cluster Gateway Latency & Error Rate Data Table/i });
    await expect(table).toBeVisible();

    // Verify columns and data headers
    const headers = table.getByRole('columnheader');
    expect(await headers.count()).toBe(5);

    // Verify row headers
    const rowHeaders = table.getByRole('rowheader');
    expect(await rowHeaders.count()).toBe(6);

    // Toggle back to chart
    await page.keyboard.press('Alt+t');
    await expect(table).not.toBeVisible();
  });

  test('Plot area provides keyboard crosshair sonification and live announcements', async ({ page }) => {
    const plotRegion = page.getByRole('region', { name: /Time series telemetry chart/i });
    await expect(plotRegion).toBeVisible();

    // Focus plot region
    await plotRegion.focus();
    await expect(plotRegion).toBeFocused();

    // Step through time points using arrow keys
    await page.keyboard.press('ArrowRight');

    const liveRegion = page.locator('[aria-live="polite"]');
    await expect(liveRegion).toContainText(/Latency|Requests/i);
  });
});
