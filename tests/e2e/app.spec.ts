import { expect, test } from '@playwright/test';
import path from 'node:path';

const qaOutput = (name: string) => path.resolve(process.cwd(), '../../work', name);

test('desktop product workflow and six routes', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop', 'Desktop-only product workflow');

  await page.goto('/');
  await expect(page).toHaveTitle(/BearingScope/);
  await expect(page.getByRole('heading', { name: '全球轴承情报', exact: true })).toBeVisible();
  await expect(page.locator('.primary-nav__item')).toHaveCount(6);
  await expect(page.locator('.trending-list li')).toHaveCount(5);
  await expect(page.locator('.content-card').first()).toBeVisible();
  await expect(page.locator('html')).not.toHaveClass(/light/);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);

  const firstCard = page.locator('.content-card').first();
  await firstCard.getByRole('button', { name: '查看详情' }).click();
  await expect(page.locator('.detail-drawer')).toBeVisible();
  await page.locator('.detail-drawer__header .icon-button').click();
  await expect(page.locator('.detail-drawer')).toHaveCount(0);

  const bookmark = firstCard.locator('.bookmark-button');
  await bookmark.click();
  await expect(bookmark).toHaveAttribute('aria-pressed', 'true');
  await bookmark.click();

  await page.locator('.theme-switch').click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
  await page.locator('.theme-switch').click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');

  await page.locator('.language-switch').click();
  await expect(page.getByRole('link', { name: 'Briefing', exact: true })).toBeVisible();
  await page.locator('.language-switch').click();

  const routes: Array<[string, string]> = [
    ['/news', '全部动态'],
    ['/brands', '品牌雷达'],
    ['/market', '市场未来'],
    ['/research', '论文研究'],
    ['/saved', '收藏'],
  ];
  for (const [route, title] of routes) {
    await page.goto(route);
    await expect(page.getByRole('heading', { name: title, exact: true })).toBeVisible();
    await expect(page.locator('.async-state--error')).toHaveCount(0);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
  }

  await page.goto('/');
  await expect(page.locator('.trending-list li')).toHaveCount(5);
  await expect(page.locator('.content-card').first()).toBeVisible();
  await page.screenshot({ path: qaOutput('bearingscope-desktop.png'), fullPage: false });
});

test('mobile drawer, layout and theme controls', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'mobile', 'Mobile-only responsive workflow');

  await page.goto('/');
  await expect(page.getByRole('heading', { name: '全球轴承情报', exact: true })).toBeVisible();
  await expect(page.locator('.trending-list li')).toHaveCount(5);
  await expect(page.locator('.content-card').first()).toBeVisible();
  await expect(page.locator('.mobile-topbar')).toBeVisible();
  await expect(page.locator('.sidebar')).toBeHidden();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);

  await page.getByRole('button', { name: '打开导航', exact: true }).click();
  await expect(page.locator('.mobile-drawer')).toBeVisible();
  await expect(page.locator('.mobile-drawer').getByRole('link', { name: '品牌雷达', exact: true })).toBeVisible();
  await page.locator('.mobile-drawer__close').click();
  await expect(page.locator('.mobile-drawer')).toHaveCount(0);

  await page.screenshot({ path: qaOutput('bearingscope-mobile.png'), fullPage: false });
});
