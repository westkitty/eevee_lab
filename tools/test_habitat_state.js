const fs = require('fs');
const path = require('path');
const vm = require('vm');
const assert = require('assert');

class FakeStorage {
  constructor(seed) { this.map = new Map(Object.entries(seed || {})); }
  getItem(k) { return this.map.has(k) ? this.map.get(k) : null; }
  setItem(k, v) { this.map.set(k, String(v)); }
  removeItem(k) { this.map.delete(k); }
}

const legacy = {
  version: 1,
  activeForm: 'flareon',
  highScore: 4321,
  ui: { density: 'full' },
  discovery: { behaviors: {}, mementos: { old_note: true }, rareMoments: {} },
  roomMemory: { jolteon: { charged: true } },
  crossContamination: { vaporeon: ['trace_vaporeon'] }
};

const localStorage = new FakeStorage({
  eevee_habitat_save: JSON.stringify(legacy)
});
const window = { localStorage };
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

assert.equal(save.state.version, 2);
assert.equal(save.state.activeForm, 'flareon');
assert.equal(save.state.highScore, 4321);
assert.equal(save.state.ui.density, 'full');
assert.equal(save.state.ui.sfxOn, true);
assert.deepEqual(save.state.roomMemory.jolteon, { charged: true });
assert(save.state.roomNarrative && typeof save.state.roomNarrative === 'object');
assert(save.state.placedObjects && typeof save.state.placedObjects === 'object');
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
const summary = world.getHistorySummary();
assert(summary.visitedCount >= 4);
assert(summary.mementoCount >= 1);
assert(summary.traceCount >= 2);
assert(world.getRoomState('conservatory').stageIndex >= 1);

save.flush();
const stored = JSON.parse(localStorage.getItem('eevee_habitat_save'));
assert.equal(stored.version, 2);
assert(stored.placedObjects.jolteon.relay_cushion);
assert(Array.isArray(stored.crossContamination[provenanceTrace.destinationRoom]));

console.log('phase5 habitat state test: PASS');
