const { chromium } = require('playwright');
const out = process.argv[2];
const sizes = { se: [320, 568], ip15: [390, 844], ipad: [820, 1180], ipadL: [1180, 820] };
const routes = ['/explore', '/map', '/map/cafe/lalins', '/focus', '/profile', '/profile/edit'];
(async () => {
  const b = await chromium.launch();
  const errs = [];
  for (const [k, [w, h]] of Object.entries(sizes)) {
    const p = await b.newPage({ viewport: { width: w, height: h } });
    p.on('pageerror', (e) => errs.push(k + ' ' + e));
    await p.goto('http://localhost:8099/'); await p.waitForTimeout(1500);
    await p.getByText('Log in', { exact: true }).click(); await p.waitForTimeout(1200);
    for (const r of routes) {
      await p.goto('http://localhost:8099' + r); await p.waitForTimeout(1300);
      const sw = await p.evaluate(() => document.documentElement.scrollWidth);
      if (sw > w) errs.push(`${k} ${r} horizontal overflow ${sw}>${w}`);
      await p.screenshot({ path: `${out}/${k}${r.replace(/\//g, '_')}.png` });
    }
    // nav taps + re-tap returns to tab root
    await p.goto('http://localhost:8099/profile/edit'); await p.waitForTimeout(1200);
    await p.getByRole('tab', { name: 'Profile' }).click(); await p.waitForTimeout(800);
    errs.push(`${k} retap -> ${p.url().replace('http://localhost:8099', '')}`);
    await p.getByRole('tab', { name: 'Saved' }).click(); await p.waitForTimeout(800);
    errs.push(`${k} tap Saved -> ${p.url().replace('http://localhost:8099', '')}`);
    await p.close();
  }
  console.log(errs.join('\n'));
  await b.close();
})();
