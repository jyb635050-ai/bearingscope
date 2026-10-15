import { chromium } from '@playwright/test';
import path from 'node:path';

const baseUrl = process.env.VISUAL_BASE_URL ?? 'http://127.0.0.1:4173/';
const output = path.resolve('..', '..', 'work');
const routes = ['', 'news', 'brands', 'market', 'research', 'saved', 'sales-rankings', 'brand-websites'];
const browser = await chromium.launch({ channel: 'msedge', headless: true });
try {
  const page = await browser.newPage();
  for (const width of [1440, 768, 390]) {
    await page.setViewportSize({ width, height: width === 390 ? 844 : 1000 });
    for (const theme of ['light', 'dark']) {
      await page.goto(baseUrl);
      await page.evaluate(theme => localStorage.setItem('bearingscope.theme', theme), theme);
      await page.reload();
      await page.getByRole('heading', { name: '全球轴承新闻', exact: true }).waitFor();
      await page.locator('.trending-list a').first().waitFor();
      const product = page.locator('.page-header__product');
      if (!await product.evaluate(img => img.complete && img.naturalWidth > 0)) throw new Error('Bearing image failed to load');
      const hotspotText = await page.locator('.trending-list').innerText();
      if (/个来源|\d+ sources?/.test(hotspotText)) throw new Error('Hotspot source counts are still visible');
      const dates = await page.locator('.trending-list time').allTextContents();
      if (dates.some(date => !/^\d{1,2}月\d{1,2}日$/.test(date))) throw new Error(`Wrong dates: ${dates}`);
      const contrast = await page.evaluate(() => {
        const context = document.createElement('canvas').getContext('2d', { willReadFrequently: true });
        const styles = getComputedStyle(document.documentElement);
        function luminance(token) {
          context.clearRect(0, 0, 1, 1);
          context.fillStyle = styles.getPropertyValue(token).trim();
          context.fillRect(0, 0, 1, 1);
          const [r, g, b] = [...context.getImageData(0, 0, 1, 1).data].slice(0, 3).map(value => {
            const s = value / 255;
            return s <= .04045 ? s / 12.92 : ((s + .055) / 1.055) ** 2.4;
          });
          return .2126 * r + .7152 * g + .0722 * b;
        }
        const background = luminance('--surface-1');
        return Object.fromEntries(['--text', '--text-muted', '--text-faint', '--cyan-strong', '--success'].map(token => {
          const foreground = luminance(token);
          return [token, (Math.max(foreground, background) + .05) / (Math.min(foreground, background) + .05)];
        }));
      });
      if (Object.values(contrast).some(ratio => ratio < 4.5)) throw new Error(`Insufficient text contrast: ${JSON.stringify(contrast)}`);
      await page.screenshot({ path: path.join(output, `bearingscope-glass-${width}-${theme}.png`) });
      for (const route of routes) {
        const target = baseUrl.includes('github.io') ? `${baseUrl}#/${route}` : `${baseUrl}${route}`;
        await page.goto(target);
        await page.locator('.page-header h1').waitFor();
        await page.waitForFunction(() => document.querySelectorAll('.async-state--loading').length === 0);
        if (await page.locator('.async-state--error').count()) throw new Error(`Error state on ${route}`);
        const overflow = await page.evaluate(() => document.documentElement.scrollWidth > innerWidth);
        if (overflow) {
          console.log(await page.evaluate(() => [...document.querySelectorAll('main *')].filter(el => el.getBoundingClientRect().right > innerWidth + 1).slice(0, 15).map(el => ({ tag: el.tagName, class: el.className, width: el.getBoundingClientRect().width }))));
          throw new Error(`Horizontal overflow on ${route || 'home'} at ${width}px, ${theme}`);
        }
      }
      console.log(`PASS: ${width}px ${theme}, all eight routes, image and dates`);
    }
  }
} finally {
  await browser.close();
}
