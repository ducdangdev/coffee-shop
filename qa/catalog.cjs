// Read-only check of the existing local catalog; does not create orders or log in.
const { chromium } = require('../.qa-tools/node_modules/playwright');
const path = require('node:path');
(async () => {
  const browser = await chromium.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true });
  try {
    const page = await browser.newPage();
    const errors = [];
    page.on('pageerror', e => errors.push(e.message));
    for (const width of [1440, 390]) {
      await page.setViewportSize({ width, height: 1000 });
      for (const route of ['/', '/menu']) {
        await page.goto('http://localhost:5173' + route);
        await page.waitForFunction(() => document.querySelectorAll('a[href^="/product/"]').length > 0);
        await page.evaluate(async () => { for (const img of document.images) img.loading = 'eager'; await Promise.all([...document.images].map(img => img.decode().catch(() => {}))); });
        const broken = await page.locator('img').evaluateAll(imgs => imgs.filter(i => !i.naturalWidth).map(i => i.src));
        console.log(JSON.stringify({ width, route, products: await page.locator('a[href^="/product/"]').count(), brokenImages: broken, overflow: await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1) }));
        await page.screenshot({ path: path.join(__dirname, 'artifacts', `catalog-${width}-${route === '/' ? 'home' : 'menu'}.png`), fullPage: true });
      }
    }
    console.log('JavaScript exceptions:', errors.length);
  } finally { await browser.close(); }
})().catch(e => { console.error(e); process.exitCode = 1; });
