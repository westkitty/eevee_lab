const fs = require('fs');
const path = require('path');
const vm = require('vm');
const assert = require('assert');

class MemorySave {
  constructor() { this.state = { journey: { visited: [], counters: {}, chapterFlags: {}, daily: null, routines: [], favorites: [], region: {} }, discovery: { mementos: {} } }; }
  get(key, fallback) {
    const value = key.split('.').reduce((cur, part) => cur == null ? undefined : cur[part], this.state);
    return value === undefined ? fallback : value;
  }
  set(key, value) {
    const parts = key.split('.'); let cur = this.state;
    for (const part of parts.slice(0, -1)) cur = cur[part] = cur[part] || {};
    cur[parts[parts.length - 1]] = value; return value;
  }
}

const window = {};
vm.runInNewContext(fs.readFileSync(path.join(__dirname, '..', 'src', 'experience-systems.js'), 'utf8'), { window, Date, Math, Object, Array, Number, String, JSON });
const roomDefinitions = {
  conservatory: { id: 'conservatory' }, vaporeon: { id: 'vaporeon' },
  'tidewild-hub': { id: 'tidewild-hub', expansionId: 'tidewild' },
  'emberpeak-hub': { id: 'emberpeak-hub', expansionId: 'emberpeak' },
  'neon-hub': { id: 'neon-hub', expansionId: 'undercity' },
  'dream-hub': { id: 'dream-hub', expansionId: 'dreamway' }
};
const save = new MemorySave();
const guide = new window.HabitatExperience.HabitatGuide(save, { roomDefinitions });

// The daily card is local-date deterministic and resets by date, not a streak.
const testDate = new Date();
const daily = guide.getDailyChallenge(testDate);
assert(daily.title && daily.target > 0);
const visitRequest = guide.getCreatureRequest('eevee', testDate);
assert(visitRequest.title && !visitRequest.complete);
guide.recordEvent('visit', { roomId: 'conservatory', form: 'eevee', initial: true });
assert(!guide.getCreatureRequest('eevee', testDate).complete, 'the automatic startup room should not complete a travel request');
guide.recordEvent('visit', { roomId: 'vaporeon', form: 'eevee' });
assert(guide.getCreatureRequest('eevee', testDate).complete, 'a player-initiated room visit should complete the travel request');
const creatureRequest = guide.getCreatureRequest('flareon', testDate);
assert(creatureRequest.title && !creatureRequest.complete);
guide.recordEvent('interaction', { roomId: 'conservatory', form: 'flareon' });
assert(guide.getCreatureRequest('flareon', testDate).complete, 'a companion request should complete from its matching action');
assert(!guide.getCreatureRequest('sylveon', testDate).complete, 'requests should remain specific to the selected species');
guide.getCreatureRequest('leafeon', testDate);
guide.recordEvent('ability', { roomId: 'emberpeak-hub', form: 'leafeon' });
assert(guide.getCreatureRequest('leafeon', testDate).complete, 'compatible abilities should complete the species request');

['conservatory','vaporeon','tidewild-hub'].forEach(roomId => guide.recordEvent('visit', { roomId }));
guide.recordEvent('photo', { roomId: 'conservatory' });
guide.recordEvent('minigame', { id: 'stone-memory', region: 'home', won: true });
assert(guide.chapters().find(c => c.id === 'many-paths').complete);

// Regional stories respond to meaningful visits, photos/abilities, and an actual win.
guide.recordEvent('visit', { roomId: 'tidewild-hub' });
guide.recordEvent('photo', { roomId: 'tidewild-hub' });
guide.recordEvent('minigame', { id: 'tidepool-sort', region: 'tidewild', won: true });
assert(guide.chapters().find(c => c.id === 'tidewild').complete);
guide.recordEvent('visit', { roomId: 'emberpeak-hub' });
guide.recordEvent('ability', { roomId: 'emberpeak-hub' });
guide.recordEvent('minigame', { id: 'pilgrim-glyph-wheel', region: 'emberpeak', won: true });
assert(guide.chapters().find(c => c.id === 'emberpeak').complete);
guide.recordEvent('visit', { roomId: 'neon-hub' });
guide.recordEvent('interaction', { roomId: 'neon-hub' });
guide.recordEvent('minigame', { id: 'capsule-claw', region: 'undercity', won: true });
assert(guide.chapters().find(c => c.id === 'undercity').complete);
guide.recordEvent('visit', { roomId: 'dream-hub' });
guide.recordEvent('photo', { roomId: 'dream-hub' });
guide.recordEvent('minigame', { id: 'clocktower-gears', region: 'dreamway', won: true });
assert(guide.chapters().find(c => c.id === 'dreamway').complete);

assert.equal(guide.toggleFavorite('vaporeon'), true);
assert.equal(guide.isFavorite('vaporeon'), true);
assert.equal(guide.toggleFavorite('vaporeon'), false);
const routine = guide.saveRoutine('Tide glass morning', 'tidewild-hub', 'vaporeon');
assert(routine && guide.routineList().length === 1);
assert(guide.removeRoutine(routine.id));
assert(guide.achievements().some(a => a.id === 'all-forms' && !a.unlocked));
assert(guide.snapshot().event.title);
console.log('habitat guide contracts: PASS');
