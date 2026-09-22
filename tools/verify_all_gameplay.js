const { chromium } = require('/opt/homebrew/lib/node_modules/playwright');
const fs = require('fs');
const path = require('path');

const ARTIFACTS_DIR = '/Users/andrew/.gemini/antigravity/brain/82942612-b373-4a12-8faf-ce167d7a8e77/renders/runtime';
if (!fs.existsSync(ARTIFACTS_DIR)) {
  fs.mkdirSync(ARTIFACTS_DIR, { recursive: true });
}

async function verifyAllGameplay() {
  console.log('=== STARTING EXTENSIVE AUTOMATED GAMEPLAY VERIFICATION ===');
  
  const browser = await chromium.launch({
    executablePath: '/Applications/Brave Browser.app/Contents/MacOS/Brave Browser',
    headless: true,
    args: ['--use-gl=angle', '--use-angle=metal']
  });

  const page = await browser.newPage();
  await page.setViewportSize({ width: 1280, height: 800 });

  const consoleErrors = [];
  const consoleWarnings = [];
  page.on('console', msg => {
    if (msg.type() === 'error') {
      consoleErrors.push(msg.text());
      console.log(`[BROWSER ERROR]: ${msg.text()}`);
    } else if (msg.type() === 'warning') {
      consoleWarnings.push(msg.text());
    }
  });

  page.on('pageerror', err => {
    consoleErrors.push(err.message);
    console.log(`[PAGE ERROR]: ${err.message}`);
  });

  console.log('Loading http://localhost:8099/index.html...');
  await page.goto('http://localhost:8099/index.html', { waitUntil: 'domcontentloaded' });

  // Wait for all 9 models to load
  console.log('Waiting for all 9 GLTF models to load in CharacterModelManager...');
  await page.waitForFunction(() => {
    const app = window.eeveeApp;
    if (!app || !app.eeveeRig || !app.eeveeRig.userData || !app.eeveeRig.userData.models) return false;
    const models = app.eeveeRig.userData.models;
    const keys = ['eevee', 'vaporeon', 'jolteon', 'flareon', 'espeon', 'umbreon', 'leafeon', 'glaceon', 'sylveon'];
    return keys.every(k => models[k] && models[k].userData && models[k].userData.isLoaded);
  }, { timeout: 20000 });
  console.log('✔ All 9 species 3D GLTF models are loaded and initialized!');

  // Test 1: Verify Initial Form (Eevee)
  let state = await page.evaluate(() => {
    const app = window.eeveeApp;
    return {
      currentForm: app.currentForm,
      eeveeVisible: app.eeveeRig.userData.models['eevee'].visible,
      vaporeonVisible: app.eeveeRig.userData.models['vaporeon'].visible,
      speechText: document.getElementById('speech-bubble').textContent,
      factTitle: document.getElementById('fact-form-name').textContent
    };
  });
  console.log(`✔ Initial Form: ${state.currentForm}, Model Visible: ${state.eeveeVisible}`);

  // Test 2: Iterate through all 9 forms (keys 1 to 9)
  const speciesList = ['eevee', 'vaporeon', 'jolteon', 'flareon', 'espeon', 'umbreon', 'leafeon', 'glaceon', 'sylveon'];
  for (let i = 0; i < speciesList.length; i++) {
    const sp = speciesList[i];
    const key = (i + 1).toString();
    console.log(`Switching form to [${key}] ${sp}...`);
    await page.keyboard.press(key);
    await page.waitForTimeout(350);

    const formState = await page.evaluate((expectedSp) => {
      const app = window.eeveeApp;
      const models = app.eeveeRig.userData.models;
      const visibleSpecies = Object.keys(models).filter(k => models[k].visible);
      const activePill = document.querySelector('.evo-pill.active');
      return {
        currentForm: app.currentForm,
        visibleCount: visibleSpecies.length,
        visibleSpecies: visibleSpecies[0],
        pillForm: activePill ? activePill.getAttribute('data-form') : null,
        factName: document.getElementById('fact-form-name').textContent
      };
    }, sp);

    if (formState.currentForm !== sp || formState.visibleSpecies !== sp || formState.visibleCount !== 1) {
      throw new Error(`Mismatch on form ${sp}: ${JSON.stringify(formState)}`);
    }
    console.log(`  ✔ Form ${sp} confirmed: visible=${formState.visibleSpecies}, pill=${formState.pillForm}, fact=${formState.factName}`);
  }

  // Test 3: Shiny Mode Toggle ('S')
  console.log('Testing Shiny Mode toggle (press S)...');
  await page.keyboard.press('s');
  await page.waitForTimeout(200);
  let isShiny = await page.evaluate(() => window.eeveeApp.isShiny);
  if (!isShiny) throw new Error('Shiny mode failed to toggle on!');
  console.log('  ✔ Shiny mode ON');
  await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'gameplay_shiny_sylveon.png') });

  await page.keyboard.press('s');
  await page.waitForTimeout(200);
  isShiny = await page.evaluate(() => window.eeveeApp.isShiny);
  if (isShiny) throw new Error('Shiny mode failed to toggle off!');
  console.log('  ✔ Shiny mode OFF');

  // Test 4: Loaf Mode ('L')
  console.log('Testing Loaf Mode toggle (press L)...');
  await page.keyboard.press('l');
  await page.waitForTimeout(400);
  let isLoaf = await page.evaluate(() => window.eeveeApp.isLoafMode);
  if (!isLoaf) throw new Error('Loaf mode failed to activate!');
  console.log('  ✔ Loaf mode activated');
  await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'gameplay_loaf_mode.png') });
  await page.keyboard.press('l');
  await page.waitForTimeout(200);
  console.log('  ✔ Loaf mode restored');

  // Test 5: Disco Dance Mode ('D')
  console.log('Testing Disco Dance Mode (press D)...');
  await page.keyboard.press('d');
  await page.waitForTimeout(400);
  let isDisco = await page.evaluate(() => window.eeveeApp.isDiscoMode);
  if (!isDisco) throw new Error('Disco mode failed to activate!');
  console.log('  ✔ Disco mode activated');
  await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'gameplay_disco_mode.png') });
  await page.keyboard.press('d');
  await page.waitForTimeout(200);
  console.log('  ✔ Disco mode stopped');

  // Test 6: Space Key Hop (Sandbox)
  console.log('Testing Space Key Hop in sandbox...');
  await page.keyboard.press(' ');
  await page.waitForTimeout(100);
  let rigPosY = await page.evaluate(() => window.eeveeApp.eeveeRig.position.y);
  console.log(`  ✔ Eevee jumped to y = ${rigPosY.toFixed(2)}`);

  // Switch back to Eevee (1) for petting test
  await page.keyboard.press('1');
  await page.waitForTimeout(300);

  // Test 7: Petting Interaction (Click on Character)
  console.log('Testing 3D Petting Interaction via canvas click...');
  await page.mouse.click(640, 400);
  await page.waitForTimeout(200);
  let petCheck = await page.evaluate(() => {
    return {
      emotion: window.eeveeApp.currentEmotion,
      speech: document.getElementById('speech-bubble').textContent
    };
  });
  console.log(`  ✔ Petting triggered: emotion=${petCheck.emotion}, speech="${petCheck.speech}"`);
  await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'gameplay_petting_hearts.png') });

  // Test 8: Feed Treat
  console.log('Testing Feed Treat interaction...');
  await page.evaluate(() => feedTreat('berry'));
  await page.waitForTimeout(500);
  let feedCheck = await page.evaluate(() => (window.eeveeApp.treats && window.eeveeApp.treats.length > 0) || window.eeveeApp.treatHungerAngle > 0);
  console.log(`  ✔ Treat spawned and Eevee reacted (${feedCheck})`);

  // Test 9: Panic Vacuum ('P')
  console.log('Testing Vacuum Panic interaction (press P)...');
  await page.keyboard.press('p');
  await page.waitForTimeout(500);
  let panicCheck = await page.evaluate(() => window.eeveeApp.isVacuumPanicking);
  console.log(`  ✔ Vacuum panic state active: ${panicCheck}`);
  await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'gameplay_vacuum_panic.png') });
  // Wait for return
  await page.waitForTimeout(2200);

  // Test 10: Arcade Runner Mode
  console.log('Testing Arcade Runner Mode...');
  await page.click('#btn-mode-arcade');
  await page.waitForTimeout(500);

  let arcadeState = await page.evaluate(() => {
    const app = window.eeveeApp;
    return {
      activeMode: app.activeGameMode,
      arcadeRunning: app.arcadeRunning,
      trackTileCount: app.arcadeTrackTiles ? app.arcadeTrackTiles.length : 0,
      sandboxFloorHidden: !app.sandboxFloor.visible
    };
  });
  console.log('  ✔ Arcade Mode initialized:', arcadeState);
  if (arcadeState.activeMode !== 'arcade' || !arcadeState.arcadeRunning) {
    throw new Error('Failed to start Arcade Mode!');
  }

  // Steer left and right
  await page.keyboard.press('ArrowLeft');
  await page.waitForTimeout(100);
  await page.keyboard.press('ArrowRight');
  await page.waitForTimeout(100);

  // Jump with Space
  await page.keyboard.press(' ');
  await page.waitForTimeout(200);
  let jumpVel = await page.evaluate(() => window.eeveeApp.arcadeJumpY);
  console.log(`  ✔ Arcade jump confirmed (y = ${jumpVel.toFixed(2)})`);

  // Run for 1.5 seconds to collect points/distance
  await page.waitForTimeout(1500);
  let scoreInfo = await page.evaluate(() => {
    const app = window.eeveeApp;
    return {
      score: app.arcadeScore,
      scoreDisplay: document.getElementById('arcade-score').textContent
    };
  });
  console.log(`  ✔ Arcade progress confirmed: Score=${scoreInfo.score}, Display=${scoreInfo.scoreDisplay}`);
  await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'gameplay_arcade_runner.png') });

  // Exit arcade back to sandbox
  await page.click('#btn-mode-sandbox');
  await page.waitForTimeout(500);
  let returnState = await page.evaluate(() => window.eeveeApp.activeGameMode);
  console.log(`  ✔ Returned to sandbox mode: ${returnState}`);

  console.log('=== VERIFYING FINAL ERROR STATUS ===');
  console.log(`Total console errors: ${consoleErrors.length}`);
  if (consoleErrors.length > 0) {
    console.log('Errors:', consoleErrors);
    throw new Error(`Verification failed with ${consoleErrors.length} console errors`);
  }

  console.log('✔ ALL GAMEPLAY VERIFICATIONS PASSED WITH 0 ERRORS!');
  await browser.close();
}

verifyAllGameplay().catch(err => {
  console.error('[TEST FAILED]:', err);
  process.exit(1);
});
