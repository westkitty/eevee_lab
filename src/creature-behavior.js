/* ============================================================================
   CREATURE BEHAVIOR — Phase 3 bounded memory, needs and relationship scheduling
   ============================================================================ */
(function (global) {
  'use strict';

  const TOUCH_REGIONS = ['head', 'ears', 'cheek', 'neck', 'back', 'flank', 'tail', 'special'];
  const TOY_KINDS = ['ball', 'plush'];
  const FOOD_KINDS = ['berry', 'puff'];

  const SPECIES_BEHAVIOR = Object.freeze({
    eevee: {
      restRate: 1.0,
      rare: { id: 'eevee_choice_shuffle', label: 'Eevee quietly checks two different paths, then returns to the middle as if keeping both options open.', semantic: 'stretch' },
      bond: { id: 'eevee_bond_nuzzle', label: 'Eevee crosses the room just to press its forehead against you, then trots away like nothing happened.', semantic: 'reaction' }
    },
    vaporeon: {
      restRate: 1.1,
      rare: { id: 'vaporeon_rain_listen', label: 'Vaporeon goes perfectly still, fin trembling at weather you cannot hear yet.', semantic: 'reaction' },
      bond: { id: 'vaporeon_bond_circle', label: 'Vaporeon makes one slow, satisfied circle around you before settling nearby.', semantic: 'play' }
    },
    jolteon: {
      restRate: 0.72,
      rare: { id: 'jolteon_static_shiver', label: 'A tiny static shiver races nose-to-tail through Jolteon and every quill answers at once.', semantic: 'reaction' },
      bond: { id: 'jolteon_bond_bump', label: 'Jolteon darts in, bumps your leg with surgical precision, and immediately pretends it was accidental.', semantic: 'play' }
    },
    flareon: {
      restRate: 1.45,
      rare: { id: 'flareon_hearth_doze', label: 'Flareon loses an argument with sleep mid-stretch and simply stays there.', semantic: 'stretch' },
      bond: { id: 'flareon_bond_lean', label: 'Flareon leans its whole furnace-warm side against you and makes moving your problem.', semantic: 'reaction' }
    },
    espeon: {
      restRate: 0.92,
      rare: { id: 'espeon_future_glance', label: 'Espeon looks toward an empty spot a heartbeat before something there catches your attention.', semantic: 'reaction' },
      bond: { id: 'espeon_bond_wait', label: 'Espeon is already waiting exactly where you were about to reach for it.', semantic: 'reaction' }
    },
    umbreon: {
      restRate: 1.12,
      rare: { id: 'umbreon_shadow_listen', label: 'Umbreon listens into the darkest corner of the room until even the room feels obliged to be quiet.', semantic: 'reaction' },
      bond: { id: 'umbreon_bond_guard', label: 'Umbreon settles at your side facing outward, choosing watchfulness over distance.', semantic: 'sit' }
    },
    leafeon: {
      restRate: 1.2,
      rare: { id: 'leafeon_light_bask', label: 'Leafeon finds the brightest patch in the room with absurd precision and turns one leaf toward it.', semantic: 'sit' },
      bond: { id: 'leafeon_bond_settle', label: 'Leafeon chooses the patch nearest you even though several quieter places are available.', semantic: 'sit' }
    },
    glaceon: {
      restRate: 1.0,
      rare: { id: 'glaceon_frost_breath', label: 'One measured breath leaves a brief geometric frost pattern hanging in the air.', semantic: 'reaction' },
      bond: { id: 'glaceon_bond_touch', label: 'Glaceon gives you one deliberate shoulder touch: brief, precise, and unmistakably intentional.', semantic: 'reaction' }
    },
    sylveon: {
      restRate: 0.9,
      rare: { id: 'sylveon_ribbon_check', label: 'Sylveon pauses to inspect every ribbon in reach, including imaginary ones.', semantic: 'groom' },
      bond: { id: 'sylveon_bond_loop', label: 'A feeler loops loosely around your wrist for a moment before Sylveon lets go on its own.', semantic: 'reaction' }
    }
  });

  function cappedIncrement(value, amount, cap) {
    return Math.min(cap == null ? 999 : cap, Math.max(0, Number(value) || 0) + (amount == null ? 1 : amount));
  }

  function winner(map, allowed) {
    let best = null;
    let bestValue = -1;
    (allowed || Object.keys(map || {})).forEach(key => {
      const value = Number((map || {})[key]) || 0;
      if (value > bestValue) { best = key; bestValue = value; }
    });
    return bestValue > 0 ? best : null;
  }

  class CreatureMemory {
    constructor(save) {
      this.save = save;
    }

    snapshot(species) {
      const base = this.save.get(`creatureMemory.${species}`, null);
      return Object.assign({
        interactions: { pet: 0, brush: 0, feed: 0, call: 0, toyThrow: 0, toyRetrieve: 0 },
        touchRegions: {},
        toys: {},
        foods: {},
        roomVisits: {},
        quietSessions: 0,
        sleepSessions: 0,
        favoriteTouchZone: null,
        favoriteToy: null,
        favoriteFood: null,
        preferredSleepSpot: null
      }, base || {});
    }

    _write(species, record) {
      // Entire record is intentionally tiny and semantic. No event log is persisted.
      this.save.set(`creatureMemory.${species}`, record);
      return record;
    }

    recordInteraction(species, kind, detail) {
      const record = this.snapshot(species);
      record.interactions = Object.assign({ pet: 0, brush: 0, feed: 0, call: 0, toyThrow: 0, toyRetrieve: 0 }, record.interactions || {});
      if (Object.prototype.hasOwnProperty.call(record.interactions, kind)) {
        record.interactions[kind] = cappedIncrement(record.interactions[kind]);
      }

      detail = detail || {};
      if ((kind === 'pet' || kind === 'brush') && TOUCH_REGIONS.includes(detail.region)) {
        record.touchRegions = Object.assign({}, record.touchRegions || {});
        record.touchRegions[detail.region] = cappedIncrement(record.touchRegions[detail.region]);
        record.favoriteTouchZone = winner(record.touchRegions, TOUCH_REGIONS);
      }
      if ((kind === 'toyThrow' || kind === 'toyRetrieve') && TOY_KINDS.includes(detail.toy)) {
        record.toys = Object.assign({}, record.toys || {});
        record.toys[detail.toy] = cappedIncrement(record.toys[detail.toy]);
        record.favoriteToy = winner(record.toys, TOY_KINDS);
      }
      if (kind === 'feed' && FOOD_KINDS.includes(detail.food)) {
        record.foods = Object.assign({}, record.foods || {});
        record.foods[detail.food] = cappedIncrement(record.foods[detail.food]);
        record.favoriteFood = winner(record.foods, FOOD_KINDS);
      }
      return this._write(species, record);
    }

    enterRoom(species, roomId) {
      const record = this.snapshot(species);
      record.roomVisits = Object.assign({}, record.roomVisits || {});
      if (roomId) record.roomVisits[roomId] = cappedIncrement(record.roomVisits[roomId], 1, 199);
      return this._write(species, record);
    }

    noteQuiet(species, roomId) {
      const record = this.snapshot(species);
      record.quietSessions = cappedIncrement(record.quietSessions, 1, 199);
      if (roomId) {
        const visits = record.roomVisits || {};
        const current = visits[roomId] || 0;
        const preferred = record.preferredSleepSpot;
        if (!preferred || current >= (visits[preferred] || 0)) record.preferredSleepSpot = roomId;
      }
      return this._write(species, record);
    }

    noteSleep(species, roomId) {
      const record = this.snapshot(species);
      record.sleepSessions = cappedIncrement(record.sleepSessions, 1, 199);
      if (roomId) record.preferredSleepSpot = roomId;
      return this._write(species, record);
    }
  }

  class NeedState {
    constructor(species) {
      this.species = species || 'eevee';
      this.alertness = 0.62;
      this.curiosity = 0.55;
      this.socialInterest = 0.48;
      this.playInterest = 0.52;
      this.restInclination = 0.22;
    }

    interact(kind) {
      this.alertness = Math.min(1, this.alertness + 0.18);
      this.socialInterest = Math.min(1, this.socialInterest + (kind === 'pet' || kind === 'brush' || kind === 'call' ? 0.16 : 0.06));
      this.playInterest = Math.min(1, this.playInterest + (kind.indexOf('toy') === 0 ? 0.22 : 0.04));
      this.curiosity = Math.min(1, this.curiosity + 0.08);
      this.restInclination = Math.max(0.04, this.restInclination - 0.18);
    }

    update(dt, quiet) {
      const profile = SPECIES_BEHAVIOR[this.species] || SPECIES_BEHAVIOR.eevee;
      const seconds = Math.max(0, Number(dt) || 0);
      if (quiet) {
        this.restInclination = Math.min(1, this.restInclination + seconds * 0.0033 * profile.restRate);
        this.curiosity = Math.min(1, this.curiosity + seconds * 0.0011);
      } else {
        this.alertness = Math.min(1, this.alertness + seconds * 0.002);
      }
      // Needs never become punishment meters: they only bias optional behavior opportunities.
      this.socialInterest = Math.max(0.25, this.socialInterest - seconds * 0.00025);
      this.playInterest = Math.max(0.25, this.playInterest - seconds * 0.0002);
      this.alertness = Math.max(0.25, this.alertness - seconds * 0.00045);
    }

    afterSleep() {
      this.restInclination = 0.12;
      this.alertness = 0.72;
    }

    snapshot() {
      return {
        alertness: this.alertness,
        curiosity: this.curiosity,
        socialInterest: this.socialInterest,
        playInterest: this.playInterest,
        restInclination: this.restInclination
      };
    }
  }

  class BehaviorScheduler {
    constructor(options) {
      options = options || {};
      this.save = options.save;
      this.bond = options.bond;
      this.memory = options.memory || new CreatureMemory(this.save);
      this.emit = options.emit || function () {};
      this.random = options.random || Math.random;
      this.species = options.species || 'eevee';
      this.roomId = null;
      this.needs = new NeedState(this.species);
      this.lastInteractionAgo = 0;
      this.quietAccum = 0;
      this.quietRecorded = false;
      this.rareTimer = this._nextRareDelay();
      this.initiativeTimer = 34 + this.random() * 24;
      this.sleeping = false;
      this.sleepTimer = 0;
      this.currentMoment = null;
      this.currentMomentTimer = 0;
    }

    familiarityTier(species) {
      const target = species || this.species;
      return this.bond && this.bond.tier ? this.bond.tier(target) : 0;
    }

    setSpecies(species) {
      if (!species || species === this.species) return;
      if (this.sleeping) this.wake('species-change');
      this.species = species;
      this.needs = new NeedState(species);
      this.lastInteractionAgo = 0;
      this.quietAccum = 0;
      this.quietRecorded = false;
      this.rareTimer = this._nextRareDelay();
      this.initiativeTimer = 34 + this.random() * 24;
    }

    enterRoom(roomId) {
      this.roomId = roomId || null;
      this.memory.enterRoom(this.species, this.roomId);
      this.quietAccum = 0;
      this.quietRecorded = false;
      if (this.sleeping) this.wake('room-change');
    }

    recordInteraction(kind, detail) {
      if (this.sleeping) this.wake('interaction');
      this.lastInteractionAgo = 0;
      this.quietAccum = 0;
      this.quietRecorded = false;
      this.needs.interact(kind);
      this.memory.recordInteraction(this.species, kind, detail || {});
      return this.getDebugState();
    }

    requestBondGesture(reason) {
      if (this.familiarityTier() < 2) return false;
      const def = (SPECIES_BEHAVIOR[this.species] || SPECIES_BEHAVIOR.eevee).bond;
      const event = {
        type: 'bond-gesture',
        id: def.id,
        label: def.label,
        semantic: def.semantic,
        species: this.species,
        room: this.roomId,
        reason: reason || 'relationship',
        tags: ['relationship', 'photographable', 'species:' + this.species]
      };
      this.currentMoment = event;
      this.currentMomentTimer = 4;
      this.emit(event);
      return true;
    }

    wake(reason) {
      if (!this.sleeping) return false;
      this.sleeping = false;
      this.sleepTimer = 0;
      this.needs.afterSleep();
      this.currentMoment = null;
      this.currentMomentTimer = 0;
      this.emit({
        type: 'sleep-end',
        species: this.species,
        room: this.roomId,
        reason: reason || 'natural',
        tags: ['rest', 'wake']
      });
      return true;
    }

    update(dt, context) {
      context = context || {};
      dt = Math.max(0, Math.min(Number(dt) || 0, 0.25));
      const quiet = !!context.idle && !context.specialAction && !context.userActive;
      this.lastInteractionAgo += dt;
      this.needs.update(dt, quiet);
      if (!this.sleeping && this.currentMomentTimer > 0) {
        this.currentMomentTimer = Math.max(0, this.currentMomentTimer - dt);
        if (this.currentMomentTimer === 0) this.currentMoment = null;
      }

      if (this.sleeping) {
        this.sleepTimer -= dt;
        if (context.userActive || context.specialAction || this.sleepTimer <= 0) this.wake(context.userActive ? 'interaction' : 'natural');
        return;
      }

      if (!quiet) {
        this.quietAccum = 0;
        this.quietRecorded = false;
        return;
      }

      this.quietAccum += dt;
      if (!this.quietRecorded && this.quietAccum >= 24) {
        this.memory.noteQuiet(this.species, this.roomId);
        this.quietRecorded = true;
      }

      this.rareTimer -= dt;
      if (this.rareTimer <= 0 && this.lastInteractionAgo >= 10) {
        this._emitRare();
        this.rareTimer = this._nextRareDelay();
      }

      const tier = this.familiarityTier();
      if (tier >= 1) {
        this.initiativeTimer -= dt;
        if (this.initiativeTimer <= 0) {
          this.emit({
            type: 'initiative',
            species: this.species,
            room: this.roomId,
            tier,
            tags: ['relationship', tier >= 2 ? 'bonded' : 'comfortable']
          });
          this.initiativeTimer = (tier >= 2 ? 24 : 40) + this.random() * 24;
        }
      }

      if (this.needs.restInclination >= 0.72 && this.lastInteractionAgo >= 32 && this.quietAccum >= 18) {
        this._startSleep();
      }
    }

    _startSleep() {
      this.sleeping = true;
      this.sleepTimer = 16 + this.random() * 22;
      this.memory.noteSleep(this.species, this.roomId);
      this.currentMomentTimer = Infinity;
      this.currentMoment = {
        type: 'sleep-start',
        species: this.species,
        room: this.roomId,
        semantic: 'sleep',
        tags: ['rest', 'photographable', 'species:' + this.species]
      };
      this.emit(this.currentMoment);
    }

    _emitRare() {
      const def = (SPECIES_BEHAVIOR[this.species] || SPECIES_BEHAVIOR.eevee).rare;
      const event = {
        type: 'rare',
        id: def.id,
        label: def.label,
        semantic: def.semantic,
        species: this.species,
        room: this.roomId,
        tags: ['rare', 'photographable', 'species:' + this.species, 'room:' + (this.roomId || 'any')]
      };
      this.currentMoment = event;
      this.currentMomentTimer = 4;
      this.emit(event);
    }

    _nextRareDelay() {
      return 26 + this.random() * 34;
    }

    getDebugState() {
      return {
        species: this.species,
        roomId: this.roomId,
        familiarityTier: this.familiarityTier(),
        sleeping: this.sleeping,
        sleepTimer: this.sleepTimer,
        quietSeconds: this.quietAccum,
        lastInteractionAgo: this.lastInteractionAgo,
        needs: this.needs.snapshot(),
        memory: this.memory.snapshot(this.species),
        currentMoment: this.currentMoment
      };
    }
  }

  global.CreatureBehaviorSystem = {
    TOUCH_REGIONS,
    TOY_KINDS,
    FOOD_KINDS,
    SPECIES_BEHAVIOR,
    CreatureMemory,
    NeedState,
    BehaviorScheduler
  };
})(window);
