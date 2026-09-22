/* ==========================================================================
   PERSISTENCE — one versioned local save for the whole habitat experience.
   Replaces the old bare 'eevee_dash_highscore' key (migrated in, not lost).
   ========================================================================== */
(function (global) {
  'use strict';

  const SAVE_KEY = 'eevee_habitat_save';
  const SAVE_VERSION = 1;
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
      roomMemory: {},               // roomId -> small symbolic state (toy left out, lamp lit, etc.)
      crossContamination: {},       // roomId -> [markerId,...]
      album: []                    // [{id, form, room, score, timestamp, dataSize}]
    };
  }

  function migrate(raw) {
    // No stored save yet: start fresh but pull the legacy high score in.
    if (!raw) {
      const state = defaultState();
      const legacy = parseInt(global.localStorage.getItem(LEGACY_HIGHSCORE_KEY) || '0', 10);
      if (!Number.isNaN(legacy) && legacy > 0) state.highScore = legacy;
      return state;
    }

    let state = raw;
    // Future migrations would chain here keyed on state.version.
    if (!state.version || state.version < SAVE_VERSION) {
      const fresh = defaultState();
      state = Object.assign(fresh, state, { version: SAVE_VERSION });
      state.ui = Object.assign(fresh.ui, state.ui || {});
      state.camera = Object.assign(fresh.camera, state.camera || {});
      state.discovery = Object.assign(fresh.discovery, state.discovery || {});
    }
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
