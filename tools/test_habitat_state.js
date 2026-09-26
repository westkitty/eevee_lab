const fs = require('fs');
const path = require('path');
const vm = require('vm');
const assert = require('assert');

class FakeStorage {
  constructor(seed) { this.map = new Map(Object.entries(seed || {})); this.failWrites = false; }
  getItem(k) { return this.map.has(k) ? this.map.get(k) : null; }
  setItem(k, v) {
    if (this.failWrites) throw new Error('storage quota exceeded');
    this.map.set(k, String(v));
  }
  removeItem(k) { this.map.delete(k); }
}

class FakeWindow {
  constructor(localStorage) { this.localStorage = localStorage; this.listeners = new Map(); }
  addEventListener(type, listener) {
    if (!this.listeners.has(type)) this.listeners.set(type, new Set());
    this.listeners.get(type).add(listener);
  }
  removeEventListener(type, listener) {
    const listeners = this.listeners.get(type);
    if (listeners) listeners.delete(listener);
  }
  dispatch(type) {
    for (const listener of this.listeners.get(type) || []) listener({ type });
  }
}

const legacy = {
  version: 1,
  activeForm: 'flareon',
  highScore: 4321,
  ui: { density: 'full' },
  discovery: { behaviors: {}, mementos: { old_note: true }, rareMoments: {} },
  roomMemory: { jolteon: { charged: true } },
  crossContamination: { vaporeon: ['trace_vaporeon'] },
  album: [null, 'malformed', { id: 'old-photo', score: 12 }]
};

const localStorage = new FakeStorage({
  eevee_habitat_save: JSON.stringify(legacy)
});
const window = new FakeWindow(localStorage);
const context = {
  window,
  console,
  setTimeout,
  clearTimeout,
  Math,
  Object,
  Array,
  Map,
  Set,
  Number,
  String,
  JSON
};

const persistence = fs.readFileSync(path.join(__dirname, '..', 'src', 'persistence.js'), 'utf8');
vm.runInNewContext(persistence, context);
const save = new window.SaveManager();

assert.equal(save.state.version, 4);
assert.equal(save.state.activeForm, 'flareon');
assert.equal(save.state.highScore, 4321);
assert.equal(save.state.ui.density, 'full');
assert.equal(save.state.ui.sfxOn, true);
assert.equal(save.state.ui.musicVolume, 0.58);
assert.equal(save.state.ui.sfxVolume, 0.78);
assert.equal(save.state.ui.keyBindings.wheel, 'e');
assert(save.state.minigames && save.state.journey);
assert.equal(save.state.album.length, 1, 'migration should discard malformed album entries');
assert.equal(save.state.album[0].id, 'old-photo');
save.state.album.push(null);
save.addPhoto({ id: 'new-photo', score: 90 });
assert.equal(save.state.album.length, 2, 'adding a photo should recover from malformed album data');
assert.equal(save.state.album[0].id, 'new-photo');
for (let i = 0; i < 15; i++) save.addPhoto({ id: `extra-${i}`, score: i });
assert.equal(save.state.album.length, 12, 'album remains bounded to twelve metadata entries');
assert(save.state.album.every((entry, i, rows) => !i || rows[i - 1].score >= entry.score), 'album remains sorted by score');
assert.deepEqual(save.state.roomMemory.jolteon, { charged: true });
assert(save.state.roomNarrative && typeof save.state.roomNarrative === 'object');
assert(save.state.placedObjects && typeof save.state.placedObjects === 'object');
assert(save.state.abilityMutations && typeof save.state.abilityMutations === 'object');
assert.equal(save.state.crossContamination.vaporeon[0].destinationRoom, 'vaporeon');
assert.equal(save.state.crossContamination.vaporeon[0].originRoom, 'legacy');

const habitat = fs.readFileSync(path.join(__dirname, '..', 'src', 'habitat-state.js'), 'utf8');
vm.runInNewContext(habitat, context);
const world = new window.HabitatWorldStateSystem.HabitatWorldState(save);

world.noteVisit('jolteon');
world.noteVisit('jolteon');
let jolteon = world.noteRoomEvent('jolteon', 'roomProp', { charged: true });
assert(jolteon.stageIndex >= 1);
jolteon = world.noteRoomEvent('jolteon', 'roomProp', { charged: true });
assert(jolteon.stageIndex >= 2);
jolteon = world.noteRoomEvent('jolteon', 'memento', { id: 'memento_jolteon_tag' });
assert.equal(jolteon.stageIndex, 3);
assert.equal(jolteon.stageId, 'overloaded');

const placement = world.savePlacement('jolteon', 'relay_cushion', {
  position: { x: 1.25, y: 0.12, z: -0.75 },
  rotationY: 0.4
});
assert.equal(placement.x, 1.25);
assert.equal(world.getPlacement('jolteon', 'relay_cushion').z, -0.75);

world.noteVisit('vaporeon');
world.noteRoomEvent('vaporeon', 'roomProp', { splashed: true });
const allTraceRooms = window.HabitatWorldStateSystem.HABITAT_ROOMS
  .map(id => ({ id, traces: world.listTraces(id) }))
  .filter(x => x.traces.length);
const provenanceTrace = allTraceRooms.flatMap(x => x.traces)
  .find(t => t.originRoom === 'vaporeon' && t.originEvent.startsWith('roomProp:'));
assert(provenanceTrace);
assert(provenanceTrace.destinationRoom);
assert(provenanceTrace.objectType === 'shell');

world.noteVisit('eevee');
world.noteVisit('flareon');
const abilityMutation = world.recordAbilityMutation('jolteon', 'ability_jolteon', {
  species: 'jolteon',
  abilityId: 'relay-charge',
  targetType: 'power',
  mutation: 'charged'
});
assert.equal(abilityMutation.abilityId, 'relay-charge');
assert.equal(world.getAbilityMutation('jolteon', 'ability_jolteon').mutation, 'charged');
assert.equal(world.listAbilityMutations('jolteon').length, 1);

const summary = world.getHistorySummary();
assert(summary.visitedCount >= 4);
assert(summary.mementoCount >= 1);
assert(summary.traceCount >= 2);
assert(world.getRoomState('conservatory').stageIndex >= 1);

const backup = save.exportJSON();
save.set('ui.musicVolume', 0.2);
window.dispatch('pagehide');
assert.equal(JSON.parse(localStorage.getItem('eevee_habitat_save')).ui.musicVolume, 0.2, 'pagehide flushes a pending debounced save');
save.importJSON(backup);
assert.equal(save.get('ui.musicVolume'), 0.58, 'export/import should round-trip the complete save');
assert.throws(() => save.importJSON('[]'), /habitat save/i, 'import should reject a non-save JSON array');

const futureRaw = JSON.stringify({ version: 5, activeForm: 'sylveon', futureField: { preserve: true } });
const futureStorage = new FakeStorage({ eevee_habitat_save: futureRaw });
const futureWindow = new FakeWindow(futureStorage);
const futureContext = Object.assign({}, context, { window: futureWindow });
vm.runInNewContext(persistence, futureContext);
const futureSave = new futureWindow.SaveManager();
assert.equal(futureSave.readOnly, true, 'newer on-disk saves enter protected read-only mode');
assert.equal(futureSave.unsupportedVersion, 5);
futureSave.set('activeForm', 'flareon');
assert.equal(futureSave.flush(), false);
assert.equal(futureStorage.getItem('eevee_habitat_save'), futureRaw, 'mutations cannot downgrade the newer stored save');
assert.throws(() => futureSave.exportJSON(), /newer version/i);
assert.throws(() => futureSave.importJSON(JSON.stringify({
  format: 'eevee-habitat-save', version: 5, data: { version: 5, activeForm: 'sylveon' }
})), /newer version/i);
assert.equal(futureStorage.getItem('eevee_habitat_save'), futureRaw, 'rejected imports preserve the original bytes');
futureSave.importJSON(backup);
assert.equal(futureSave.readOnly, false, 'a compatible backup restores writable mode');
assert.equal(JSON.parse(futureStorage.getItem('eevee_habitat_save')).version, 4);

const blockedStorage = new FakeStorage({ eevee_habitat_save: JSON.stringify({ version: 4 }) });
const blockedWindow = new FakeWindow(blockedStorage);
const blockedContext = Object.assign({}, context, { window: blockedWindow, console: { warn() {}, error: console.error } });
vm.runInNewContext(persistence, blockedContext);
const blockedSave = new blockedWindow.SaveManager();
const originalBlockedState = blockedSave.state;
blockedStorage.failWrites = true;
assert.throws(() => blockedSave.importJSON(backup), /browser storage/i);
assert.strictEqual(blockedSave.state, originalBlockedState, 'failed imports roll back in-memory state');
assert.equal(JSON.parse(blockedStorage.getItem('eevee_habitat_save')).version, 4, 'failed imports leave the previous stored save unchanged');

save.flush();
const stored = JSON.parse(localStorage.getItem('eevee_habitat_save'));
assert.equal(stored.version, 4);
assert(stored.placedObjects.jolteon.relay_cushion);
assert(Array.isArray(stored.crossContamination[provenanceTrace.destinationRoom]));

console.log('phase5 habitat state test: PASS');
