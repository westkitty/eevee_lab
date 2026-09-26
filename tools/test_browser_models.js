const { chromium } = require('./playwright_support').resolvePlaywright();

async function test() {
  const baseUrl = (process.env.EEVEE_TEST_BASE_URL || 'http://localhost:8099').replace(/\/$/, '');
  const browser = await chromium.launch({ headless: true });
  try {
    const page = await browser.newPage();
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    page.on('console', message => {
      if (message.type() === 'error') errors.push(message.text());
    });

    await page.goto(`${baseUrl}/index.html`, { waitUntil: 'domcontentloaded' });
    await page.waitForFunction(() => typeof THREE !== 'undefined' && typeof THREE.GLTFLoader === 'function');
    const result = await page.evaluate(() => ({
      hasThree: typeof THREE !== 'undefined',
      hasGLTFLoader: typeof THREE !== 'undefined' && typeof THREE.GLTFLoader === 'function'
    }));
    if (!result.hasThree || !result.hasGLTFLoader) throw new Error(`Three.js smoke check failed: ${JSON.stringify(result)}`);
    if (errors.length) throw new Error(`Browser reported errors:\n${errors.join('\n')}`);
    console.log('Three.js + GLTFLoader browser smoke test: PASS');
  } finally {
    await browser.close();
  }
}

test().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
