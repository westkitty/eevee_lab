/* ============================================================================
   HABITAT GUIDE — local chapters, gentle daily cards, achievements, favourites,
   saved visits and bounded player-authored routines. No network or streaks.
   ============================================================================ */
(function (global) {
  'use strict';

  const DAILY_CARDS = Object.freeze([
    { id: 'little-tour', event: 'visit', target: 1, title: 'Take a little tour', text: 'Visit one room you have not visited today.' },
    { id: 'save-a-moment', event: 'photo', target: 1, title: 'Save a moment', text: 'Take any habitat photo.' },
    { id: 'play-a-round', event: 'minigame', target: 1, title: 'Play a round', text: 'Try any Habitat Arcade game.' },
    { id: 'try-an-ability', event: 'ability', target: 1, title: 'Room for a little magic', text: 'Use a form ability on a compatible room prop.' },
    { id: 'say-hello', event: 'interaction', target: 3, title: 'Say hello', text: 'Share three small interactions with a creature.' },
    { id: 'notice-something', event: 'discovery', target: 1, title: 'Notice something new', text: 'Find a behavior or room discovery.' },
    { id: 'change-the-view', event: 'atmosphere', target: 1, title: 'Change the mood', text: 'Choose an unlocked atmosphere variant.' }
  ]);

  const CREATURE_REQUESTS = Object.freeze({
    eevee: { id: 'eevee-wander', event: 'visit', title: 'Eevee’s little tour', text: 'Visit a different habitat together.' },
    vaporeon: { id: 'vaporeon-moment', event: 'photo', title: 'Vaporeon’s keepsake', text: 'Save a photo from your travels.' },
    jolteon: { id: 'jolteon-round', event: 'minigame', title: 'Jolteon’s lightning round', text: 'Try one short Habitat Arcade game.' },
    flareon: { id: 'flareon-hello', event: 'interaction', title: 'Flareon’s warm hello', text: 'Share a small interaction together.' },
    espeon: { id: 'espeon-sky', event: 'photo', title: 'Espeon’s constellation', text: 'Compose a portrait worth remembering.' },
    umbreon: { id: 'umbreon-walk', event: 'visit', title: 'Umbreon’s night walk', text: 'Take a stroll to another room.' },
    leafeon: { id: 'leafeon-garden', event: 'ability', title: 'Leafeon’s garden check', text: 'Use a compatible form ability in a room.' },
    glaceon: { id: 'glaceon-mood', event: 'atmosphere', title: 'Glaceon’s quiet hour', text: 'Choose an unlocked room atmosphere.' },
    sylveon: { id: 'sylveon-hello', event: 'interaction', title: 'Sylveon’s ribbon hello', text: 'Share a small interaction together.' }
  });

  const CHAPTERS = Object.freeze([
    { id: 'many-paths', title: 'A House of Many Paths', region: 'The Conservatory', description: 'Make a small field guide to the connected habitats.', tasks: [
      { key: 'threeRooms', label: 'Visit three different rooms' },
      { key: 'photo', label: 'Keep a photo from your travels' },
      { key: 'game', label: 'Win a Habitat Arcade game' }
    ] },
    { id: 'tidewild', title: 'Light the Coast', region: 'Tidewild Coast', description: 'Leave the harbor brighter than you found it.', tasks: [
      { key: 'visit:tidewild', label: 'Visit the Tidewild Coast' },
      { key: 'photo:tidewild', label: 'Take a photo on the coast' },
      { key: 'game:tidewild', label: 'Win a Tidewild game' }
    ] },
    { id: 'emberpeak', title: 'The Pilgrim’s Stair', region: 'Emberpeak Ruins', description: 'Follow a spark from the base camp toward the summit.', tasks: [
      { key: 'visit:emberpeak', label: 'Visit Emberpeak' },
      { key: 'ability:emberpeak', label: 'Use a form ability there' },
      { key: 'game:emberpeak', label: 'Win an Emberpeak game' }
    ] },
    { id: 'undercity', title: 'After Hours', region: 'Neon Undercity', description: 'Find a quiet moment after the city lights come on.', tasks: [
      { key: 'visit:undercity', label: 'Visit the Neon Undercity' },
      { key: 'interaction:undercity', label: 'Interact with a creature there' },
      { key: 'game:undercity', label: 'Win an Undercity game' }
    ] },
    { id: 'dreamway', title: 'A Dream Remembered', region: 'Starfall Dreamway', description: 'Bring one piece of the dream back to the house.', tasks: [
      { key: 'visit:dreamway', label: 'Visit the Starfall Dreamway' },
      { key: 'photo:dreamway', label: 'Take a photo there' },
      { key: 'game:dreamway', label: 'Win a Dreamway game' }
    ] }
  ]);

  const LOCAL_EVENTS = Object.freeze([
    { title: 'Quiet Observatory Night', text: 'Tonight’s gentle prompt: visit somewhere you have not stayed long.' },
    { title: 'Tideglass Listening Hour', text: 'Take a moment to watch the water or weather change.' },
    { title: 'Lantern Walk', text: 'Pick a softly lit room and save a small memory there.' },
    { title: 'Little Garden Day', text: 'Look for one detail in the plants that you missed before.' },
    { title: 'Arcade Afternoon', text: 'Try a short game, or simply watch the room setpieces.' },
    { title: 'Cloudwatch', text: 'Choose a good vista and take the camera for a walk.' },
    { title: 'Open House', text: 'Visit a favorite room and bring a companion if one is available.' }
  ]);

  function safeObject(v) { return v && typeof v === 'object' && !Array.isArray(v) ? v : {}; }
  function localDateKey(date) {
    const d = date || new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }
  function stableIndex(text, size) {
    let n = 0;
    for (let i = 0; i < text.length; i++) n = ((n * 31) + text.charCodeAt(i)) >>> 0;
    return size ? n % size : 0;
  }

  class HabitatGuide {
    constructor(save, options) {
      if (!save) throw new Error('HabitatGuide requires SaveManager');
      this.save = save;
      this.options = options || {};
      this._reconcile();
      this.getDailyChallenge();
    }

    _journey() {
      const raw = safeObject(this.save.get('journey', null));
      const regions = {};
      Object.keys(safeObject(raw.region)).forEach(key => {
        const value = safeObject(raw.region[key]);
        regions[key] = Object.assign({}, value, { visits: Array.isArray(value.visits) ? value.visits.slice() : [] });
      });
      return {
        visited: Array.isArray(raw.visited) ? raw.visited.slice() : [],
        forms: Array.isArray(raw.forms) ? raw.forms.slice() : [],
        counters: Object.assign({}, safeObject(raw.counters)),
        chapterFlags: Object.assign({}, safeObject(raw.chapterFlags)),
        daily: raw.daily && typeof raw.daily === 'object' ? Object.assign({}, raw.daily, {
          visited: Array.isArray(raw.daily.visited) ? raw.daily.visited.slice() : [],
          requests: Object.assign({}, safeObject(raw.daily.requests))
        }) : null,
        routines: Array.isArray(raw.routines) ? raw.routines.map(r => Object.assign({}, r)) : [],
        favorites: Array.isArray(raw.favorites) ? raw.favorites.slice() : [],
        region: regions
      };
    }

    _write(state) {
      state.visited = Array.isArray(state.visited) ? state.visited.slice(-100) : [];
      state.forms = Array.isArray(state.forms) ? state.forms.slice(0, 9) : [];
      state.routines = Array.isArray(state.routines) ? state.routines.slice(-6) : [];
      state.favorites = Array.isArray(state.favorites) ? state.favorites.slice(0, 20) : [];
      state.counters = safeObject(state.counters);
      state.chapterFlags = safeObject(state.chapterFlags);
      state.region = safeObject(state.region);
      this.save.set('journey', state);
      return state;
    }

    _region(roomId) {
      const def = this.options.roomDefinitions && this.options.roomDefinitions[roomId];
      return def && def.expansionId || 'home';
    }

    recordEvent(type, detail) {
      detail = detail || {};
      const state = this._journey();
      const counts = state.counters;
      const region = detail.region || this._region(detail.roomId);
      const regionStats = Object.assign({ visits: [], photos: 0, abilities: 0, interactions: 0, games: 0, wins: 0 }, safeObject(state.region[region]));

      if (type === 'visit' && detail.roomId) {
        if (!state.visited.includes(detail.roomId)) state.visited.push(detail.roomId);
        if (!regionStats.visits.includes(detail.roomId)) regionStats.visits.push(detail.roomId);
        counts.visits = Math.min(10000, (Number(counts.visits) || 0) + 1);
        this._dailyProgress(state, 'visit', detail);
      } else if (type === 'form' && detail.form && !state.forms.includes(detail.form)) {
        state.forms.push(detail.form);
      } else if (type === 'photo') {
        counts.photos = Math.min(10000, (Number(counts.photos) || 0) + 1);
        regionStats.photos = Math.min(999, regionStats.photos + 1);
        this._dailyProgress(state, 'photo', detail);
      } else if (type === 'ability') {
        counts.abilities = Math.min(10000, (Number(counts.abilities) || 0) + 1);
        regionStats.abilities = Math.min(999, regionStats.abilities + 1);
        this._dailyProgress(state, 'ability', detail);
      } else if (type === 'interaction') {
        counts.interactions = Math.min(10000, (Number(counts.interactions) || 0) + 1);
        regionStats.interactions = Math.min(999, regionStats.interactions + 1);
        this._dailyProgress(state, 'interaction', detail);
      } else if (type === 'discovery') {
        counts.discoveries = Math.min(10000, (Number(counts.discoveries) || 0) + 1);
        this._dailyProgress(state, 'discovery', detail);
      } else if (type === 'minigame') {
        counts.games = Math.min(10000, (Number(counts.games) || 0) + 1);
        regionStats.games = Math.min(999, regionStats.games + 1);
        this._dailyProgress(state, 'minigame', detail);
        if (detail.won) {
          counts.gameWins = Math.min(10000, (Number(counts.gameWins) || 0) + 1);
          regionStats.wins = Math.min(999, regionStats.wins + 1);
        }
      } else if (type === 'atmosphere') {
        counts.atmospheres = Math.min(10000, (Number(counts.atmospheres) || 0) + 1);
        this._dailyProgress(state, 'atmosphere', detail);
      }

      this._requestProgress(state, type, detail);
      state.region[region] = regionStats;
      this._write(state);
      this._reconcile();
      return this.snapshot();
    }

    _dailyProgress(state, event, detail) {
      const today = localDateKey();
      const daily = state.daily && state.daily.date === today ? state.daily : null;
      if (!daily || (event === 'visit' && detail && detail.initial)) return;
      const card = DAILY_CARDS.find(x => x.id === daily.id);
      if (!card || card.event !== event || daily.complete) return;
      if (event === 'visit' && detail.roomId && daily.visited && daily.visited.includes(detail.roomId)) return;
      if (event === 'visit') {
        daily.visited = Array.isArray(daily.visited) ? daily.visited : [];
        if (detail.roomId) daily.visited.push(detail.roomId);
        daily.progress = daily.visited.length;
      } else {
        daily.progress = Math.min(card.target, (Number(daily.progress) || 0) + 1);
      }
      daily.complete = daily.progress >= card.target;
      state.daily = daily;
    }

    _requestProgress(state, event, detail) {
      const form = detail && detail.form;
      const definition = CREATURE_REQUESTS[form];
      if (!definition || definition.event !== event || !state.daily || state.daily.date !== localDateKey() || (event === 'visit' && detail.initial)) return;
      state.daily.requests = safeObject(state.daily.requests);
      const request = Object.assign({ id: definition.id, progress: 0, complete: false, visited: [] }, safeObject(state.daily.requests[form]));
      request.visited = Array.isArray(request.visited) ? request.visited.slice() : [];
      if (request.id !== definition.id || request.complete) return;
      if (event === 'visit') {
        const roomId = detail.roomId;
        if (!roomId || request.visited.includes(roomId)) return;
        request.visited.push(roomId);
      }
      request.progress = Math.min(1, (Number(request.progress) || 0) + 1);
      request.complete = request.progress >= 1;
      state.daily.requests[form] = request;
    }

    getDailyChallenge(date) {
      const dateKey = localDateKey(date);
      const state = this._journey();
      const i = stableIndex(dateKey, DAILY_CARDS.length);
      const card = DAILY_CARDS[i];
      if (!state.daily || state.daily.date !== dateKey || state.daily.id !== card.id) {
        state.daily = { date: dateKey, id: card.id, progress: 0, complete: false, visited: [] };
        this._write(state);
      }
      return Object.assign({}, card, state.daily, { event: card.event });
    }

    getLocalEvent(date) {
      const d = date || new Date();
      const day = Math.floor(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()) / 86400000);
      return Object.assign({ id: `local-${day}` }, LOCAL_EVENTS[((day % LOCAL_EVENTS.length) + LOCAL_EVENTS.length) % LOCAL_EVENTS.length]);
    }

    getCreatureRequest(form, date) {
      form = CREATURE_REQUESTS[form] ? form : 'eevee';
      this.getDailyChallenge(date);
      const state = this._journey();
      const definition = CREATURE_REQUESTS[form];
      state.daily.requests = safeObject(state.daily.requests);
      if (!state.daily.requests[form] || state.daily.requests[form].id !== definition.id) {
        state.daily.requests[form] = { id: definition.id, progress: 0, complete: false, visited: [] };
        this._write(state);
      }
      return Object.assign({}, definition, state.daily.requests[form], { form, date: state.daily.date, target: 1 });
    }

    _reconcile() {
      const state = this._journey();
      const regions = safeObject(state.region);
      const homeComplete = state.visited.length >= 3 && (Number(state.counters.photos) || 0) >= 1 && (Number(state.counters.gameWins) || 0) >= 1;
      if (homeComplete) state.chapterFlags['many-paths'] = true;
      const requirements = {
        tidewild: r => r.visits.length > 0 && r.photos > 0 && r.wins > 0,
        emberpeak: r => r.visits.length > 0 && r.abilities > 0 && r.wins > 0,
        undercity: r => r.visits.length > 0 && r.interactions > 0 && r.wins > 0,
        dreamway: r => r.visits.length > 0 && r.photos > 0 && r.wins > 0
      };
      Object.keys(requirements).forEach(id => {
        const r = Object.assign({ visits: [], photos: 0, abilities: 0, interactions: 0, wins: 0 }, safeObject(regions[id]));
        if (requirements[id](r)) state.chapterFlags[id] = true;
      });
      const changed = JSON.stringify(state.chapterFlags) !== JSON.stringify(this._journey().chapterFlags);
      if (changed) this._write(state);
      else if (Object.keys(state.chapterFlags).length !== Object.keys(this._journey().chapterFlags).length) this._write(state);
    }

    chapters() {
      const state = this._journey();
      const region = safeObject(state.region);
      const out = CHAPTERS.map(chapter => {
        let checks;
        if (chapter.id === 'many-paths') {
          checks = [state.visited.length >= 3, (Number(state.counters.photos) || 0) > 0, (Number(state.counters.gameWins) || 0) > 0];
        } else if (chapter.id === 'tidewild') {
          const r = safeObject(region.tidewild); checks = [(r.visits || []).length > 0, r.photos > 0, r.wins > 0];
        } else if (chapter.id === 'emberpeak') {
          const r = safeObject(region.emberpeak); checks = [(r.visits || []).length > 0, r.abilities > 0, r.wins > 0];
        } else if (chapter.id === 'undercity') {
          const r = safeObject(region.undercity); checks = [(r.visits || []).length > 0, r.interactions > 0, r.wins > 0];
        } else {
          const r = safeObject(region.dreamway); checks = [(r.visits || []).length > 0, r.photos > 0, r.wins > 0];
        }
        return Object.assign({}, chapter, {
          tasks: chapter.tasks.map((task, i) => Object.assign({}, task, { complete: !!checks[i] })),
          complete: !!state.chapterFlags[chapter.id] || checks.every(Boolean)
        });
      });
      return out;
    }

    snapshot() {
      const state = this._journey();
      return {
        visited: state.visited.slice(), forms: state.forms.slice(),
        counters: Object.assign({}, state.counters), chapterFlags: Object.assign({}, state.chapterFlags),
        chapters: this.chapters(), daily: this.getDailyChallenge(),
        event: this.getLocalEvent(), routines: state.routines.slice(), favorites: state.favorites.slice()
      };
    }

    achievements() {
      const state = this._journey();
      const c = state.counters;
      const records = [
        ['first-room', 'First Footsteps', state.visited.length >= 1],
        ['room-roamer', 'Room Roamer', state.visited.length >= 10],
        ['wide-world', 'Across the House', state.visited.length >= 30],
        ['all-forms', 'Nine Possibilities', state.forms.length >= 9],
        ['little-moments', 'Little Moments', (Number(c.photos) || 0) >= 5],
        ['kind-company', 'Good Company', (Number(c.interactions) || 0) >= 20],
        ['noticer', 'Careful Observer', (Number(c.discoveries) || 0) >= 10],
        ['arcade-sampler', 'Arcade Sampler', (Number(c.games) || 0) >= 10],
        ['arcade-winner', 'Arcade Regular', (Number(c.gameWins) || 0) >= 10],
        ['many-paths', 'A House of Many Paths', !!state.chapterFlags['many-paths']],
        ['tidewild', 'Coast Keeper', !!state.chapterFlags.tidewild],
        ['emberpeak', 'Pilgrim', !!state.chapterFlags.emberpeak],
        ['undercity', 'After Hours', !!state.chapterFlags.undercity],
        ['dreamway', 'Dream Keeper', !!state.chapterFlags.dreamway]
      ];
      return records.map(([id, title, unlocked]) => ({ id, title, unlocked: !!unlocked }));
    }

    toggleFavorite(roomId) {
      const state = this._journey();
      const idx = state.favorites.indexOf(roomId);
      if (idx >= 0) state.favorites.splice(idx, 1);
      else {
        if (state.favorites.length >= 20) state.favorites.shift();
        state.favorites.push(roomId);
      }
      this._write(state);
      return state.favorites.includes(roomId);
    }

    isFavorite(roomId) { return this._journey().favorites.includes(roomId); }

    saveRoutine(name, roomId, form) {
      if (!roomId || !form) return null;
      const state = this._journey();
      const routine = { id: `visit-${Date.now().toString(36)}`, name: String(name || 'My habitat visit').slice(0, 36), roomId, form };
      state.routines = state.routines.filter(r => r.roomId !== roomId || r.form !== form);
      state.routines.push(routine);
      state.routines = state.routines.slice(-6);
      this._write(state);
      return routine;
    }

    removeRoutine(id) {
      const state = this._journey();
      const before = state.routines.length;
      state.routines = state.routines.filter(r => r.id !== id);
      this._write(state);
      return before !== state.routines.length;
    }

    routineList() { return this._journey().routines.slice(); }

    exportSave() {
      if (!this.save.exportJSON) throw new Error('Save export is unavailable.');
      return this.save.exportJSON();
    }

    importSave(text) {
      if (!this.save.importJSON) throw new Error('Save import is unavailable.');
      const state = this.save.importJSON(text);
      this._reconcile();
      return state;
    }
  }

  global.HabitatExperience = { HabitatGuide, DAILY_CARDS, CREATURE_REQUESTS, CHAPTERS, LOCAL_EVENTS, localDateKey };
})(window);
