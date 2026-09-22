const { chromium } = require('/opt/homebrew/lib/node_modules/playwright');
const fs = require('fs');
const path = require('path');

async function test() {
  const browser = await chromium.launch({
    executablePath: '/Applications/Brave Browser.app/Contents/MacOS/Brave Browser',
    headless: true
  });
  
  const page = await browser.newPage();
  page.on('console', msg => console.log(`[BROWSER CONSOLE ${msg.type()}]:`, msg.text()));
  page.on('pageerror', err => console.log(`[BROWSER ERROR]:`, err.message));
  page.on('response', resp => {
    if (resp.status() >= 400) {
      console.log(`[HTTP ${resp.status()}]:`, resp.url());
    }
  });
  
  await page.goto('http://localhost:8099/index.html');
  await page.waitForTimeout(2000);
  
  // Test if THREE and GLTFLoader are available
  const result = await page.evaluate(async () => {
    return {
      hasThree: typeof THREE !== 'undefined',
      hasGLTFLoader: typeof THREE !== 'undefined' && typeof THREE.GLTFLoader === 'function',
      errors: window.__errors || []
    };
  });
  
  console.log('Test result:', result);
  await browser.close();
}

test().catch(console.error);
