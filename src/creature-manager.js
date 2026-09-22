/* ============================================================================
   CREATURE MANAGER — Phase 4 multi-creature ownership + social coordination
   ============================================================================ */
(function (global) {
  'use strict';

  const THREE = global.THREE;
  const ActorClass = global.CreatureActorSystem && global.CreatureActorSystem.CreatureActor;
  if (!THREE || !ActorClass) throw new Error('CreatureManager requires THREE + CreatureActorSystem');

  const SOCIAL_ORDER = Object.freeze([
    'greet', 'approach', 'follow', 'inspect',
    'parallel-wander', 'play', 'avoid', 'sit-nearby'
  ]);

  function distance2D(a, b) {
    const dx = a.x - b.x;
    const dz = a.z - b.z;
    return Math.sqrt(dx * dx + dz * dz);
  }

  function cloneTransform(object) {
    return {
      position: object.position.clone(),
      quaternion: object.quaternion.clone(),
      scale: object.scale.clone()
    };
  }

  function restoreTransform(object, saved) {
    object.position.copy(saved.position);
    object.quaternion.copy(saved.quaternion);
    object.scale.copy(saved.scale);
  }

  class CreatureManager {
    constructor(options) {
      options = options || {};
      this.scene = options.scene || null;
      this.random = options.random || Math.random;
      this.onSocialEvent = options.onSocialEvent || function () {};
      this.primary = null;
      this.companions = new Map();
      this.selectedId = null;
      this.roomId = null;
      this.builtRoom = null;
      this.socialTimer = 5;
      this.socialIndex = 0;
      this.socialMode = null;
      this.separationCooldown = 0;
      this.toyInterest = null;
      this.hasGreeted = false;
      this.minSeparation = 0.72;
    }

    setPrimary(actor, metadata) {
      if (!actor) throw new Error('CreatureManager primary actor is required');
      metadata = metadata || {};
      this.primary = {
        id: metadata.id || 'primary',
        species: metadata.species || actor.species || 'eevee',
        actor,
        root: actor.root,
        wrapper: metadata.wrapper || null,
        ownedRoot: false
      };
      if (!this.selectedId) this.selectedId = this.primary.id;
      return this.primary;
    }

    setPrimarySpecies(species, wrapper) {
      if (!this.primary) return false;
      this.primary.species = species || this.primary.species;
      if (wrapper) this.primary.wrapper = wrapper;
      return true;
    }

    setRoom(roomId, built) {
      this.roomId = roomId || null;
      this.builtRoom = built || null;
      this.socialMode = null;
      this.socialTimer = 2.5;
      this.toyInterest = null;
      this.hasGreeted = false;
      return this.roomId;
    }

    hasCompanion(id) { return this.companions.has(id); }

    activateCompanionModel(options) {
      options = options || {};
      const id = options.id || (options.species + '-companion');
      if (this.companions.has(id)) return this.companions.get(id);
      if (!this.scene || !options.wrapper || !options.species || !this.builtRoom) return null;

      const wrapper = options.wrapper;
      const originalParent = wrapper.parent || options.parentRoot || null;
      if (!originalParent) return null;

      const originalTransform = cloneTransform(wrapper);
      const originalVisible = wrapper.visible;
      const root = new THREE.Group();
      root.name = id + '_root';
      this.scene.add(root);
      originalParent.remove(wrapper);
      root.add(wrapper);
      restoreTransform(wrapper, originalTransform);
      wrapper.visible = true;

      const actor = new ActorClass({ root, species: options.species });
      actor.registerModel(
        options.species,
        wrapper,
        options.rawRoot || (wrapper.userData && wrapper.userData.rawRoot) || null,
        options.clips || (wrapper.userData && wrapper.userData.animations) || []
      );
      actor.enterRoom(this.roomId, this.builtRoom);

      const spawn = options.spawnPoint || this._companionSpawnPoint();
      actor.placeAt(spawn);

      const entry = {
        id,
        species: options.species,
        actor,
        root,
        wrapper,
        ownedRoot: true,
        originalParent,
        originalTransform,
        originalVisible
      };
      this.companions.set(id, entry);
      this._emit('companion-joined', { companionId: id, species: options.species });
      return entry;
    }

    registerCompanionActor(options) {
      options = options || {};
      if (!options.id || !options.actor) throw new Error('registerCompanionActor requires id + actor');
      const entry = {
        id: options.id,
        species: options.species || options.actor.species || options.id,
        actor: options.actor,
        root: options.root || options.actor.root,
        wrapper: options.wrapper || null,
        ownedRoot: false,
        originalParent: null,
        originalTransform: null,
        originalVisible: true
      };
      this.companions.set(entry.id, entry);
      return entry;
    }

    deactivateCompanion(id) {
      const entry = this.companions.get(id);
      if (!entry) return false;
      if (entry.actor && entry.actor.animation) entry.actor.animation.stopAll();
      if (entry.ownedRoot && entry.wrapper && entry.originalParent) {
        if (entry.wrapper.parent) entry.wrapper.parent.remove(entry.wrapper);
        entry.originalParent.add(entry.wrapper);
        if (entry.originalTransform) restoreTransform(entry.wrapper, entry.originalTransform);
        entry.wrapper.visible = entry.originalVisible;
        if (entry.root && entry.root.parent) entry.root.parent.remove(entry.root);
      }
      this.companions.delete(id);
      if (this.selectedId === id) this.selectedId = this.primary ? this.primary.id : null;
      if (!this.companions.size) {
        this.socialMode = null;
        this.toyInterest = null;
      }
      this._emit('companion-left', { companionId: id, species: entry.species });
      return true;
    }

    deactivateAllCompanions() {
      Array.from(this.companions.keys()).forEach(id => this.deactivateCompanion(id));
    }

    enforceVisibility() {
      this.companions.forEach(entry => {
        if (entry.wrapper) entry.wrapper.visible = true;
      });
    }

    getCreature(id) {
      if (this.primary && id === this.primary.id) return this.primary;
      return this.companions.get(id) || null;
    }

    selectCreature(id) {
      const entry = this.getCreature(id);
      if (!entry) return false;
      this.selectedId = entry.id;
      return true;
    }

    selectByObject(object) {
      let cur = object;
      while (cur) {
        for (const entry of this.companions.values()) {
          if (entry.wrapper === cur) {
            this.selectedId = entry.id;
            return entry;
          }
        }
        cur = cur.parent;
      }
      return null;
    }

    getSelected() {
      if (this.primary && this.selectedId === this.primary.id) return this.primary;
      return this.companions.get(this.selectedId) || this.primary;
    }

    getSelectableObjects() {
      const out = [];
      this.companions.forEach(entry => { if (entry.wrapper) out.push(entry.wrapper); });
      return out;
    }

    notifyToyReleased(point, kind, object) {
      const companion = this._firstCompanion();
      if (!companion || !point) return false;
      companion.actor.clearBehaviorState('sleep');
      companion.actor.lookAtWorld(point, 1.5);
      companion.actor.moveTo(point, { source: 'toy-competition' });
      this.toyInterest = {
        point: new THREE.Vector3(point.x, point.y || 0, point.z),
        kind: kind || 'toy',
        object: object || null,
        companionId: companion.id,
        timer: 5
      };
      this._emit('toy-race', { companionId: companion.id, species: companion.species, kind: this.toyInterest.kind });
      return true;
    }

    update(dt, elapsed, context) {
      context = context || {};
      const primaryContext = context.primary || {};
      const companionContext = context.companion || {};

      if (this.primary && this.primary.actor) this.primary.actor.update(dt, elapsed, primaryContext);
      this.companions.forEach(entry => entry.actor.update(dt, elapsed, companionContext));

      if (!this.primary || !this.companions.size) return;
      this.separationCooldown = Math.max(0, this.separationCooldown - dt);
      this._updateToyInterest(dt);
      this._updateNapTogether();
      this._updateSeparation(context);
      this._updateSocial(dt, context);
    }

    _updateSeparation(context) {
      if (context.socialSuspended || this.separationCooldown > 0) return;
      const primary = this.primary;
      const companion = this._firstCompanion();
      if (!primary || !companion) return;

      const p = primary.root.position;
      const c = companion.root.position;
      const d = distance2D(p, c);
      if (d >= this.minSeparation || companion.actor.behaviorState === 'sleep') return;

      let dx = c.x - p.x;
      let dz = c.z - p.z;
      if (Math.abs(dx) + Math.abs(dz) < 0.001) {
        const angle = this.random() * Math.PI * 2;
        dx = Math.cos(angle);
        dz = Math.sin(angle);
      }
      const len = Math.sqrt(dx * dx + dz * dz) || 1;
      const target = new THREE.Vector3(
        c.x + (dx / len) * 0.9,
        0,
        c.z + (dz / len) * 0.9
      );
      companion.actor.moveTo(target, { source: 'separation' });
      this.separationCooldown = 0.55;
      this._emit('separate', { companionId: companion.id, distance: d });
    }

    _updateToyInterest(dt) {
      if (!this.toyInterest) return;
      this.toyInterest.timer -= dt;
      const companion = this.companions.get(this.toyInterest.companionId);
      if (!companion || this.toyInterest.timer <= 0) {
        this.toyInterest = null;
        return;
      }
      const d = distance2D(companion.root.position, this.toyInterest.point);
      if (d < 0.72) {
        companion.actor.setBehaviorState('play', 1.8);
        if (this.primary && this.primary.actor) this.primary.actor.lookAtWorld(this.toyInterest.point, 1.2);
        this._emit('toy-contest', {
          companionId: companion.id,
          species: companion.species,
          kind: this.toyInterest.kind
        });
        this.toyInterest = null;
      }
    }

    _updateNapTogether() {
      const primary = this.primary;
      const companion = this._firstCompanion();
      if (!primary || !companion) return;
      const primarySleeping = primary.actor.behaviorState === 'sleep';

      if (!primarySleeping && companion.actor.behaviorState === 'sleep' && this.socialMode && this.socialMode.type === 'nap-together') {
        companion.actor.clearBehaviorState('sleep');
        this.socialMode = null;
        this.socialTimer = 7;
        return;
      }
      if (!primarySleeping || this.socialMode || companion.actor.behaviorState === 'sleep') return;

      const target = this._nearPrimaryPoint(1.05, 0.85);
      companion.actor.moveTo(target, { source: 'social-nap' });
      this.socialMode = { type: 'nap-together', stage: 'approach', target, timer: 10 };
      this._emit('nap-together-start', { companionId: companion.id, species: companion.species });
    }

    _updateSocial(dt, context) {
      const companion = this._firstCompanion();
      if (!companion) return;

      if (this.socialMode) {
        this.socialMode.timer = Math.max(0, this.socialMode.timer - dt);
        this._advanceSocialMode(companion, dt);
        if (this.socialMode && this.socialMode.timer <= 0) {
          if (this.socialMode.type === 'nap-together') companion.actor.clearBehaviorState('sleep');
          this.socialMode = null;
          this.socialTimer = 5 + this.random() * 5;
        }
        return;
      }

      if (context.socialSuspended || context.reducedMotion || context.userActive) return;
      if (this.primary.actor.behaviorState || companion.actor.behaviorState) return;
      if (this.primary.actor.state !== 'idle' || companion.actor.state !== 'idle') return;

      this.socialTimer -= dt;
      if (this.socialTimer > 0) return;

      const type = this.hasGreeted ? SOCIAL_ORDER[this.socialIndex++ % SOCIAL_ORDER.length] : 'greet';
      if (type === 'greet') this.hasGreeted = true;
      this._beginSocial(type, companion);
      this.socialTimer = 8 + this.random() * 8;
    }

    _beginSocial(type, companion) {
      const primary = this.primary;
      if (!primary || !companion) return;
      let target;
      if (type === 'greet' || type === 'approach' || type === 'play' || type === 'sit-nearby') {
        const radius = type === 'approach' ? 1.35 : (type === 'sit-nearby' ? 1.15 : 0.95);
        target = this._nearPrimaryPoint(radius, 0.9);
        companion.actor.moveTo(target, { source: 'social-' + type });
        this.socialMode = { type, stage: 'approach', target, timer: 7 };
      } else if (type === 'follow') {
        target = this._nearPrimaryPoint(1.25, -0.75);
        companion.actor.moveTo(target, { source: 'social-follow' });
        this.socialMode = { type, stage: 'follow', target, timer: 6 };
      } else if (type === 'inspect') {
        target = this._sharedInterestPoint();
        primary.actor.lookAtWorld(target, 2.2);
        companion.actor.lookAtWorld(target, 2.2);
        companion.actor.setBehaviorState('reaction', 1.8);
        this.socialMode = { type, stage: 'observe', target, timer: 2.4 };
        this._emit('inspect', { companionId: companion.id, species: companion.species });
      } else if (type === 'parallel-wander') {
        const angle = this.random() * Math.PI * 2;
        const center = primary.actor.navCenter || new THREE.Vector3();
        const r = Math.max(0.8, (primary.actor.navRadius || 3) * 0.42);
        const a = new THREE.Vector3(center.x + Math.cos(angle) * r, 0, center.z + Math.sin(angle) * r);
        const b = new THREE.Vector3(center.x + Math.cos(angle + 0.42) * r, 0, center.z + Math.sin(angle + 0.42) * r);
        primary.actor.moveTo(a, { source: 'social-parallel' });
        companion.actor.moveTo(b, { source: 'social-parallel' });
        this.socialMode = { type, stage: 'wander', timer: 8 };
        this._emit('parallel-wander', { companionId: companion.id, species: companion.species });
      } else if (type === 'avoid') {
        const p = primary.root.position;
        const c = companion.root.position;
        let dx = c.x - p.x;
        let dz = c.z - p.z;
        if (Math.abs(dx) + Math.abs(dz) < 0.001) { dx = 1; dz = 0; }
        const len = Math.sqrt(dx * dx + dz * dz) || 1;
        target = new THREE.Vector3(c.x + dx / len * 1.25, 0, c.z + dz / len * 1.25);
        companion.actor.moveTo(target, { source: 'social-avoid' });
        this.socialMode = { type, stage: 'retreat', target, timer: 5 };
        this._emit('avoid', { companionId: companion.id, species: companion.species });
      }
    }

    _advanceSocialMode(companion) {
      const mode = this.socialMode;
      if (!mode) return;
      const primary = this.primary;
      const dToTarget = mode.target ? distance2D(companion.root.position, mode.target) : Infinity;

      if (mode.type === 'nap-together') {
        if (primary.actor.behaviorState !== 'sleep') {
          companion.actor.clearBehaviorState('sleep');
          this.socialMode = null;
          return;
        }
        if (mode.stage === 'approach' && dToTarget < 0.18) {
          companion.actor.setBehaviorState('sleep');
          mode.stage = 'sleep';
          mode.timer = 12;
          this._emit('nap-together', { companionId: companion.id, species: companion.species });
        }
        return;
      }

      if ((mode.type === 'greet' || mode.type === 'approach' || mode.type === 'play' || mode.type === 'sit-nearby') &&
          mode.stage === 'approach' && dToTarget < 0.2) {
        companion.actor.lookAtWorld(primary.root.position, 1.8);
        primary.actor.lookAtWorld(companion.root.position, 1.8);
        if (mode.type === 'greet') {
          companion.actor.setBehaviorState('reaction', 1.5);
          primary.actor.setBehaviorState('reaction', 1.1);
          this._emit('greet', { companionId: companion.id, species: companion.species });
        } else if (mode.type === 'approach') {
          companion.actor.setBehaviorState('sit', 2.2);
          this._emit('approach', { companionId: companion.id, species: companion.species });
        } else if (mode.type === 'play') {
          companion.actor.setBehaviorState('play', 2.2);
          primary.actor.setBehaviorState('play', 1.9);
          this._emit('play', { companionId: companion.id, species: companion.species });
        } else {
          companion.actor.setBehaviorState('sit', 3.4);
          this._emit('sit-nearby', { companionId: companion.id, species: companion.species });
        }
        mode.stage = 'settled';
        mode.timer = 3.2;
      }

      if (mode.type === 'follow' && dToTarget < 0.25) {
        companion.actor.setBehaviorState('sit', 1.8);
        this._emit('follow', { companionId: companion.id, species: companion.species });
        this.socialMode = null;
      }

      if ((mode.type === 'parallel-wander' || mode.type === 'avoid') &&
          companion.actor.state === 'idle' && (!primary.actor.target || mode.type === 'avoid')) {
        this.socialMode = null;
      }
    }

    _nearPrimaryPoint(radius, angleOffset) {
      const p = this.primary.root.position;
      const heading = this.primary.root.rotation ? this.primary.root.rotation.y || 0 : 0;
      const a = heading + (angleOffset == null ? 0.8 : angleOffset);
      return new THREE.Vector3(
        p.x + Math.sin(a) * radius,
        0,
        p.z + Math.cos(a) * radius
      );
    }

    _sharedInterestPoint() {
      const actor = this.primary.actor;
      const center = actor.navCenter || new THREE.Vector3();
      const r = Math.max(0.6, (actor.navRadius || 3) * 0.5);
      const a = this.random() * Math.PI * 2;
      return new THREE.Vector3(center.x + Math.cos(a) * r, 0.65, center.z + Math.sin(a) * r);
    }

    _companionSpawnPoint() {
      if (!this.primary || !this.primary.actor) return new THREE.Vector3(1.25, 0, 0.8);
      const center = this.primary.actor.navCenter || new THREE.Vector3();
      return new THREE.Vector3(center.x - 1.35, 0, center.z + 0.85);
    }

    _firstCompanion() {
      const first = this.companions.values().next();
      return first.done ? null : first.value;
    }

    _emit(type, payload) {
      this.onSocialEvent(Object.assign({
        type,
        room: this.roomId,
        primarySpecies: this.primary ? this.primary.species : null
      }, payload || {}));
    }

    getDebugState() {
      const companion = this._firstCompanion();
      return {
        activeCount: (this.primary ? 1 : 0) + this.companions.size,
        primaryId: this.primary ? this.primary.id : null,
        primarySpecies: this.primary ? this.primary.species : null,
        selectedId: this.selectedId,
        roomId: this.roomId,
        companionCount: this.companions.size,
        companions: Array.from(this.companions.values()).map(entry => ({
          id: entry.id,
          species: entry.species,
          state: entry.actor.state,
          behaviorState: entry.actor.behaviorState,
          position: {
            x: entry.root.position.x,
            y: entry.root.position.y,
            z: entry.root.position.z
          }
        })),
        pairDistance: this.primary && companion ? distance2D(this.primary.root.position, companion.root.position) : null,
        socialMode: this.socialMode ? this.socialMode.type : null,
        toyCompetition: !!this.toyInterest
      };
    }
  }

  global.CreatureManagerSystem = { SOCIAL_ORDER, distance2D, CreatureManager };
})(window);
