/* Node regression for the expansion regions.
   Loads the real vendored three.min.js + render-effects + rooms + expansion
   scripts into a VM window, then builds, ticks, activates and disposes every
   room (original + expansion) and checks registry/order/hub wiring.
   Run: node tools/test_expansions.js */
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const assert = require('assert');

const root = path.join(__dirname, '..');
const window = {
  devicePixelRatio: 1,
  addEventListener() {}, removeEventListener() {},
  requestAnimationFrame() { return 0; },
  document: undefined, // forces the non-canvas portal material path
  performance: { now: () => Date.now() },
  setTimeout: (fn) => 0, clearTimeout() {},
  console
};
window.window = window; window.self = window; window.globalThis = window;
vm.createContext(window);
const load = f => vm.runInContext(fs.readFileSync(path.join(root, f), 'utf8'), window, { filename: f });

load('libs/three.min.js');
load('src/render-effects.js');
load('src/rooms.js');
load('src/expansions/expansion-kit.js');
load('src/expansions/tidewild-coast.js');
load('src/expansions/emberpeak-ruins.js');
load('src/expansions/neon-undercity.js');
load('src/expansions/starfall-dreamway.js');
load('src/habitat-state.js');
load('src/phase7-living-world.js');

const THREE = window.THREE;
const ROOMS = window.ROOM_DEFINITIONS;
const ORDER = window.ROOM_ORDER;
const REG = window.EXPANSION_REGISTRY;

// ---- registry / order --------------------------------------------------
const EXPANSIONS = ['tidewild', 'emberpeak', 'undercity', 'dreamway'];
const SPECIES = ['eevee', 'vaporeon', 'jolteon', 'flareon', 'espeon', 'umbreon', 'leafeon', 'glaceon', 'sylveon'];
assert.deepStrictEqual(Array.from(REG.expansions.map(e => e.id)), EXPANSIONS);
assert.deepStrictEqual(Array.from(ORDER.slice(0, 10)), ['conservatory', 'eevee', 'vaporeon', 'jolteon', 'flareon', 'espeon', 'umbreon', 'leafeon', 'glaceon', 'sylveon'], 'original order intact');
assert.strictEqual(ORDER.length, 10 + EXPANSIONS.length * 10, 'each expansion adds hub + 9 rooms');
EXPANSIONS.forEach(x => {
  assert.ok(ROOMS[x] && ROOMS[x].isHub, x + ' hub defined');
  SPECIES.forEach(sp => {
    const rid = x + '_' + sp;
    const def = ROOMS[rid];
    assert.ok(def, rid + ' defined');
    assert.strictEqual(def.associatedForm, sp);
    assert.strictEqual(def.hubId, x);
    assert.ok(REG.weather[rid] && REG.weather[rid].length, rid + ' weather');
    assert.ok(REG.life[rid], rid + ' life');
    assert.strictEqual(REG.narrative[rid].length, 4, rid + ' has 4 narrative stages');
  });
});

// ---- living world + world state integrate through registry -------------
const LW = window.EeveeLivingWorld;
const clock = new LW.WorldClock({ now: () => 1000 });
const w = LW.weatherFor('tidewild_jolteon', clock.sample());
assert.ok(REG.weather.tidewild_jolteon.includes(w), 'expansion weather resolves');
const HS = window.HabitatWorldStateSystem;
class FakeSave { constructor() { this.d = {}; } get(p, f) { let c = this.d; for (const k of p.split('.')) { if (c == null || !(k in c)) return f; c = c[k]; } return c; } set(p, v) { const ps = p.split('.'); let c = this.d; for (let i = 0; i < ps.length - 1; i++) { if (!c[ps[i]] || typeof c[ps[i]] !== 'object') c[ps[i]] = {}; c = c[ps[i]]; } c[ps.at(-1)] = v; return v; } }
const ws = new HS.HabitatWorldState(new FakeSave());
const st = ws.noteVisit('undercity_sylveon');
assert.strictEqual(st.stageId, 'mic-check', 'expansion narrative stage 0 label used');
ws.noteRoomEvent('undercity_sylveon', 'roomProp', { sang: true });
ws.noteRoomEvent('undercity_sylveon', 'roomProp', { sang: true });
assert.strictEqual(ws.getRoomState('undercity_sylveon').stageIndex, 2, 'prop uses advance expansion stage');

// ---- build / tick / activate / dispose every room ------------------------
const scene = new THREE.Scene();
const log = [];
function ctxFor(roomId) {
  return {
    goTo: id => log.push(['goTo', roomId, id]),
    requestDoor: (id) => { assert.ok(ROOMS[id], roomId + ' door -> unknown room ' + id); log.push(['door', roomId, id]); },
    requestEvolution: (sp) => log.push(['evo', roomId, sp]),
    roomLabel: id => ROOMS[id] ? ROOMS[id].displayName : id,
    activeForm: () => 'eevee',
    unlockBehavior: (id, label) => { assert.ok(label, 'behavior label for ' + id); log.push(['behavior', roomId, id]); return true; },
    onRoomProp: (rid, detail) => { assert.strictEqual(rid, roomId); assert.ok(detail && Object.keys(detail).length, 'prop detail'); log.push(['prop', rid]); },
    onMemento: (rid, id, text) => { assert.strictEqual(rid, roomId); assert.ok(text && text.length > 10, 'memento text'); log.push(['memento', rid, id]); }
  };
}

let built = 0;
ORDER.forEach(roomId => {
  const def = ROOMS[roomId];
  const b = def.build(ctxFor(roomId));
  built++;
  assert.ok(b.group && b.lights && b.particleFields && b.interactables, roomId + ' shape');
  assert.ok(b.atmosphereVariants.length >= 1, roomId + ' variants');
  assert.ok(b.spawnPoint, roomId + ' spawn');
  const floor = b.group.children.find(o => o.userData && o.userData.walkable);
  assert.ok(floor, roomId + ' walkable floor');

  scene.add(b.group); b.lights.forEach(l => scene.add(l));
  for (let i = 0; i < 6; i++) b.update(1 / 60, i / 60);
  // Activate every interactable, then tick again so activation-driven animation runs.
  b.interactables.forEach(i => { assert.ok(i.object3D.userData.interactable, roomId + ' ' + i.id + ' tagged'); i.onActivate(); });
  for (let i = 0; i < 90; i++) b.update(1 / 60, 1 + i / 60);
  if (b.applyNarrativeStage) [0, 1, 2, 3].forEach(s => b.applyNarrativeStage({ stageIndex: s, stageId: 's' + s }));

  if (def.expansionId && !def.isHub) {
    const back = b.interactables.find(i => i.id === 'door_' + def.hubId);
    assert.ok(back, roomId + ' has return door to hub');
    assert.ok(b.interactables.some(i => i.kind === 'prop'), roomId + ' has a native setpiece prop');
    assert.ok(b.interactables.some(i => i.kind === 'memento'), roomId + ' has a memento');
    assert.ok(b.entryPoints[def.hubId] && b.continuationPoints[def.hubId], roomId + ' hub entry points');
    if (def.abilityType) assert.ok(b.abilityTargets && b.abilityTargets.length === 1, roomId + ' ability target wired');
    assert.ok(b.group.children.some(o => o.name === 'narrative_meter'), roomId + ' narrative meter');
    assert.ok(b.group.children.some(o => o.name === roomId + '_cushion' || (o.userData && o.userData.placeableId === roomId + '_cushion')), roomId + ' furniture');
  }
  if (def.isHub) {
    SPECIES.forEach(sp => assert.ok(b.interactables.some(i => i.id === 'door_' + roomId + '_' + sp), roomId + ' door to ' + sp));
    assert.ok(b.interactables.some(i => i.id === 'door_conservatory'), roomId + ' door back to conservatory');
  }
  if (roomId === 'conservatory') {
    EXPANSIONS.forEach(x => assert.ok(b.interactables.some(i => i.id === 'door_' + x), 'conservatory has gate to ' + x));
  }

  // dispose like RoomManager does
  b.particleFields.forEach(pf => pf.dispose());
  b.lights.forEach(l => scene.remove(l));
  b.group.traverse(c => { if (c.isMesh) c.geometry.dispose(); });
  scene.remove(b.group);
  if (b.disposeExtra) b.disposeExtra();
});
assert.strictEqual(scene.children.length, 0, 'scene empty after disposing every room');

const props = log.filter(l => l[0] === 'prop').length;
const mementos = log.filter(l => l[0] === 'memento').length;
const behaviors = log.filter(l => l[0] === 'behavior').length;
console.log(`OK — built/ticked/disposed ${built} rooms (${ORDER.length - 10} new); ${props} props, ${mementos} mementos, ${behaviors} curio discoveries fired.`);
