/* ==========================================================================
   PERSISTENCE — one versioned local save for the whole habitat experience.
   Replaces the old bare 'eevee_dash_highscore' key (migrated in, not lost).
   ========================================================================== */
(function (global) {
  'use strict';

  const SAVE_KEY = 'eevee_habitat_save';
  const SAVE_VERSION = 3;
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
        cameraSensitivity: 1.0,
        ambienceLevel: 0.8,
        cameraAutoFollow: false,
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
      album: []                    // [{id, form, room, score, timestamp, dataSize}]
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
    state.camera = Object.assign({}, defaults.camera, raw.camera || {});
    state.discovery = Object.assign({}, defaults.discovery, raw.discovery || {});

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
      try {
        global.localStorage.setItem(SAVE_KEY, JSON.stringify(this.state));
      } catch (err) {
        console.warn('[persistence] failed to persist save:', err);
      }
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
      this.state.album.push(entry);
      this.state.album.sort((a, b) => b.score - a.score);
      if (this.state.album.length > maxEntries) {
        this.state.album.length = maxEntries;
      }
      this.scheduleSave();
    }
  }

  global.SaveManager = SaveManager;
})(window);
