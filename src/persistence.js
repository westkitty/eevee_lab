/* ==========================================================================
   PERSISTENCE — one versioned local save for the whole habitat experience.
   Replaces the old bare 'eevee_dash_highscore' key (migrated in, not lost).
   ========================================================================== */
(function (global) {
  'use strict';

  const SAVE_KEY = 'eevee_habitat_save';
  const SAVE_VERSION = 4;
  const LEGACY_HIGHSCORE_KEY = 'eevee_dash_highscore';

  function defaultState() {
    return {
      version: SAVE_VERSION,
      activeForm: 'eevee',
      isShiny: false,
      lastRoom: 'conservatory',
      highScore: 0,
      ui: {
        density: 'minimal',        // minimal | standard | full
        reducedMotion: false,
        musicOn: false,
        sfxOn: true,
        musicVolume: 0.58,
        sfxVolume: 0.78,
        cameraSensitivity: 1.0,
        ambienceLevel: 0.8,
        cameraAutoFollow: false,
        controlScheme: 'auto',       // auto | keyboard | touch
        captions: true,
        keyBindings: { wheel: 'e', map: 'm', games: 'g' },
        hintsSeen: {}               // { orbitHint: true, focusHint: true, ... }
      },
      camera: {
        preset: 'fullbody'
      },
      discovery: {
        behaviors: {},              // discoveryId -> true
        mementos: {},                // mementoId -> true
        rareMoments: {}              // rareMomentId -> true
      },
      bond: {},                     // form -> { familiarity: number, lastInteractions: [] }
      resonance: {},                // roomId -> number 0..1
      atmosphereUnlocked: {},       // roomId -> [variantId,...]
      atmosphereSelected: {},       // roomId -> variantId
      roomMemory: {},               // legacy + small bounded symbolic flags
      roomNarrative: {},            // roomId -> bounded semantic narrative counters/state
      placedObjects: {},            // roomId -> objectId -> {x,y,z,ry}; never scene serialization
      abilityMutations: {},         // roomId -> targetId -> semantic species ability result
      crossContamination: {},       // roomId -> [{id,originRoom,originEvent,objectType,destinationRoom}]
      album: [],                    // [{id, form, room, score, timestamp, dataSize}]
      minigames: { plays: {}, highScores: {}, completed: {}, wins: 0 },
      journey: { visited: [], counters: {}, chapterFlags: {}, daily: null, routines: [], favorites: [] }
    };
  }

  function normalizeLegacyCrossContamination(raw) {
    const out = {};
    if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return out;
    const legacyKinds = ['ribbon', 'shell', 'tag'];
    Object.keys(raw).forEach(roomId => {
      const list = Array.isArray(raw[roomId]) ? raw[roomId] : [];
      out[roomId] = list.slice(-4).map((item, index) => {
        if (item && typeof item === 'object' && item.id) {
          return {
            id: String(item.id),
            originRoom: item.originRoom || 'legacy',
            originEvent: item.originEvent || 'legacy',
            objectType: item.objectType || legacyKinds[index % legacyKinds.length],
            destinationRoom: item.destinationRoom || roomId
          };
        }
        return {
          id: String(item),
          originRoom: 'legacy',
          originEvent: 'legacy-threshold',
          objectType: legacyKinds[index % legacyKinds.length],
          destinationRoom: roomId
        };
      });
    });
    return out;
  }

  function migrate(raw) {
    // No stored save yet: start fresh but pull the legacy high score in.
    if (!raw) {
      const state = defaultState();
      const legacy = parseInt(global.localStorage.getItem(LEGACY_HIGHSCORE_KEY) || '0', 10);
      if (!Number.isNaN(legacy) && legacy > 0) state.highScore = legacy;
      return state;
    }

    const defaults = defaultState();
    let state = Object.assign({}, defaults, raw);
    state.ui = Object.assign({}, defaults.ui, raw.ui || {});
    state.ui.keyBindings = Object.assign({}, defaults.ui.keyBindings, raw.ui && raw.ui.keyBindings || {});
    state.camera = Object.assign({}, defaults.camera, raw.camera || {});
    state.discovery = Object.assign({}, defaults.discovery, raw.discovery || {});
    state.album = Array.isArray(raw.album)
      ? raw.album.filter(entry => entry && typeof entry === 'object' && !Array.isArray(entry))
        .sort((a, b) => (Number(b.score) || 0) - (Number(a.score) || 0)).slice(0, 12)
      : [];
    state.minigames = Object.assign({}, defaults.minigames, raw.minigames || {});
    state.minigames.plays = Object.assign({}, defaults.minigames.plays, raw.minigames && raw.minigames.plays || {});
    state.minigames.highScores = Object.assign({}, defaults.minigames.highScores, raw.minigames && raw.minigames.highScores || {});
    state.minigames.completed = Object.assign({}, defaults.minigames.completed, raw.minigames && raw.minigames.completed || {});
    state.journey = Object.assign({}, defaults.journey, raw.journey || {});
    state.journey.counters = Object.assign({}, defaults.journey.counters, raw.journey && raw.journey.counters || {});
    state.journey.chapterFlags = Object.assign({}, defaults.journey.chapterFlags, raw.journey && raw.journey.chapterFlags || {});
    state.journey.routines = Array.isArray(raw.journey && raw.journey.routines) ? raw.journey.routines.slice(0, 6) : [];
    state.journey.favorites = Array.isArray(raw.journey && raw.journey.favorites) ? raw.journey.favorites.slice(0, 20) : [];
    state.journey.visited = Array.isArray(raw.journey && raw.journey.visited) ? raw.journey.visited.slice(-100) : [];

    if (!raw.version || raw.version < 2) {
      state.roomNarrative = (raw.roomNarrative && typeof raw.roomNarrative === 'object') ? raw.roomNarrative : {};
      state.placedObjects = (raw.placedObjects && typeof raw.placedObjects === 'object') ? raw.placedObjects : {};
      state.crossContamination = normalizeLegacyCrossContamination(raw.crossContamination || {});
    }

    if (!raw.version || raw.version < 3) {
      state.abilityMutations = (raw.abilityMutations && typeof raw.abilityMutations === 'object' && !Array.isArray(raw.abilityMutations))
        ? raw.abilityMutations
        : {};
    }

    if (!state.roomNarrative || typeof state.roomNarrative !== 'object' || Array.isArray(state.roomNarrative)) state.roomNarrative = {};
    if (!state.placedObjects || typeof state.placedObjects !== 'object' || Array.isArray(state.placedObjects)) state.placedObjects = {};
    if (!state.abilityMutations || typeof state.abilityMutations !== 'object' || Array.isArray(state.abilityMutations)) state.abilityMutations = {};
    if (!state.minigames || typeof state.minigames !== 'object' || Array.isArray(state.minigames)) state.minigames = defaults.minigames;
    if (!state.journey || typeof state.journey !== 'object' || Array.isArray(state.journey)) state.journey = defaults.journey;
    if (!Array.isArray(state.journey.visited)) state.journey.visited = [];
    if (!Array.isArray(state.journey.routines)) state.journey.routines = [];
    if (!Array.isArray(state.journey.favorites)) state.journey.favorites = [];
    if (!state.journey.counters || typeof state.journey.counters !== 'object' || Array.isArray(state.journey.counters)) state.journey.counters = {};
    if (!state.journey.chapterFlags || typeof state.journey.chapterFlags !== 'object' || Array.isArray(state.journey.chapterFlags)) state.journey.chapterFlags = {};
    state.crossContamination = normalizeLegacyCrossContamination(state.crossContamination || {});
    state.version = SAVE_VERSION;
    return state;
  }

  class SaveManager {
    constructor() {
      this.state = this._load();
      this._saveTimer = null;
    }

    _load() {
      try {
        const rawText = global.localStorage.getItem(SAVE_KEY);
        const raw = rawText ? JSON.parse(rawText) : null;
        return migrate(raw);
      } catch (err) {
        console.warn('[persistence] failed to load save, starting fresh:', err);
        return defaultState();
      }
    }

    get(path, fallback) {
      const parts = path.split('.');
      let cur = this.state;
      for (const p of parts) {
        if (cur == null) return fallback;
        cur = cur[p];
      }
      return cur === undefined ? fallback : cur;
    }

    set(path, value) {
      const parts = path.split('.');
      let cur = this.state;
      for (let i = 0; i < parts.length - 1; i++) {
        if (typeof cur[parts[i]] !== 'object' || cur[parts[i]] === null) cur[parts[i]] = {};
        cur = cur[parts[i]];
      }
      cur[parts[parts.length - 1]] = value;
      this.scheduleSave();
      return value;
    }

    // Direct mutation escape hatch for nested structures (e.g. bond tracking).
    mutate(fn) {
      fn(this.state);
      this.scheduleSave();
    }

    scheduleSave() {
      clearTimeout(this._saveTimer);
      this._saveTimer = setTimeout(() => this.flush(), 250);
    }

    flush() {
      clearTimeout(this._saveTimer);
      this._saveTimer = null;
      try {
        global.localStorage.setItem(SAVE_KEY, JSON.stringify(this.state));
      } catch (err) {
        console.warn('[persistence] failed to persist save:', err);
      }
    }

    exportJSON() {
      this.flush();
      return JSON.stringify({ format: 'eevee-habitat-save', version: SAVE_VERSION, exportedAt: new Date().toISOString(), data: this.state }, null, 2);
    }

    importJSON(text) {
      if (typeof text !== 'string' || text.length > 2 * 1024 * 1024) throw new Error('Save file is empty or too large.');
      let payload;
      try { payload = JSON.parse(text); } catch (_) { throw new Error('That file is not valid JSON.'); }
      const raw = payload && payload.format === 'eevee-habitat-save' ? payload.data : payload;
      if (!raw || typeof raw !== 'object' || Array.isArray(raw)) throw new Error('That file does not contain a habitat save.');
      if (raw.activeForm && !['eevee','vaporeon','jolteon','flareon','espeon','umbreon','leafeon','glaceon','sylveon'].includes(raw.activeForm)) {
        throw new Error('That save contains an unknown active form.');
      }
      this.state = migrate(raw);
      this.flush();
      return this.state;
    }

    recordHighScore(score) {
      if (score > this.state.highScore) {
        this.state.highScore = score;
        this.scheduleSave();
        return true;
      }
      return false;
    }

    // Bounded album: keep the best N photos by score, metadata only (no image blobs).
    addPhoto(entry, maxEntries = 12) {
      const limit = Math.max(0, Math.floor(Number(maxEntries) || 0));
      const album = Array.isArray(this.state.album)
        ? this.state.album.filter(item => item && typeof item === 'object' && !Array.isArray(item))
        : [];
      if (entry && typeof entry === 'object' && !Array.isArray(entry)) album.push(entry);
      album.sort((a, b) => (Number(b.score) || 0) - (Number(a.score) || 0));
      this.state.album = album.slice(0, limit);
      this.scheduleSave();
    }
  }

  global.SaveManager = SaveManager;
})(window);
