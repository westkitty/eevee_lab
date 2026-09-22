const { chromium } = require('/opt/homebrew/lib/node_modules/playwright');
const fs = require('fs');
const path = require('path');

async function capture() {
  const browser = await chromium.launch({
    executablePath: '/Applications/Brave Browser.app/Contents/MacOS/Brave Browser',
    headless: true
  });
  
  const page = await browser.newPage({ viewport: { width: 1280, height: 960 } });
  page.on('console', msg => console.log('PAGE:', msg.text()));
  page.on('pageerror', err => console.log('ERROR:', err.message));
  
  console.log('[EVIDENCE] Navigating to test_character_rig.html...');
  await page.goto('http://localhost:8099/test_character_rig.html');
  await page.waitForFunction(() => window.allLoaded === true, { timeout: 20000 });
  console.log('[EVIDENCE] All 9 models loaded successfully in WebGL scene!');
  
  const speciesList = ['eevee', 'vaporeon', 'jolteon', 'flareon', 'espeon', 'umbreon', 'leafeon', 'glaceon', 'sylveon'];
  const angles = ['front34', 'side', 'rear34'];
  const outDir = '/Users/andrew/.gemini/antigravity/brain/82942612-b373-4a12-8faf-ce167d7a8e77/renders/runtime';
  fs.mkdirSync(outDir, { recursive: true });
  
  for (const sp of speciesList) {
    console.log(`[EVIDENCE] Capturing species: ${sp.toUpperCase()}...`);
    await page.evaluate((s) => window.showSpecies(s), sp);
    await page.waitForTimeout(300);
    
    for (const ang of angles) {
      await page.evaluate((a) => window.setCameraAngle(a), ang);
      await page.waitForTimeout(200);
      const outPath = path.join(outDir, `${sp}_${ang}.png`);
      await page.screenshot({ path: outPath });
      console.log(`  Saved ${sp}_${ang}.png (${fs.statSync(outPath).size} bytes)`);
    }
  }
  
  console.log('[EVIDENCE COMPLETE] All multi-angle runtime evidence captured!');
  await browser.close();
}

capture().catch(console.error);
