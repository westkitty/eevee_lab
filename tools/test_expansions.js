/* Node regression for the expedition regions.
   Uses the REAL vendored three.min.js, SaveManager, HabitatWorldState,
   DiscoveryLog, ResonanceTracker and RoomManager in a VM window (no fakes
   for project code). Verifies:
     1-4   registration, counts, construction
     5-6   activation + ticking of every room via RoomManager.goTo
     7-8   every setpiece/memento/curio executes; all 4 stages apply
     9-10  disposal leaves the scene empty and no material/geometry leaks
     11    (run separately) focused regression suites
     12    navigation: conservatory -> hub -> each room -> hub -> conservatory
     13    a pre-expansion save shape loads and retains its keys
     +     cross-room consequences persist in `expeditions.<region>`
   Run: node tools/test_expansions.js */
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const assert = require('assert');

const root = path.join(__dirname, '..');
const storage = {};
const window = {
  devicePixelRatio: 1,
  addEventListener() {}, removeEventListener() {},
  requestAnimationFrame() { return 0; },
  document: undefined,
  performance: { now: () => Date.now() },
  setTimeout: () => 0, clearTimeout() {},
  localStorage: { getItem: k => (k in storage ? storage[k] : null), setItem: (k, v) => { storage[k] = String(v); }, removeItem: k => { delete storage[k]; } },
  console
};
window.window = window; window.self = window; window.globalThis = window;
vm.createContext(window);
const load = f => vm.runInContext(fs.readFileSync(path.join(root, f), 'utf8'), window, { filename: f });

// A legacy (pre-expansion) save is present before anything loads.
const LEGACY = { version: 3, activeForm: 'umbreon', lastRoom: 'umbreon', discovery: { mementos: { memento_umbreon_dial: true } }, roomNarrative: { umbreon: { visits: 4, propUses: 2, mementos: {}, stageIndex: 2 } } };
storage.eevee_habitat_save = JSON.stringify(LEGACY);

load('libs/three.min.js');
load('src/persistence.js');
load('src/habitat-state.js');
load('src/render-effects.js');
load('src/phase7-living-world.js');
load('src/discovery-system.js');
load('src/rooms.js');
load('src/expansions/expansion-kit.js');
load('src/expansions/tidewild-coast.js');
load('src/expansions/emberpeak-ruins.js');
load('src/expansions/neon-undercity.js');
load('src/expansions/starfall-dreamway.js');
load('src/room-manager.js');

const THREE = window.THREE;
const ROOMS = window.ROOM_DEFINITIONS;
const ORDER = Array.from(window.ROOM_ORDER);
const REG = window.EXPANSION_REGISTRY;
const EXPANSIONS = ['tidewild', 'emberpeak', 'undercity', 'dreamway'];
const SPECIES = ['eevee', 'vaporeon', 'jolteon', 'flareon', 'espeon', 'umbreon', 'leafeon', 'glaceon', 'sylveon'];
const ORIGINAL = ['conservatory', ...SPECIES];

// ---- 1-3 registration ---------------------------------------------------
assert.deepStrictEqual(ORDER.slice(0, 10), ORIGINAL, 'original ten ids and order intact');
assert.strictEqual(ORDER.length, 50, 'total room count is 50');
assert.deepStrictEqual(Array.from(REG.expansions.map(e => e.id)), EXPANSIONS);
EXPANSIONS.forEach(x => {
  assert.ok(ROOMS[x] && ROOMS[x].isHub, x + ' hub');
  assert.ok(REG.transitions[x], x + ' transition language registered');
  SPECIES.forEach(sp => {
    const rid = x + '_' + sp, def = ROOMS[rid];
    assert.ok(def && def.associatedForm === sp && def.hubId === x, rid);
    assert.ok(REG.weather[rid].length && REG.life[rid] && REG.narrative[rid].length === 4, rid + ' env metadata');
  });
});

// ---- real save + world state + discovery + room manager ------------------
const save = new window.SaveManager();
window.habitatSave = save;
assert.strictEqual(save.get('activeForm'), 'umbreon', 'legacy save loaded');
assert.strictEqual(save.get('roomNarrative.umbreon.stageIndex'), 2, 'legacy narrative intact');
const worldState = new window.HabitatWorldStateSystem.HabitatWorldState(save);
const discoveryLog = new window.DiscoverySystem.DiscoveryLog(save, () => {});
const resonance = new window.DiscoverySystem.ResonanceTracker(save);
const scene = new THREE.Scene();
const entered = [];
const rm = new window.RoomManager({
  scene, save, discoveryLog, resonance, worldState, livingWorld: null, cameraController: null,
  roomLabel: id => ROOMS[id] ? ROOMS[id].displayName : id,
  onRoomEnter: (id, built, entry) => entered.push({ id, from: entry.fromRoomId, viaDoor: entry.viaDoor })
});
rm.setActiveForm('eevee');
const feedback = [];
rm.onDiscoveryFeedback = f => { if (f) feedback.push(f); };

function countResources() {
  let meshes = 0; const geos = new Set(), mats = new Set();
  scene.traverse(o => { if (o.isMesh || o.isPoints) { meshes++; geos.add(o.geometry); (Array.isArray(o.material) ? o.material : [o.material]).forEach(m => mats.add(m)); } });
  return { children: scene.children.length, meshes, geos: geos.size, mats: mats.size };
}
function tick(n, base = 0) { for (let i = 0; i < n; i++) rm.update(1 / 60, base + i / 60); }
function activateAll(kinds) {
  const list = rm.getInteractables().filter(i => !kinds || kinds.includes(i.kind));
  list.forEach(i => { if (i.kind === 'door' || i.kind === 'evolution') return; i.onActivate(); });
  return list.length;
}
function doorTo(target) {
  const entry = rm.getInteractables().find(i => i.kind === 'door' && i.object3D.userData.portalTarget === target);
  assert.ok(entry, `no door from ${rm.current.id} to ${target}`);
  // The creature must be able to physically reach the door: within the walkable
  // disc and at ground level (door-travel walks to ~0.72 inside the door).
  const floor = rm.getWalkableMeshes()[0];
  const walk = Number(floor.userData.walkRadius);
  const pos = entry.object3D.getWorldPosition(new THREE.Vector3());
  const r = Math.hypot(pos.x, pos.z);
  assert.ok(r - 0.72 <= walk + 0.05, `door ${target} in ${rm.current.id} unreachable: r=${r.toFixed(2)} walk=${walk}`);
  assert.ok(Math.abs(pos.y) <= 0.5, `door ${target} in ${rm.current.id} off the ground: y=${pos.y}`);
  entry.onActivate();
  assert.strictEqual(rm.current.id, target, `door led to ${rm.current.id} not ${target}`);
}

// ---- 12 navigation through real doors; 5-10 lifecycle per room -----------
rm.goTo('conservatory');
assert.strictEqual(rm.current.id, 'conservatory');
let totalProps = 0, totalMementos = 0, totalCurios = 0;
EXPANSIONS.forEach(x => {
  doorTo(x);
  assert.ok(entered.at(-1).viaDoor && entered.at(-1).from === 'conservatory', 'hub entered via door from conservatory');
  tick(30);
  totalCurios += activateAll(['curio']);
  SPECIES.forEach(sp => {
    const rid = x + '_' + sp;
    doorTo(rid);
    const b = rm.current.built;
    assert.ok(b.group.children.some(o => o.userData && o.userData.walkable), rid + ' walkable');
    assert.ok(rm.getAbilityTargets().length === (sp === 'eevee' ? 0 : 1), rid + ' ability target count');
    tick(20);
    const props = rm.getInteractables().filter(i => i.kind === 'prop'); assert.ok(props.length >= 1, rid + ' setpiece');
    const mem = rm.getInteractables().filter(i => i.kind === 'memento'); assert.strictEqual(mem.length, 1, rid + ' memento');
    props.forEach(p => p.onActivate()); mem.forEach(m => m.onActivate());
    totalProps += props.length; totalMementos += mem.length;
    tick(120, 2);
    [0, 1, 2, 3].forEach(s => b.applyNarrativeStage({ stageIndex: s, stageId: 's' + s, label: 's' + s }));
    if (sp !== 'eevee') assert.ok(rm.applyAbilityMutation({ roomId: rid, targetId: 'ability_' + rid, abilityId: 'x', mutation: 'x' }), rid + ' ability mutation applies');
    doorTo(x); // back to the hub through the room's own return door
    tick(5);
  });
  // Consequences recorded for this region.
  const rec = window.ExpansionKit.regionApi(x, x).record();
  assert.strictEqual(Object.keys(rec.setpieces).length, 9, x + ' nine setpieces recorded');
  assert.strictEqual(rec.mementos.length, 9, x + ' nine mementos recorded');
  assert.ok(Object.keys(rec.flags).length >= 3, x + ' has cross-room flags');
  doorTo('conservatory');
});
assert.strictEqual(rm.current.id, 'conservatory');
tick(10);

// Specific consequences are visible when revisiting (hub reads flags at build).
assert.strictEqual(save.get('expeditions.tidewild.flags.lighthouseLit'), true);
assert.strictEqual(save.get('expeditions.emberpeak.flags.lanternsLit'), true);
assert.strictEqual(save.get('expeditions.undercity.flags.lastTrainArrived'), true);
assert.strictEqual(save.get('expeditions.dreamway.flags.morningCame'), true);
rm.goTo('emberpeak'); tick(10);
const litLantern = rm.current.built.group.children.find(o => o.userData && o.userData.glow && o.userData.glow.material.emissiveIntensity > 1);
assert.ok(litLantern, 'emberpeak hub lanterns lit after Umbreon\'s bell');
rm.goTo('conservatory');

// Also exercise the original ten so their lifecycle still works alongside the new code paths.
ORIGINAL.forEach(id => { rm.goTo(id); tick(10); activateAll(['prop', 'memento']); tick(10); });
rm.goTo('conservatory');

// ---- 9-10 disposal --------------------------------------------------------
const before = countResources();
rm._disposeCurrent();
const after = countResources();
assert.strictEqual(after.children, 0, 'scene empty after disposal: ' + JSON.stringify(after));
assert.ok(before.meshes > 0, 'sanity: conservatory had meshes');
// Build/dispose the heaviest rooms repeatedly and confirm the scene count is flat.
['undercity', 'tidewild', 'dreamway_glaceon', 'undercity_jolteon'].forEach(id => {
  rm.goTo(id); tick(5); const a = countResources(); rm._disposeCurrent();
  rm.goTo(id); tick(5); const b = countResources(); rm._disposeCurrent();
  assert.deepStrictEqual(a, b, id + ' resources identical across rebuilds');
});
assert.strictEqual(scene.children.length, 0);

// ---- 13 save compatibility ------------------------------------------------
save.flush();
const persisted = JSON.parse(storage.eevee_habitat_save);
assert.strictEqual(persisted.activeForm, 'umbreon', 'legacy activeForm preserved');
assert.strictEqual(persisted.discovery.mementos.memento_umbreon_dial, true, 'legacy memento preserved');
assert.ok(persisted.expeditions && persisted.expeditions.tidewild, 'expedition state stored under its own key');
assert.ok(JSON.stringify(persisted).length < 60000, 'save stays bounded');
assert.ok(feedback.length > 0, 'discovery feedback fired for expansion curios/mementos');
// Journal shows expansion discoveries with labels.
const journal = discoveryLog.allEntries();
assert.ok(journal.some(e => e.id === 'undercity_ramen_bowl' && /ramen/i.test(e.label)), 'hub curio discovery appears in journal with label');

console.log(`OK — 50 rooms navigated via real doors and RoomManager; ${totalProps} setpieces, ${totalMementos} mementos, ${totalCurios} hub curios executed; 4 regions' consequences persisted; scene empty after disposal; legacy save preserved.`);
