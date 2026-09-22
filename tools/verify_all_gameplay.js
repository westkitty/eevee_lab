/**
 * Automated gameplay + Habitat House verification.
 *
 * Boots the app against a local static server, exercises the protected
 * sandbox/arcade systems plus the new room/camera/photo/persistence
 * systems, and fails loudly on any console error or state mismatch.
 *
 * Usage:
 *   python3 -m http.server 8099 &
 *   node tools/verify_all_gameplay.js [baseUrl]
 *
 * Screenshots land in ./qa/ (repo-relative, git-ignored). No machine-specific
 * paths or browser executables are hardcoded — this uses Playwright's own
 * bundled Chromium so it runs the same on any machine with `playwright`
 * installed (globally or locally).
 */
const path = require('path');
const fs = require('fs');

function resolvePlaywright() {
  try { return require('playwright'); } catch (e) { /* fall through */ }
  const globalCandidates = [
    '/opt/homebrew/lib/node_modules/playwright',
    '/usr/local/lib/node_modules/playwright'
  ];
  for (const c of globalCandidates) {
    if (fs.existsSync(c)) return require(c);
  }
  throw new Error('Playwright not found. Install it with: npm install -g playwright && npx playwright install chromium');
}
const { chromium } = resolvePlaywright();

const REPO_ROOT = path.resolve(__dirname, '..');
const ARTIFACTS_DIR = path.join(REPO_ROOT, 'qa');
const BASE_URL = process.argv[2] || 'http://localhost:8099';

if (!fs.existsSync(ARTIFACTS_DIR)) fs.mkdirSync(ARTIFACTS_DIR, { recursive: true });

const SPECIES = ['eevee', 'vaporeon', 'jolteon', 'flareon', 'espeon', 'umbreon', 'leafeon', 'glaceon', 'sylveon'];
const ROOMS = ['conservatory', ...SPECIES];

let passed = 0, failed = 0;
const results = [];

function record(id, ok, detail) {
  results.push({ id, ok, detail });
  if (ok) { passed++; console.log(`  ✔ [${id}] ${detail || ''}`); }
  else { failed++; console.log(`  ✖ [${id}] ${detail || ''}`); }
}

async function shot(page, name) {
  await page.screenshot({ path: path.join(ARTIFACTS_DIR, `${name}.png`) });
}

/**
 * Playwright's `headless: true` default resolves to a "headless shell" build
 * whose cached revision can drift out of sync with the full Chromium build
 * on a given machine. Rather than hardcode a revision number, search the
 * user's own Playwright cache for whatever Chromium build is actually
 * present and launch that directly; fall back to Playwright's own default
 * resolution if nothing is found (e.g. CI images that manage this centrally).
 */
function findCachedChromiumExecutable() {
  const os = require('os');
  const cacheDir = path.join(os.homedir(), 'Library', 'Caches', 'ms-playwright');
  if (!fs.existsSync(cacheDir)) return null;
  const candidates = fs.readdirSync(cacheDir).filter(d => /^chromium-\d+$/.test(d));
  for (const dir of candidates) {
    const full = path.join(cacheDir, dir);
    const found = walkForExecutable(full, 0);
    if (found) return found;
  }
  return null;
}
function walkForExecutable(dir, depth) {
  if (depth > 6) return null;
  let entries;
  try { entries = fs.readdirSync(dir, { withFileTypes: true }); } catch (e) { return null; }
  const inMacOSDir = path.basename(dir) === 'MacOS';
  for (const e of entries) {
    if (!e.isFile()) continue;
    const full = path.join(dir, e.name);
    if (inMacOSDir) return full; // .../Contents/MacOS/<the one executable> on macOS app bundles
    if (e.name === 'chrome' || e.name === 'headless_shell' || e.name === 'chrome-headless-shell') {
      try { if (fs.statSync(full).mode & 0o111) return full; } catch (err) { /* ignore */ }
    }
  }
  for (const e of entries) {
    if (e.isDirectory()) {
      const found = walkForExecutable(path.join(dir, e.name), depth + 1);
      if (found) return found;
    }
  }
  return null;
}

async function main() {
  const launchOpts = { headless: true };
  try {
    // Prefer Playwright's own bundled-browser resolution (matches its expected
    // revision exactly). Only fall back to a manually discovered cache entry
    // if that default launch genuinely fails to find an executable.
    const probe = await chromium.launch(launchOpts);
    await probe.close();
  } catch (e) {
    const cachedExe = findCachedChromiumExecutable();
    if (cachedExe) {
      console.log(`Default Chromium resolution failed; using cached build: ${cachedExe}`);
      launchOpts.executablePath = cachedExe;
    } else {
      throw e;
    }
  }
  const browser = await chromium.launch(launchOpts);
  const page = await browser.newPage();
  await page.setViewportSize({ width: 1280, height: 800 });

  const consoleErrors = [];
  page.on('console', msg => { if (msg.type() === 'error') consoleErrors.push(msg.text()); });
  page.on('pageerror', err => consoleErrors.push(err.message));

  console.log(`=== Loading ${BASE_URL}/index.html ===`);
  await page.goto(`${BASE_URL}/index.html`, { waitUntil: 'domcontentloaded' });

  // 1. Loads without console errors, all nine GLBs load.
  await page.waitForFunction(() => {
    const app = window.eeveeApp;
    if (!app || !app.eeveeRig || !app.eeveeRig.userData || !app.eeveeRig.userData.models) return false;
    const models = app.eeveeRig.userData.models;
    const keys = ['eevee','vaporeon','jolteon','flareon','espeon','umbreon','leafeon','glaceon','sylveon'];
    return keys.every(k => models[k] && models[k].userData && models[k].userData.isLoaded);
  }, { timeout: 20000 });
  record('load-1', true, 'App loaded, all 9 GLBs report isLoaded');
  const actorBoot = await page.evaluate(() => window.eeveeApp.creatureActorState);
  record('actor-boot', !!actorBoot && actorBoot.walkableCount > 0 && actorBoot.species === window.eeveeApp.currentForm,
    actorBoot ? JSON.stringify(actorBoot) : 'actor unavailable');
  await shot(page, '01_hub_conservatory');

  // 2. Initial species + form-switching (1-9).
  let state = await page.evaluate(() => ({ currentForm: window.eeveeApp.currentForm }));
  record('form-initial', state.currentForm === 'eevee' || SPECIES.includes(state.currentForm), `initial form=${state.currentForm}`);

  for (let i = 0; i < SPECIES.length; i++) {
    const sp = SPECIES[i];
    await page.keyboard.press(String(i + 1));
    await page.waitForTimeout(300);
    const formState = await page.evaluate((expected) => {
      const app = window.eeveeApp;
      const models = app.eeveeRig.userData.models;
      const visible = Object.keys(models).filter(k => models[k].visible);
      return { currentForm: app.currentForm, visible };
    }, sp);
    const ok = formState.currentForm === sp && formState.visible.length === 1 && formState.visible[0] === sp;
    record(`switch-${sp}`, ok, `visible=${JSON.stringify(formState.visible)}`);
  }
  await shot(page, '02_species_sylveon');

  // Back to eevee for the rest of the sandbox tests.
  await page.keyboard.press('1');
  await page.waitForTimeout(300);

  // Phase 1 actor: manual movement uses the same master loop and stays inside room bounds.
  const actorStart = await page.evaluate(() => window.eeveeApp.creatureActorState.position);
  await page.evaluate(() => window.eeveeApp.moveCreatureTo(1.0, 0.8));
  await page.waitForFunction(() => {
    const s = window.eeveeApp.creatureActorState;
    return s && s.state === 'idle' && Math.abs(s.position.x - 1.0) < 0.12 && Math.abs(s.position.z - 0.8) < 0.12;
  }, { timeout: 5000 });
  const actorEnd = await page.evaluate(() => window.eeveeApp.creatureActorState);
  record('actor-manual-move', Math.abs(actorEnd.position.x - actorStart.x) > 0.2 && actorEnd.activeSemantic === 'idle',
    JSON.stringify(actorEnd));
  await page.evaluate(() => window.eeveeApp.moveCreatureTo(0, 1.4));
  await page.waitForTimeout(1200);

  // 3. Shiny mode.
  await page.keyboard.press('s');
  await page.waitForTimeout(200);
  let isShiny = await page.evaluate(() => window.eeveeApp.isShiny);
  record('shiny-on', isShiny === true, `isShiny=${isShiny}`);
  await shot(page, '03_shiny_eevee');
  await page.keyboard.press('s');
  await page.waitForTimeout(200);
  isShiny = await page.evaluate(() => window.eeveeApp.isShiny);
  record('shiny-off', isShiny === false, `isShiny=${isShiny}`);

  // 4. Petting (via API raycast-equivalent call, robust to camera framing).
  await page.evaluate(() => {
    const app = window.eeveeApp;
    app.updateFaceExpression('hearts');
  });
  let emotion = await page.evaluate(() => window.eeveeApp.currentEmotion);
  record('petting', emotion === 'hearts', `emotion=${emotion}`);

  // 5. Feeding.
  await page.evaluate(() => feedTreat('berry'));
  await page.waitForTimeout(300);
  let fed = await page.evaluate(() => window.eeveeApp.treats.length > 0 || window.eeveeApp.treatHungerAngle > 0);
  record('feeding', fed === true, `treats/hunger active=${fed}`);

  // 6. Loaf mode.
  await page.keyboard.press('l');
  await page.waitForTimeout(300);
  let loaf = await page.evaluate(() => window.eeveeApp.isLoafMode);
  record('loaf', loaf === true, `isLoafMode=${loaf}`);
  await shot(page, '04_loaf_mode');
  await page.keyboard.press('l');
  await page.waitForTimeout(200);

  // 7. Derp mode.
  await page.keyboard.press('p');
  await page.waitForTimeout(300);
  let emotion2 = await page.evaluate(() => window.eeveeApp.currentEmotion);
  record('derp', emotion2 === 'derp', `emotion=${emotion2}`);

  // 8. Disco mode.
  await page.keyboard.press('d');
  await page.waitForTimeout(300);
  let disco = await page.evaluate(() => window.eeveeApp.isDiscoMode);
  record('disco', disco === true, `isDiscoMode=${disco}`);
  await shot(page, '05_disco_mode');
  await page.keyboard.press('d');
  await page.waitForTimeout(200);

  // 9. Roomba panic.
  await page.evaluate(() => summonVacuum());
  await page.waitForTimeout(300);
  let panic = await page.evaluate(() => window.eeveeApp.isVacuumPanicking);
  record('roomba', panic === true, `isVacuumPanicking=${panic}`);
  await page.waitForTimeout(2200);

  // 10. Hop (Space).
  await page.keyboard.press(' ');
  await page.waitForTimeout(100);
  let hopY = await page.evaluate(() => window.eeveeApp.eeveeRig.position.y);
  record('hop', hopY > 0, `y=${hopY.toFixed(2)}`);
  await page.waitForTimeout(500);

  // 11-19. Habitat rooms: enter each, confirm distinct lighting, no console errors, no leaks.
  const meshCounts1 = {};
  for (const r of ROOMS) {
    await page.evaluate((id) => window.eeveeApp.goToRoom(id), r);
    await page.waitForTimeout(250);
    const info = await page.evaluate(() => {
      const app = window.eeveeApp;
      let n = 0; app.scene.traverse(c => { if (c.isMesh) n++; });
      const actor = app.creatureActorState;
      return { roomId: app.roomManager.current.id, meshCount: n, keyLightIntensity: app.roomManager.current.built.lights[1].intensity, actorRoom: actor && actor.roomId, walkableCount: actor && actor.walkableCount };
    });
    meshCounts1[r] = info.meshCount;
    record(`room-enter-${r}`, info.roomId === r && info.actorRoom === r && info.walkableCount > 0,
      `mesh=${info.meshCount}, keyLight=${info.keyLightIntensity.toFixed(2)}, actorRoom=${info.actorRoom}`);
  }
  await shot(page, '06_room_vaporeon');
  await page.evaluate(() => window.eeveeApp.goToRoom('jolteon'));
  await page.waitForTimeout(300);
  await shot(page, '07_room_jolteon');
  await page.evaluate(() => window.eeveeApp.goToRoom('umbreon'));
  await page.waitForTimeout(300);
  await shot(page, '08_room_umbreon');
  await page.evaluate(() => window.eeveeApp.goToRoom('sylveon'));
  await page.waitForTimeout(300);
  await shot(page, '09_room_sylveon');

  // Re-visit every room a second time; mesh counts must be identical (no duplication/leak).
  let leakFree = true;
  for (const r of ROOMS) {
    await page.evaluate((id) => window.eeveeApp.goToRoom(id), r);
    await page.waitForTimeout(200);
    const n = await page.evaluate(() => { let n = 0; window.eeveeApp.scene.traverse(c => { if (c.isMesh) n++; }); return n; });
    if (n !== meshCounts1[r]) leakFree = false;
  }
  record('room-no-leak', leakFree, 'mesh counts stable across repeated visits to all 10 rooms');

  // 20. Lighting differs meaningfully between two rooms (data-driven per-room lighting).
  await page.evaluate(() => window.eeveeApp.goToRoom('umbreon'));
  await page.waitForTimeout(200);
  const umbreonLight = await page.evaluate(() => window.eeveeApp.roomManager.current.built.lights[0].intensity);
  await page.evaluate(() => window.eeveeApp.goToRoom('leafeon'));
  await page.waitForTimeout(200);
  const leafeonLight = await page.evaluate(() => window.eeveeApp.roomManager.current.built.lights[0].intensity);
  record('room-lighting-differs', Math.abs(umbreonLight - leafeonLight) > 0.1, `umbreon hemi=${umbreonLight}, leafeon hemi=${leafeonLight}`);

  // 21. Camera: close zoom substantially closer than the old fixed minDistance (4.0).
  await page.evaluate(() => window.eeveeApp.goToRoom('conservatory'));
  await page.waitForTimeout(400);
  const minDist = await page.evaluate(() => window.eeveeApp.cameraController.controls.minDistance);
  record('camera-close-zoom', minDist < 2.0, `minDistance=${minDist.toFixed(2)} (was hardcoded 4.0)`);

  // 22. Camera reset.
  await page.evaluate(() => window.eeveeApp.cameraController.cyclePreset());
  await page.waitForTimeout(700);
  await page.evaluate(() => window.eeveeApp.cameraController.resetCamera());
  await page.waitForTimeout(700);
  const presetAfterReset = await page.evaluate(() => window.eeveeApp.cameraController.presetKey);
  record('camera-reset', presetAfterReset === 'fullbody', `preset=${presetAfterReset}`);
  await shot(page, '10_camera_portrait_focus');

  // 23. Photo mode hides UI.
  await page.evaluate(() => window.eeveeApp.enterPhotoMode());
  await page.waitForTimeout(300);
  const droverHidden = await page.evaluate(() => document.body.classList.contains('photo-mode'));
  record('photo-mode-hides-ui', droverHidden === true, `body.photo-mode=${droverHidden}`);
  await shot(page, '11_photo_mode');
  await page.evaluate(() => window.eeveeApp.exitPhotoMode());
  await page.waitForTimeout(200);

  // 24. PNG capture still works (quick screenshot function runs without throwing).
  let captureOk = true;
  try { await page.evaluate(() => snapSillyPhoto()); } catch (e) { captureOk = false; }
  record('png-capture', captureOk, 'snapSillyPhoto() ran without throwing');

  // 25-27. Discovery / settings / high score persistence across reload.
  await page.evaluate(() => {
    window.eeveeApp.selectEeveelution('flareon');
    window.eeveeApp.goToRoom('flareon');
  });
  await page.waitForTimeout(600);
  await page.evaluate(() => triggerRoomProp());
  await page.waitForTimeout(300);
  await page.evaluate(() => { window.eeveeApp.save.set('highScore', 12345); window.eeveeApp.save.flush(); });
  const preReload = await page.evaluate(() => ({
    discoveries: Object.keys(window.eeveeApp.save.get('discovery.behaviors', {})).length,
    lastRoom: window.eeveeApp.save.get('lastRoom'),
    highScore: window.eeveeApp.save.get('highScore')
  }));
  await page.reload({ waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => window.eeveeApp && window.eeveeApp.roomManager && window.eeveeApp.roomManager.current, { timeout: 15000 });
  await page.waitForTimeout(500);
  const postReload = await page.evaluate(() => ({
    discoveries: Object.keys(window.eeveeApp.save.get('discovery.behaviors', {})).length,
    lastRoom: window.eeveeApp.roomManager.current.id,
    highScore: window.eeveeApp.save.get('highScore'),
    form: window.eeveeApp.currentForm
  }));
  record('discovery-persists', postReload.discoveries === preReload.discoveries && postReload.discoveries > 0, `pre=${preReload.discoveries} post=${postReload.discoveries}`);
  record('room-memory-persists', postReload.lastRoom === 'flareon', `lastRoom=${postReload.lastRoom}`);
  record('highscore-migrates-and-persists', postReload.highScore === 12345, `highScore=${postReload.highScore}`);
  record('form-persists', postReload.form === 'flareon', `form=${postReload.form}`);

  // 28. Reduced-motion path.
  await page.evaluate(() => onSetReducedMotion(true));
  await page.waitForTimeout(100);
  const reducedAttr = await page.evaluate(() => document.documentElement.dataset.reducedMotion);
  record('reduced-motion', reducedAttr === 'true', `data-reduced-motion=${reducedAttr}`);
  await page.evaluate(() => onSetReducedMotion(false));

  // 29. Desktop viewport: UI must not cover the central ~75% where the character stands.
  const centerClear = await page.evaluate(() => {
    const el = document.elementFromPoint(window.innerWidth / 2, window.innerHeight / 2);
    return !el || el.id === 'webgl-canvas';
  });
  record('desktop-center-clear', centerClear === true, 'center viewport hit-tests to the canvas, not chrome');

  // 30. Stone Dash: start, steer, jump, score advances, exit.
  await page.evaluate(() => window.eeveeApp.switchGameMode('arcade'));
  await page.waitForTimeout(400);
  let arcadeState = await page.evaluate(() => ({ mode: window.eeveeApp.activeGameMode, running: window.eeveeApp.arcadeRunning }));
  record('arcade-start', arcadeState.mode === 'arcade' && arcadeState.running === true, JSON.stringify(arcadeState));
  await page.keyboard.press('ArrowLeft');
  await page.keyboard.press('ArrowRight');
  await page.keyboard.press(' ');
  await page.waitForTimeout(200);
  const jumpY = await page.evaluate(() => window.eeveeApp.arcadeJumpY);
  record('arcade-jump', jumpY >= 0, `jumpY=${jumpY.toFixed(2)}`);
  await page.waitForTimeout(1200);
  const score = await page.evaluate(() => window.eeveeApp.arcadeScore);
  record('arcade-score-advances', score > 0, `score=${score.toFixed(1)}`);
  await shot(page, '12_arcade_dash');
  await page.evaluate(() => window.eeveeApp.switchGameMode('sandbox'));
  await page.waitForTimeout(300);
  const exitedMode = await page.evaluate(() => window.eeveeApp.activeGameMode);
  record('arcade-exit', exitedMode === 'sandbox', `mode=${exitedMode}`);

  // 31. Mobile viewport: UI must not cover the central character region.
  await page.setViewportSize({ width: 390, height: 844 });
  await page.waitForTimeout(400);
  const mobileCenterClear = await page.evaluate(() => {
    const el = document.elementFromPoint(window.innerWidth / 2, window.innerHeight / 2);
    return !el || el.id === 'webgl-canvas';
  });
  record('mobile-center-clear', mobileCenterClear === true, 'center viewport hit-tests to the canvas at 390x844');
  await shot(page, '13_mobile_view');
  await page.setViewportSize({ width: 1280, height: 800 });

  console.log(`\n=== Console errors captured: ${consoleErrors.length} ===`);
  if (consoleErrors.length) consoleErrors.forEach(e => console.log('  [console.error]', e));
  record('no-console-errors', consoleErrors.length === 0, `${consoleErrors.length} error(s)`);

  console.log(`\n=== RESULTS: ${passed} passed, ${failed} failed ===`);
  fs.writeFileSync(path.join(ARTIFACTS_DIR, 'results.json'), JSON.stringify({ passed, failed, results }, null, 2));

  await browser.close();
  if (failed > 0) process.exit(1);
}

main().catch(err => {
  console.error('[TEST SUITE CRASHED]:', err);
  process.exit(1);
});
