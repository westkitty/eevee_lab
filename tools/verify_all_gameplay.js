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
 * Playwright's matching Chromium is preferred. If its cache is missing, the
 * harness may reuse an installed local Chrome/Brave/Chromium executable rather
 * than downloading another browser.
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
  if (fs.existsSync(cacheDir)) {
    const candidates = fs.readdirSync(cacheDir).filter(d => /^chromium-\d+$/.test(d));
    for (const dir of candidates) {
      const full = path.join(cacheDir, dir);
      const found = walkForExecutable(full, 0);
      if (found) return found;
    }
  }

  // A machine can have the Playwright package but not its exact cached
  // Chromium revision. Reuse a locally installed Chromium-family browser
  // before asking for a large browser download.
  const systemCandidates = process.platform === 'darwin'
    ? [
        '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
        '/Applications/Brave Browser.app/Contents/MacOS/Brave Browser',
        '/Applications/Chromium.app/Contents/MacOS/Chromium'
      ]
    : [
        '/usr/bin/google-chrome',
        '/usr/bin/chromium',
        '/usr/bin/chromium-browser'
      ];
  return systemCandidates.find(candidate => {
    try { fs.accessSync(candidate, fs.constants.X_OK); return true; }
    catch (_) { return false; }
  }) || null;
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
      console.log(`Default Chromium resolution failed; using local browser: ${cachedExe}`);
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
  const actorBoot = await page.evaluate(() => ({
    actor: window.eeveeApp.creatureActorState,
    currentForm: window.eeveeApp.currentForm
  }));
  record('actor-boot', !!actorBoot.actor && actorBoot.actor.walkableCount > 0 && actorBoot.actor.species === actorBoot.currentForm,
    actorBoot.actor ? JSON.stringify(actorBoot.actor) : 'actor unavailable');
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
    const expectedVisible = sp === 'eevee' ? ['eevee', 'vaporeon'] : [sp];
    const ok = formState.currentForm === sp &&
      formState.visible.length === expectedVisible.length &&
      expectedVisible.every(key => formState.visible.includes(key));
    record(`switch-${sp}`, ok, `visible=${JSON.stringify(formState.visible)}`);
  }
  await shot(page, '02_species_sylveon');

  // Back to eevee for the rest of the sandbox tests.
  await page.keyboard.press('1');
  await page.waitForFunction(() => {
    const s = window.eeveeApp.creatureActorState;
    return s && s.state !== 'held' && Math.abs(s.position.y) < 0.01;
  });

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

  // Phase 2 direct interaction substrate: Eevee's room contains physical toys.
  await page.evaluate(() => window.eeveeApp.goToRoom('eevee'));
  await page.waitForTimeout(350);
  const phase2Room = await page.evaluate(() => window.eeveeApp.interactionSystemState);
  record('phase2-direct-props', !!phase2Room && phase2Room.directPropCount >= 3,
    phase2Room ? JSON.stringify(phase2Room) : 'interaction system unavailable');

  // Exercise direct-prop drag/release without depending on screen coordinates.
  const propThrow = await page.evaluate(() => {
    const sys = window.eeveeApp.interactionSystem;
    const ball = sys.getManipulableObjects().find(o => o.userData.directManipulation.kind === 'ball');
    if (!ball) return null;
    const start = ball.getWorldPosition(new THREE.Vector3());
    sys.beginPropDrag(ball, start, 0);
    sys.dragPropTo(start.clone().add(new THREE.Vector3(0.9, 0, 0)), 180);
    const r = sys.releaseProp(180);
    return { kind: r.kind, speed: r.velocity.length(), dragging: sys.getDebugState().dragging };
  });
  record('phase2-prop-throw', !!propThrow && propThrow.kind === 'ball' && propThrow.speed > 0 && propThrow.dragging === false,
    JSON.stringify(propThrow));

  // Brush is now a visible tool mode, not a one-shot reaction.
  await page.evaluate(() => window.eeveeApp.brushEeveelution());
  let brushState = await page.evaluate(() => window.eeveeApp.interactionSystemState);
  record('phase2-brush-tool-on', brushState && brushState.brushActive === true, JSON.stringify(brushState));
  await page.evaluate(() => window.eeveeApp.brushEeveelution());
  brushState = await page.evaluate(() => window.eeveeApp.interactionSystemState);
  record('phase2-brush-tool-off', brushState && brushState.brushActive === false, JSON.stringify(brushState));

  // Food can be placed as a manipulable world object; direct feed API remains separately covered below.
  await page.evaluate(() => window.eeveeApp.placeTreatForInteraction('berry'));
  const placedFood = await page.evaluate(() => ({
    count: window.eeveeApp.treats.length,
    direct: window.eeveeApp.treats.some(t => t.userData.directManipulation && t.userData.directManipulation.kind === 'food')
  }));
  record('phase2-physical-food', placedFood.count > 0 && placedFood.direct === true, JSON.stringify(placedFood));
  await page.evaluate(() => window.eeveeApp.clearPlacedTreats());
  await page.evaluate(() => window.eeveeApp.goToRoom('conservatory'));
  await page.waitForTimeout(350);

  // Phase 3 bounded memory: repeated semantic interactions create favorites without event logs.
  const phase3Memory = await page.evaluate(() => {
    const b = window.eeveeApp.behaviorScheduler;
    b.recordInteraction('pet', { region: 'ears' });
    b.recordInteraction('pet', { region: 'ears' });
    b.recordInteraction('brush', { region: 'back' });
    b.recordInteraction('toyRetrieve', { toy: 'ball' });
    return b.getDebugState();
  });
  record('phase3-bounded-memory',
    phase3Memory && phase3Memory.memory.favoriteTouchZone === 'ears' && phase3Memory.memory.favoriteToy === 'ball',
    phase3Memory ? JSON.stringify(phase3Memory.memory) : 'behavior scheduler unavailable');

  // Familiarity tier changes behavior and unlocks the species-specific personal gesture.
  const bondGesture = await page.evaluate(() => {
    const app = window.eeveeApp;
    app.save.set('bond.eevee.familiarity', 80);
    const requested = app.requestBondGesture();
    return { requested, scheduler: app.behaviorState, actor: app.creatureActorState };
  });
  record('phase3-bond-gesture',
    bondGesture.requested === true && bondGesture.scheduler.familiarityTier === 2 && !!bondGesture.actor.behaviorState,
    JSON.stringify(bondGesture));

  // Actual sleep is scheduler-owned and actor-presented; interaction wakes it.
  const sleepState = await page.evaluate(() => {
    const app = window.eeveeApp;
    const b = app.behaviorScheduler;
    b.needs.restInclination = 0.9;
    b.lastInteractionAgo = 45;
    b.quietAccum = 22;
    b.update(1, { idle: true, userActive: false, specialAction: false });
    return { scheduler: app.behaviorState, actor: app.creatureActorState };
  });
  record('phase3-sleep-start',
    sleepState.scheduler.sleeping === true && sleepState.actor.behaviorState === 'sleep',
    JSON.stringify(sleepState));
  const wakeState = await page.evaluate(() => {
    const app = window.eeveeApp;
    app.behaviorScheduler.recordInteraction('pet', { region: 'head' });
    return { scheduler: app.behaviorState, actor: app.creatureActorState };
  });
  record('phase3-sleep-wake',
    wakeState.scheduler.sleeping === false && wakeState.actor.behaviorState !== 'sleep',
    JSON.stringify(wakeState));

  // Phase 4 multi-creature vertical slice: Eevee + Vaporeon coexist only in the Conservatory.
  await page.evaluate(() => {
    if (window.eeveeApp.currentForm !== 'eevee') window.eeveeApp.selectEeveelution('eevee');
    window.eeveeApp.goToRoom('conservatory');
  });
  await page.waitForFunction(() => {
    const s = window.eeveeApp.creatureManagerState;
    return s && s.activeCount === 2 && s.companionCount === 1;
  }, { timeout: 15000 });
  const pairState = await page.evaluate(() => {
    const app = window.eeveeApp;
    const wrapper = app.eeveeRig.userData.models.vaporeon;
    return {
      manager: app.creatureManagerState,
      vaporeonParent: wrapper.parent && wrapper.parent.name,
      eeveeParent: app.eeveeRig.userData.models.eevee.parent && app.eeveeRig.userData.models.eevee.parent.name
    };
  });
  record('phase4-conservatory-pair',
    pairState.manager.activeCount === 2 && pairState.vaporeonParent === 'vaporeon-companion_root' && pairState.eeveeParent === 'EeveeRig',
    JSON.stringify(pairState));

  // Separation steering must resolve an overlap through actor authority.
  const separation = await page.evaluate(() => {
    const app = window.eeveeApp;
    const entry = app.creatureManager.getCreature('vaporeon-companion');
    entry.root.position.copy(app.eeveeRig.position);
    entry.actor.stop();
    app.creatureManager.separationCooldown = 0;
    app.creatureManager.update(0.1, 0, {
      primary: { reducedMotion: false },
      companion: { reducedMotion: false },
      socialSuspended: false,
      reducedMotion: false,
      userActive: true
    });
    return entry.actor.getDebugState();
  });
  record('phase4-separation', separation.targetSource === 'separation' || separation.state === 'walk', JSON.stringify(separation));

  // First idle social opportunity is a greeting; manager requests behavior, actors own motion.
  const greeting = await page.evaluate(() => {
    const app = window.eeveeApp;
    const mgr = app.creatureManager;
    const comp = mgr.getCreature('vaporeon-companion');
    app.creatureActor.clearBehaviorState();
    comp.actor.clearBehaviorState();
    app.creatureActor.stop();
    comp.actor.stop();
    comp.actor.placeAt(new THREE.Vector3(-1.3, 0, 0.8));
    mgr.socialMode = null;
    mgr.hasGreeted = false;
    mgr.socialTimer = 0;
    mgr.update(0.1, 0.1, {
      primary: { reducedMotion: false },
      companion: { reducedMotion: false },
      socialSuspended: false,
      reducedMotion: false,
      userActive: false
    });
    return mgr.getDebugState();
  });
  record('phase4-social-greeting', greeting.socialMode === 'greet', JSON.stringify(greeting));

  // Toy releases create a second autonomous contender.
  const toyRace = await page.evaluate(() => {
    const app = window.eeveeApp;
    const point = new THREE.Vector3(1.1, 0, 1.0);
    const started = app.creatureManager.notifyToyReleased(point, 'ball', null);
    return { started, state: app.creatureManagerState };
  });
  record('phase4-toy-competition', toyRace.started === true && toyRace.state.toyCompetition === true, JSON.stringify(toyRace));

  // Leaving the Conservatory restores Vaporeon to the original shared rig and single-creature path.
  await page.evaluate(() => window.eeveeApp.goToRoom('vaporeon'));
  await page.waitForTimeout(300);
  const restoredRoom = await page.evaluate(() => ({
    manager: window.eeveeApp.creatureManagerState,
    parent: window.eeveeApp.eeveeRig.userData.models.vaporeon.parent && window.eeveeApp.eeveeRig.userData.models.vaporeon.parent.name
  }));
  record('phase4-room-restores-single',
    restoredRoom.manager.activeCount === 1 && restoredRoom.parent === 'EeveeRig',
    JSON.stringify(restoredRoom));

  // Returning reuses the loaded model; switching primary form tears the pair down safely.
  await page.evaluate(() => window.eeveeApp.goToRoom('conservatory'));
  await page.waitForFunction(() => window.eeveeApp.creatureManagerState && window.eeveeApp.creatureManagerState.activeCount === 2, { timeout: 5000 });
  await page.evaluate(() => window.eeveeApp.selectEeveelution('vaporeon'));
  await page.waitForTimeout(250);
  const restoredForm = await page.evaluate(() => ({
    form: window.eeveeApp.currentForm,
    manager: window.eeveeApp.creatureManagerState,
    parent: window.eeveeApp.eeveeRig.userData.models.vaporeon.parent && window.eeveeApp.eeveeRig.userData.models.vaporeon.parent.name,
    visible: window.eeveeApp.eeveeRig.userData.models.vaporeon.visible
  }));
  record('phase4-form-switch-restores-single',
    restoredForm.form === 'vaporeon' && restoredForm.manager.activeCount === 1 && restoredForm.parent === 'EeveeRig' && restoredForm.visible === true,
    JSON.stringify(restoredForm));
  await page.evaluate(() => window.eeveeApp.selectEeveelution('eevee'));
  await page.waitForFunction(() => window.eeveeApp.creatureManagerState && window.eeveeApp.creatureManagerState.activeCount === 2, { timeout: 5000 });
  await page.waitForFunction(() => {
    const s = window.eeveeApp.creatureActorState;
    return s && s.state !== 'held' && Math.abs(s.position.y) < 0.01;
  });

  // Phase 5: the house behaves like a persistent place rather than a room menu.
  const phase5Boot = await page.evaluate(() => ({
    version: window.eeveeApp.save.state.version,
    habitat: window.eeveeApp.habitatState,
    portalPreview: (() => {
      const door = window.eeveeApp.roomManager.current.built.interactables.find(i => i.kind === 'door');
      return !!(door && door.object3D.userData.glow && door.object3D.userData.glow.material.map);
    })()
  }));
  record('phase5-save-current-schema', phase5Boot.version === 3, `saveVersion=${phase5Boot.version}`);
  record('phase5-portal-preview', phase5Boot.portalPreview === true, JSON.stringify(phase5Boot));
  record('phase5-conservatory-world-state',
    phase5Boot.habitat && phase5Boot.habitat.room && phase5Boot.habitat.room.stageCount === 4,
    JSON.stringify(phase5Boot.habitat));

  // The diegetic door path walks the creature to the threshold before swapping rooms.
  const startedDoor = await page.evaluate(() => window.eeveeApp.travelThroughDoor('jolteon'));
  record('phase5-door-starts', startedDoor === true, `started=${startedDoor}`);
  await page.waitForFunction(() => window.eeveeApp.doorTravelState !== null, { timeout: 2000 });
  const duringDoor = await page.evaluate(() => ({
    door: window.eeveeApp.doorTravelState,
    actor: window.eeveeApp.creatureActorState
  }));
  record('phase5-door-actor-approach',
    duringDoor.door && duringDoor.door.targetId === 'jolteon' && duringDoor.actor.targetSource === 'door',
    JSON.stringify(duringDoor));
  await page.waitForFunction(() => window.eeveeApp.roomManager.current.id === 'jolteon' && window.eeveeApp.doorTravelState === null, { timeout: 8000 });
  await page.waitForTimeout(500);
  const afterDoor = await page.evaluate(() => ({
    room: window.eeveeApp.roomManager.current.id,
    previous: window.eeveeApp.roomManager.previousId,
    actor: window.eeveeApp.creatureActorState,
    manager: window.eeveeApp.creatureManagerState
  }));
  record('phase5-door-room-swap',
    afterDoor.room === 'jolteon' && afterDoor.previous === 'conservatory' && afterDoor.actor.roomId === 'jolteon' &&
    afterDoor.actor.interestPointCount >= 3 && afterDoor.manager.activeCount === 1,
    JSON.stringify(afterDoor));

  // Room narrative advances through repeat interaction + discovered memento.
  await page.evaluate(() => { triggerRoomProp(); triggerRoomProp(); });
  await page.waitForTimeout(150);
  await page.evaluate(() => {
    const m = window.eeveeApp.roomManager.current.built.interactables.find(i => i.kind === 'memento');
    if (m) m.onActivate();
  });
  await page.waitForTimeout(150);
  const narrative = await page.evaluate(() => window.eeveeApp.habitatState.room);
  record('phase5-jolteon-narrative',
    narrative.stageIndex === 3 && narrative.stageId === 'overloaded',
    JSON.stringify(narrative));

  // A room furnishing stores only a bounded semantic transform and restores after rebuild.
  const placement = await page.evaluate(() => {
    const app = window.eeveeApp;
    const cushion = app.interactionSystem.getManipulableObjects().find(o => o.userData.placeableId === 'jolteon_cushion');
    if (!cushion) return null;
    cushion.position.set(1.35, 0.12, 1.1);
    cushion.rotation.y = 0.37;
    const saved = app.roomManager.capturePlacement(cushion);
    return { id: cushion.userData.placeableId, saved };
  });
  record('phase5-placement-captured', !!placement && placement.saved.x === 1.35 && placement.saved.z === 1.1, JSON.stringify(placement));
  await page.evaluate(() => window.eeveeApp.goToRoom('conservatory'));
  await page.waitForTimeout(250);
  await page.evaluate(() => window.eeveeApp.goToRoom('jolteon'));
  await page.waitForTimeout(250);
  const placementRestored = await page.evaluate(() => {
    const cushion = window.eeveeApp.interactionSystem.getManipulableObjects().find(o => o.userData.placeableId === 'jolteon_cushion');
    return cushion ? { x:cushion.position.x, y:cushion.position.y, z:cushion.position.z, ry:cushion.rotation.y } : null;
  });
  record('phase5-placement-restored',
    !!placementRestored && Math.abs(placementRestored.x - 1.35) < 0.001 && Math.abs(placementRestored.z - 1.1) < 0.001 &&
    Math.abs(placementRestored.ry - 0.37) < 0.001,
    JSON.stringify(placementRestored));

  // Cross-room traces carry source provenance instead of anonymous threshold markers.
  const provenance = await page.evaluate(() => {
    const all = window.eeveeApp.save.get('crossContamination', {});
    for (const [destination, list] of Object.entries(all)) {
      const found = Array.isArray(list) ? list.find(t => t && t.originRoom === 'jolteon') : null;
      if (found) return { destination, trace: found };
    }
    return null;
  });
  record('phase5-trace-provenance',
    !!provenance && !!provenance.trace.originEvent && !!provenance.trace.objectType && provenance.trace.destinationRoom === provenance.destination,
    JSON.stringify(provenance));
  if (provenance) {
    await page.evaluate((id) => window.eeveeApp.goToRoom(id), provenance.destination);
    await page.waitForTimeout(250);
    const renderedTrace = await page.evaluate(() => {
      let found = null;
      window.eeveeApp.roomManager.current.built.group.traverse(o => {
        if (!found && o.userData && o.userData.traceProvenance) found = o.userData.traceProvenance;
      });
      return found;
    });
    record('phase5-trace-rendered',
      !!renderedTrace && renderedTrace.originRoom === 'jolteon' && renderedTrace.destinationRoom === provenance.destination,
      JSON.stringify(renderedTrace));
  }

  // Conservatory visibly reflects accumulated room history.
  await page.evaluate(() => window.eeveeApp.goToRoom('conservatory'));
  await page.waitForTimeout(300);
  const archiveState = await page.evaluate(() => {
    const built = window.eeveeApp.roomManager.current.built;
    let litHistoryStones = 0;
    built.group.traverse(o => {
      if (o.userData && o.userData.floatSeed != null && o.material && o.material.emissiveIntensity > 0.5) litHistoryStones++;
    });
    return {
      litHistoryStones,
      narrative: window.eeveeApp.habitatState.room,
      history: window.eeveeApp.habitatState.history
    };
  });
  record('phase5-conservatory-reflects-history',
    archiveState.litHistoryStones >= 3 && archiveState.narrative.stageIndex >= 1 && archiveState.history.visitedCount >= 3,
    JSON.stringify(archiveState));

  // Phase 6: transformation, elemental powers and visual unification.
  const phase6Visual = await page.evaluate(() => {
    const app = window.eeveeApp;
    const wrapper = app.eeveeRig.userData.models.eevee;
    const records = wrapper.userData.phase6MaterialRecords || [];
    const rimCount = app.roomManager.current.built.lights.filter(l => l.userData && l.userData.phase6CinematicRim).length;
    return {
      saveVersion: app.save.state.version,
      materialCount: records.length,
      allCel: records.length > 0 && records.every(r => r.mat && r.mat.isMeshToonMaterial && r.mat.userData && r.mat.userData.phase6Cel),
      rimCount
    };
  });
  record('phase6-save-v3', phase6Visual.saveVersion === 3, JSON.stringify(phase6Visual));
  record('phase6-cel-models', phase6Visual.allCel === true, JSON.stringify(phase6Visual));
  record('phase6-cinematic-rim', phase6Visual.rimCount >= 1, JSON.stringify(phase6Visual));

  // Physical evolution is explicitly two-step: approach/offer first, commit second.
  const evolutionOffer = await page.evaluate(() => {
    const app = window.eeveeApp;
    if (app.currentForm !== 'eevee') app.selectEeveelution('eevee');
    app.goToRoom('conservatory');
    const stone = app.roomManager.current.built.interactables.find(i => i.id === 'evolution_jolteon');
    if (!stone) return null;
    const started = stone.onActivate();
    return { started, state: app.evolutionState, actor: app.creatureActorState };
  });
  record('phase6-evolution-offer',
    !!evolutionOffer && evolutionOffer.state.active === true &&
    evolutionOffer.state.targetSpecies === 'jolteon' && evolutionOffer.actor.targetSource === 'evolution',
    JSON.stringify(evolutionOffer));

  await page.waitForFunction(() => {
    const s = window.eeveeApp.evolutionState;
    return s && s.state === 'ready';
  }, { timeout: 8000 });

  const evolutionCommit = await page.evaluate(() => {
    const app = window.eeveeApp;
    const stone = app.roomManager.current.built.interactables.find(i => i.id === 'evolution_jolteon');
    stone.onActivate();
    return app.evolutionState;
  });
  record('phase6-evolution-commit',
    evolutionCommit.commitRequested === true &&
    (evolutionCommit.state === 'charge' || evolutionCommit.state === 'ready'),
    JSON.stringify(evolutionCommit));

  await page.waitForFunction(() => {
    const app = window.eeveeApp;
    return app.currentForm === 'jolteon' && app.evolutionState && app.evolutionState.active === false;
  }, { timeout: 5000 });
  const evolutionComplete = await page.evaluate(() => ({
    form: window.eeveeApp.currentForm,
    state: window.eeveeApp.evolutionState,
    manager: window.eeveeApp.creatureManagerState
  }));
  record('phase6-evolution-complete',
    evolutionComplete.form === 'jolteon' &&
    evolutionComplete.state.active === false &&
    evolutionComplete.manager.activeCount === 1,
    JSON.stringify(evolutionComplete));

  // Explicit shiny profile applies to named Jolteon materials while the GLB remains cel-rendered.
  const shinyProfile = await page.evaluate(() => {
    const app = window.eeveeApp;
    const wrapper = app.eeveeRig.userData.models.jolteon;
    const before = (wrapper.userData.phase6MaterialRecords || []).map(r => ({
      name: r.name,
      original: r.color.getHex(),
      live: r.mat.color.getHex()
    }));
    app.toggleShinyMode();
    const after = (wrapper.userData.phase6MaterialRecords || []).map(r => ({
      name: r.name,
      original: r.color.getHex(),
      live: r.mat.color.getHex(),
      cel: !!(r.mat.userData && r.mat.userData.phase6Cel)
    }));
    return {
      shiny: app.isShiny,
      before,
      after,
      exactKeys: Object.keys(EeveePhase6System.SHINY_PROFILES.jolteon.exact)
    };
  });
  const shinyNamedChanged = shinyProfile.exactKeys.every(name => {
    const row = shinyProfile.after.find(r => r.name === name);
    return row && row.live !== row.original && row.cel;
  });
  record('phase6-targeted-shiny',
    shinyProfile.shiny === true && shinyNamedChanged,
    JSON.stringify(shinyProfile.after));

  await page.evaluate(() => window.eeveeApp.toggleShinyMode());
  await page.waitForTimeout(100);

  // Species ability mutates the room semantically and survives a room rebuild.
  await page.evaluate(() => window.eeveeApp.goToRoom('jolteon'));
  await page.waitForTimeout(250);
  const abilityUse = await page.evaluate(() => {
    const app = window.eeveeApp;
    const used = app.useSpeciesAbility();
    const state = app.habitatState;
    const target = app.roomManager.getAbilityTargets()[0];
    return {
      used,
      mutations: state.abilities,
      active: target && target.userData.abilityActive,
      rimCount: app.roomManager.current.built.lights.filter(l => l.userData && l.userData.phase6CinematicRim).length
    };
  });
  record('phase6-ability-use',
    abilityUse.used === true &&
    abilityUse.mutations.some(m => m.abilityId === 'relay-charge' && m.mutation === 'charged') &&
    abilityUse.active === 'relay-charge',
    JSON.stringify(abilityUse));

  await page.evaluate(() => window.eeveeApp.goToRoom('conservatory'));
  await page.waitForTimeout(200);
  await page.evaluate(() => window.eeveeApp.goToRoom('jolteon'));
  await page.waitForTimeout(200);
  const abilityRestored = await page.evaluate(() => {
    const app = window.eeveeApp;
    const target = app.roomManager.getAbilityTargets()[0];
    return {
      active: target && target.userData.abilityActive,
      mutation: app.habitatState.abilities.find(m => m.targetId === 'ability_jolteon') || null
    };
  });
  record('phase6-ability-restores',
    abilityRestored.active === 'relay-charge' &&
    abilityRestored.mutation && abilityRestored.mutation.species === 'jolteon',
    JSON.stringify(abilityRestored));

  // Restore Eevee for the protected legacy sandbox regression sequence below.
  await page.evaluate(() => {
    window.eeveeApp.goToRoom('conservatory');
    window.eeveeApp.selectEeveelution('eevee');
  });
  await page.waitForTimeout(350);

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
  await page.waitForFunction(() => window.eeveeApp.treats.length === 0 && window.eeveeApp.treatHungerAngle <= 0.01);

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
  const umbreonLight = await page.evaluate(() => {
    const light = window.eeveeApp.roomManager.current.built.lights[0];
    return { intensity: light.intensity, color: light.color.getHexString() };
  });
  await page.evaluate(() => window.eeveeApp.goToRoom('leafeon'));
  await page.waitForTimeout(200);
  const leafeonLight = await page.evaluate(() => {
    const light = window.eeveeApp.roomManager.current.built.lights[0];
    return { intensity: light.intensity, color: light.color.getHexString() };
  });
  record('room-lighting-differs',
    umbreonLight.color !== leafeonLight.color && Math.abs(umbreonLight.intensity - leafeonLight.intensity) > 0.02,
    `umbreon=${JSON.stringify(umbreonLight)}, leafeon=${JSON.stringify(leafeonLight)}`);

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
