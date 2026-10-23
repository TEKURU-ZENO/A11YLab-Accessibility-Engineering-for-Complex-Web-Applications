import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('Workflow 1: TimeRangePicker Accessibility & Keyboard Ergonomics', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Navigate to Workflow 1 tab
    await page.getByRole('button', { name: /Workflow 1/i }).click();
  });

  test('Remediated TimeRangePicker passes WCAG 2.2 AA automated axe audit', async ({ page }) => {
    // Run axe audit against target container
    const axeResults = await new AxeBuilder({ page })
      .include('#workflow-target')
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
      .analyze();

    expect(axeResults.violations).toEqual([]);
  });

  test('Trigger button exposes aria-haspopup="dialog" and dynamic aria-expanded state', async ({ page }) => {
    const trigger = page.getByRole('button', { name: /Time range selected/i });

    // Collapsed state
    await expect(trigger).toHaveAttribute('aria-haspopup', 'dialog');
    await expect(trigger).toHaveAttribute('aria-expanded', 'false');

    // Open dialog via Enter
    await trigger.press('Enter');
    await expect(trigger).toHaveAttribute('aria-expanded', 'true');
    await expect(page.getByRole('dialog', { name: /Time range picker/i })).toBeVisible();

    // Escape closes and restores focus
    await page.keyboard.press('Escape');
    await expect(trigger).toHaveAttribute('aria-expanded', 'false');
    await expect(trigger).toBeFocused();
  });

  test('Quick time ranges use semantic radiogroup and roving tabindex without keyboard trap', async ({ page }) => {
    const trigger = page.getByRole('button', { name: /Time range selected/i });
    await trigger.click();

    const radiogroup = page.getByRole('radiogroup', { name: /Time ranges/i });
    await expect(radiogroup).toBeVisible();

    // Verify radio options
    const radios = radiogroup.getByRole('radio');
    expect(await radios.count()).toBe(8);

    // Initial selected option has tabIndex 0
    const selectedRadio = radiogroup.getByRole('radio', { checked: true });
    await expect(selectedRadio).toHaveAttribute('tabindex', '0');

    // Arrow navigation moves focus and updates roving tabindex
    await selectedRadio.focus();
    await page.keyboard.press('ArrowDown');

    // TAB KEY TRAP REGRESSION TEST:
    // Tab must NOT be intercepted; it must smoothly move focus to custom time input
    await page.keyboard.press('Tab');
    const customFromInput = page.getByRole('textbox', { name: /From custom time/i });
    await expect(customFromInput).toBeFocused();
  });

  test('Selecting time range dispatches polite live region announcement', async ({ page }) => {
    const trigger = page.getByRole('button', { name: /Time range selected/i });
    await trigger.click();

    // Select Last 24 hours
    await page.getByRole('radio', { name: /Last 24 hours/i }).click();

    // Verify trigger label updated
    await expect(trigger).toContainText('Last 24 hours');

    // Verify live region announcement
    const liveRegion = page.locator('[aria-live="polite"]');
    await expect(liveRegion).toContainText('Time range updated to Last 24 hours');
  });
});
