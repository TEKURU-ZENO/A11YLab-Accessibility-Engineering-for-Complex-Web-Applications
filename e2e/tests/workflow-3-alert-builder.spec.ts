import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('Workflow 3: Alert Condition Builder, Slider & Focus Management', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: /Workflow 3/i }).click();
  });

  test('Remediated Alert Rule Builder passes WCAG 2.2 AA automated axe audit', async ({ page }) => {
    const axeResults = await new AxeBuilder({ page })
      .include('#workflow-target')
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
      .analyze();

    expect(axeResults.violations).toEqual([]);
  });

  test('Threshold slider provides semantic accessible name, describedby, and valuetext', async ({ page }) => {
    const slider = page.getByRole('slider', { name: /Condition A.*threshold slider/i });
    await expect(slider).toBeVisible();

    // Verify accessible name identifies property
    const label = await slider.getAttribute('aria-label');
    expect(label).toContain('threshold slider');

    // Verify aria-describedby is present
    await expect(slider).toHaveAttribute('aria-describedby');

    // Verify unit-aware aria-valuetext
    await expect(slider).toHaveAttribute('aria-valuetext', /utilization threshold/i);
  });

  test('Companion numeric input has explicit accessible label and stays synchronized', async ({ page }) => {
    const numInput = page.getByRole('spinbutton', { name: /Condition A threshold numeric input/i });
    await expect(numInput).toBeVisible();
    await expect(numInput).toHaveValue('85');

    // Change value via input
    await numInput.fill('70');
    const slider = page.getByRole('slider', { name: /Condition A.*threshold slider/i });
    await expect(slider).toHaveValue('70');
  });

  test('Deleting a condition row preserves focus deterministically without dropping to body', async ({ page }) => {
    const deleteBtn = page.getByRole('button', { name: 'Delete Condition B (P95 Latency SLA)' });
    await expect(deleteBtn).toBeVisible();

    // Activate delete
    await deleteBtn.click();

    // Verify row B is removed
    await expect(page.getByText('Condition B (P95 Latency SLA)')).not.toBeVisible();

    // FOCUS ORDER REGRESSION TEST:
    // Focus MUST NOT be dropped to <body> (document.body)
    const focusedTag = await page.evaluate(() => document.activeElement?.tagName);
    expect(focusedTag).not.toBe('BODY');

    // Verify polite live announcement
    const liveRegion = page.locator('[aria-live="polite"]');
    await expect(liveRegion).toContainText('Condition B removed');
  });
});
