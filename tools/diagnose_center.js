const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
  await page.goto('http://localhost:8099/index.html', { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => {
    const app = window.eeveeApp;
    const models = app && app.eeveeRig && app.eeveeRig.userData && app.eeveeRig.userData.models;
    if (!models) return false;
    return ['eevee','vaporeon','jolteon','flareon','espeon','umbreon','leafeon','glaceon','sylveon']
      .every(k => models[k] && models[k].userData && models[k].userData.isLoaded);
  }, { timeout: 20000 });

  async function probe(label) {
    const value = await page.evaluate(() => {
      const x = window.innerWidth / 2, y = window.innerHeight / 2;
      return document.elementsFromPoint(x, y).slice(0, 8).map(el => {
        const cs = getComputedStyle(el);
        const r = el.getBoundingClientRect();
        return {
          tag: el.tagName, id: el.id || '', cls: String(el.className || ''),
          pointerEvents: cs.pointerEvents, opacity: cs.opacity, display: cs.display,
          visibility: cs.visibility, zIndex: cs.zIndex,
          rect: [Math.round(r.left), Math.round(r.top), Math.round(r.width), Math.round(r.height)],
          text: String(el.textContent || '').trim().replace(/\s+/g, ' ').slice(0, 120)
        };
      });
    });
    console.log(label, JSON.stringify(value));
  }

  await probe('initial');
  await page.evaluate(() => { window.eeveeApp.selectEeveelution('flareon'); window.eeveeApp.goToRoom('flareon'); });
  await page.waitForTimeout(800);
  await probe('flareon-room');
  await page.evaluate(() => { try { triggerRoomProp(); } catch (_) {} });
  await page.waitForTimeout(400);
  await probe('after-room-prop');
  await page.evaluate(() => { window.eeveeApp.save.set('highScore', 12345); window.eeveeApp.save.flush(); });
  await page.reload({ waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => window.eeveeApp && window.eeveeApp.roomManager && window.eeveeApp.roomManager.current, { timeout: 15000 });
  await page.waitForTimeout(500);
  await probe('after-reload');
  await page.evaluate(() => onSetReducedMotion(true));
  await page.waitForTimeout(100);
  await probe('reduced-on');
  await page.evaluate(() => onSetReducedMotion(false));
  await probe('reduced-off');
  await browser.close();
})().catch(err => { console.error(err); process.exit(1); });
