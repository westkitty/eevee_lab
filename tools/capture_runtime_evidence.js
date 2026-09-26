const { chromium } = require('./playwright_support').resolvePlaywright();
const fs = require('fs');
const path = require('path');

const baseUrl = (process.env.EEVEE_TEST_BASE_URL || 'http://localhost:8099').replace(/\/$/, '');

async function capture() {
  const browser = await chromium.launch({ headless: true });
  try {
    const page = await browser.newPage({ viewport: { width: 1280, height: 960 } });
    page.on('console', message => console.log('PAGE:', message.text()));
    page.on('pageerror', error => console.log('ERROR:', error.message));

    console.log('[EVIDENCE] Navigating to test_character_rig.html...');
    await page.goto(`${baseUrl}/test_character_rig.html`);
    await page.waitForFunction(() => window.allLoaded === true, { timeout: 20000 });
    console.log('[EVIDENCE] All 9 models loaded successfully in WebGL scene!');

    const speciesList = ['eevee', 'vaporeon', 'jolteon', 'flareon', 'espeon', 'umbreon', 'leafeon', 'glaceon', 'sylveon'];
    const angles = ['front34', 'side', 'rear34'];
    const outDir = path.join(__dirname, '..', 'qa', 'runtime');
    fs.mkdirSync(outDir, { recursive: true });

    for (const species of speciesList) {
      console.log(`[EVIDENCE] Capturing species: ${species.toUpperCase()}...`);
      await page.evaluate(value => window.showSpecies(value), species);
      await page.waitForTimeout(300);

      for (const angle of angles) {
        await page.evaluate(value => window.setCameraAngle(value), angle);
        await page.waitForTimeout(200);
        const outPath = path.join(outDir, `${species}_${angle}.png`);
        await page.screenshot({ path: outPath });
        console.log(`  Saved ${species}_${angle}.png (${fs.statSync(outPath).size} bytes)`);
      }
    }

    console.log('[EVIDENCE COMPLETE] All multi-angle runtime evidence captured!');
  } finally {
    await browser.close();
  }
}

capture().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
