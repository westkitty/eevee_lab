/* ==========================================================================
   DISCOVERY SYSTEM — personalities, bond/familiarity, short-term interaction
   memory, behavioral discoveries (room+form+interaction combos), mementos,
   and habitat resonance. All local, bounded, no punishment mechanics.
   ========================================================================== */
(function (global) {
  'use strict';

  /* Species personalities: idle timing + reaction flavor, not just text. */
  const PERSONALITIES = {
    eevee: { label: 'curious & excitable', idleMin: 2.2, idleMax: 4.0, reactionScale: 1.15, breathRate: 1.0 },
    vaporeon: { label: 'relaxed & playful', idleMin: 3.5, idleMax: 6.0, reactionScale: 0.9, breathRate: 0.75 },
    jolteon: { label: 'twitchy & fast', idleMin: 0.9, idleMax: 2.0, reactionScale: 1.4, breathRate: 1.6 },
    flareon: { label: 'cozy & sleepy', idleMin: 4.5, idleMax: 7.5, reactionScale: 0.8, breathRate: 0.6 },
    espeon: { label: 'composed & anticipatory', idleMin: 3.0, idleMax: 5.0, reactionScale: 1.0, breathRate: 0.85 },
    umbreon: { label: 'reserved & nocturnal', idleMin: 4.0, idleMax: 7.0, reactionScale: 0.85, breathRate: 0.7 },
    leafeon: { label: 'calm & environment-focused', idleMin: 3.8, idleMax: 6.5, reactionScale: 0.8, breathRate: 0.65 },
    glaceon: { label: 'restrained & precise', idleMin: 3.2, idleMax: 5.5, reactionScale: 0.75, breathRate: 0.7 },
    sylveon: { label: 'highly social', idleMin: 1.8, idleMax: 3.2, reactionScale: 1.25, breathRate: 1.1 }
  };

  /* Toy/treat preference weighting: 1.0 = neutral, >1 = favored (bigger reaction, never punished). */
  const TOY_PREFERENCES = {
    eevee: { berry: 1.1, puff: 1.2, disco: 1.1, loaf: 1.0, derp: 1.2, roomba: 0.9 },
    vaporeon: { berry: 1.0, puff: 1.0, disco: 1.0, loaf: 1.1, derp: 0.9, roomba: 0.9 },
    jolteon: { berry: 0.9, puff: 0.9, disco: 1.3, loaf: 0.7, derp: 1.0, roomba: 1.1 },
    flareon: { berry: 1.1, puff: 1.3, disco: 0.9, loaf: 1.3, derp: 1.0, roomba: 0.6 },
    espeon: { berry: 1.0, puff: 0.9, disco: 0.8, loaf: 1.0, derp: 0.8, roomba: 0.7 },
    umbreon: { berry: 1.0, puff: 0.9, disco: 0.7, loaf: 1.1, derp: 0.9, roomba: 0.6 },
    leafeon: { berry: 1.2, puff: 0.9, disco: 0.7, loaf: 1.1, derp: 0.9, roomba: 0.6 },
    glaceon: { berry: 0.9, puff: 0.9, disco: 0.8, loaf: 1.0, derp: 0.8, roomba: 0.7 },
    sylveon: { berry: 1.1, puff: 1.1, disco: 1.2, loaf: 1.0, derp: 1.1, roomba: 0.8 }
  };

  /* Behavioral discoveries: ROOM + FORM + INTERACTION -> a named journal entry. */
  const DISCOVERY_TABLE = [
    { id: 'vaporeon_splash', room: 'vaporeon', form: 'vaporeon', interaction: 'roomProp', label: 'Vaporeon dissolves into the pool for a heartbeat before splashing back out.' },
    { id: 'jolteon_overload', room: 'jolteon', form: 'jolteon', interaction: 'roomProp', label: 'Every dead bulb in the relay flickers alive at once, then dies down giggling with static.' },
    { id: 'flareon_ember_sneeze', room: 'flareon', form: 'flareon', interaction: 'roomProp', label: 'A tiny ember sneeze singes the edge of a cushion. Flareon looks very unbothered.' },
    { id: 'espeon_foresight', room: 'espeon', form: 'espeon', interaction: 'roomProp', label: 'A star chart page turns itself before Espeon even looks at it.' },
    { id: 'umbreon_vanish', room: 'umbreon', form: 'umbreon', interaction: 'roomProp', label: 'Umbreon steps into shadow and reappears by the moon dial, rings still glowing.' },
    { id: 'leafeon_bloom', room: 'leafeon', form: 'leafeon', interaction: 'roomProp', label: 'A vine curls tighter around the old workbench, and one flower opens.' },
    { id: 'glaceon_frost_trace', room: 'glaceon', form: 'glaceon', interaction: 'roomProp', label: 'Frost blooms in perfect paw prints across the polished floor.' },
    { id: 'sylveon_ribbon_link', room: 'sylveon', form: 'sylveon', interaction: 'roomProp', label: 'A ribbon drifts loose and ties itself gently around the nearest memento.' },
    { id: 'eevee_stone_hover', room: 'eevee', form: 'eevee', interaction: 'roomProp', label: 'Eevee noses an evolution stone, considers it deeply, and decides against it. For now.' },
    { id: 'cross_species_curiosity', room: null, form: null, interaction: 'call', label: 'No matter the form, calling gets the same instant, full-body attention.' }
  ];

  class BondTracker {
    constructor(save) { this.save = save; }
    familiarity(form) { return this.save.get(`bond.${form}.familiarity`, 0); }
    bump(form, amount = 3) {
      const cur = this.familiarity(form);
      const next = Math.min(100, cur + amount * (1 - cur / 140)); // diminishing returns, never decays
      this.save.set(`bond.${form}.familiarity`, Math.round(next * 10) / 10);
      return next;
    }
    tier(form) {
      const f = this.familiarity(form);
      if (f >= 70) return 2;
      if (f >= 30) return 1;
      return 0;
    }
  }

  class InteractionMemory {
    constructor(windowSize = 3) {
      this.windowSize = windowSize;
      this.recent = {}; // key -> [lines used recently]
    }
    pick(key, pool) {
      if (!pool || !pool.length) return '';
      if (pool.length === 1) return pool[0];
      const used = this.recent[key] || [];
      let choices = pool.filter((_, i) => !used.includes(i));
      if (!choices.length) choices = pool;
      const idx = pool.indexOf(choices[Math.floor(Math.random() * choices.length)]);
      const nextUsed = [idx, ...used].slice(0, this.windowSize);
      this.recent[key] = nextUsed;
      return pool[idx];
    }
  }

  class ResonanceTracker {
    constructor(save) { this.save = save; }
    get(roomId) { return this.save.get(`resonance.${roomId}`, 0); }
    bump(roomId, amount = 0.06) {
      const next = Math.min(1, this.get(roomId) + amount);
      this.save.set(`resonance.${roomId}`, next);
      return next;
    }
    // Suggestion only — callers decide whether to surface a subtle hint. Never auto-evolves.
    isResonant(roomId) { return this.get(roomId) >= 0.6; }
  }

  class DiscoveryLog {
    constructor(save, onUnlock) {
      this.save = save;
      this.onUnlock = onUnlock || function () {};
    }
    hasBehavior(id) { return !!this.save.get(`discovery.behaviors.${id}`, false); }
    unlockBehavior(id, label) {
      if (this.hasBehavior(id)) return false;
      this.save.set(`discovery.behaviors.${id}`, true);
      this.onUnlock({ type: 'behavior', id, label });
      return true;
    }
    hasMemento(id) { return !!this.save.get(`discovery.mementos.${id}`, false); }
    unlockMemento(id, label) {
      if (this.hasMemento(id)) return false;
      this.save.set(`discovery.mementos.${id}`, true);
      this.onUnlock({ type: 'memento', id, label });
      return true;
    }
    hasRareMoment(id) { return !!this.save.get(`discovery.rareMoments.${id}`, false); }
    unlockRareMoment(id, label) {
      if (this.hasRareMoment(id)) return false;
      this.save.set(`discovery.rareMoments.${id}`, true);
      this.onUnlock({ type: 'rare', id, label });
      return true;
    }

    checkCombo(room, form, interaction) {
      const found = DISCOVERY_TABLE.find(d =>
        (d.room === room || d.room === null) &&
        (d.form === form || d.form === null) &&
        d.interaction === interaction &&
        !this.hasBehavior(d.id)
      );
      if (found) this.unlockBehavior(found.id, found.label);
      return found || null;
    }

    allEntries() {
      const entries = [];
      const behaviors = this.save.get('discovery.behaviors', {});
      const mementos = this.save.get('discovery.mementos', {});
      const rares = this.save.get('discovery.rareMoments', {});
      DISCOVERY_TABLE.forEach(d => { if (behaviors[d.id]) entries.push({ type: 'behavior', id: d.id, label: d.label }); });
      Object.keys(mementos).forEach(id => entries.push({ type: 'memento', id, label: id }));
      Object.keys(rares).forEach(id => entries.push({ type: 'rare', id, label: id }));
      return entries;
    }

    count() { return Object.keys(this.save.get('discovery.behaviors', {})).length
      + Object.keys(this.save.get('discovery.mementos', {})).length
      + Object.keys(this.save.get('discovery.rareMoments', {})).length; }
  }

  global.DiscoverySystem = {
    PERSONALITIES,
    TOY_PREFERENCES,
    DISCOVERY_TABLE,
    BondTracker,
    InteractionMemory,
    ResonanceTracker,
    DiscoveryLog
  };
})(window);
