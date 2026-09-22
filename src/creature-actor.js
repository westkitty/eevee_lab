/* ============================================================================
   CREATURE ACTOR — Phase 1 movement, attention and semantic animation ownership
   ============================================================================ */
(function (global) {
  'use strict';

  const THREE = global.THREE;
  if (!THREE) throw new Error('CreatureActor requires THREE');

  const SEMANTIC_SLOTS = Object.freeze([
    'idle', 'walk', 'trot', 'sit', 'lie', 'sleep',
    'wake', 'groom', 'stretch', 'play', 'eat', 'reaction'
  ]);

  const SPECIES_MOTION = Object.freeze({
    eevee:    { speed: 1.28, idleMin: 6.0, idleMax: 10.0, turnRate: 7.5 },
    vaporeon: { speed: 1.08, idleMin: 7.0, idleMax: 12.0, turnRate: 5.5 },
    jolteon:  { speed: 1.62, idleMin: 4.5, idleMax: 8.0,  turnRate: 9.0 },
    flareon:  { speed: 0.98, idleMin: 8.0, idleMax: 13.0, turnRate: 5.0 },
    espeon:   { speed: 1.18, idleMin: 6.0, idleMax: 10.0, turnRate: 7.0 },
    umbreon:  { speed: 1.12, idleMin: 7.0, idleMax: 12.0, turnRate: 6.5 },
    leafeon:  { speed: 1.04, idleMin: 8.0, idleMax: 13.0, turnRate: 5.5 },
    glaceon:  { speed: 1.10, idleMin: 7.0, idleMax: 11.0, turnRate: 6.0 },
    sylveon:  { speed: 1.22, idleMin: 5.0, idleMax: 9.0,  turnRate: 7.5 }
  });

  function clamp01(v) { return Math.max(0, Math.min(1, v)); }
  function angleDelta(from, to) { return Math.atan2(Math.sin(to - from), Math.cos(to - from)); }
  function lerpAngle(from, to, amount) { return from + angleDelta(from, to) * clamp01(amount); }

  class SemanticAnimationController {
    constructor() {
      this.mixer = null;
      this.clips = [];
      this.clipByName = new Map();
      this.semanticMap = Object.fromEntries(SEMANTIC_SLOTS.map(slot => [slot, null]));
      this.activeSlot = 'idle';
      this.activeAction = null;
    }

    attach(root, clips, semanticMap) {
      this.stopAll();
      this.clips = Array.isArray(clips) ? clips.slice() : [];
      this.clipByName = new Map(this.clips.map(clip => [clip.name, clip]));
      this.semanticMap = Object.assign(Object.fromEntries(SEMANTIC_SLOTS.map(slot => [slot, null])), semanticMap || {});
      this.mixer = root && THREE.AnimationMixer ? new THREE.AnimationMixer(root) : null;
      this.activeSlot = 'idle';
    }

    play(slot, fadeSeconds) {
      if (!SEMANTIC_SLOTS.includes(slot)) return false;
      this.activeSlot = slot;
      const rawName = this.semanticMap[slot];
      const clip = rawName ? this.clipByName.get(rawName) : null;
      if (!this.mixer || !clip) {
        if (this.activeAction) {
          this.activeAction.fadeOut(Math.max(0, fadeSeconds || 0.12));
          this.activeAction = null;
        }
        return false;
      }
      const next = this.mixer.clipAction(clip);
      if (this.activeAction === next) return true;
      next.reset().setEffectiveWeight(1).setEffectiveTimeScale(1).play();
      if (this.activeAction) this.activeAction.crossFadeTo(next, Math.max(0, fadeSeconds || 0.16), false);
      this.activeAction = next;
      return true;
    }

    update(dt) { if (this.mixer) this.mixer.update(Math.max(0, dt || 0)); }
    stopAll() { if (this.mixer) this.mixer.stopAllAction(); this.activeAction = null; }
  }

  class CreatureActor {
    constructor(options) {
      options = options || {};
      if (!options.root) throw new Error('CreatureActor requires a root Object3D');
      this.root = options.root;
      this.species = options.species || 'eevee';
      this.enabled = options.enabled !== false;
      this.autonomyEnabled = options.autonomyEnabled !== false;
      this.models = new Map();
      this.roomId = null;
      this.walkable = [];
      this.navCenter = new THREE.Vector3(0, 0, 0);
      this.navRadius = 3;
      this.target = null;
      this.targetSource = null;
      this.state = 'idle';
      this.heading = this.root.rotation ? this.root.rotation.y || 0 : 0;
      this.idleTimer = this._nextIdleDelay();
      this.holdTimer = 0;
      this.attentionPoint = null;
      this.attentionTimer = 0;
      this.gaitPhase = 0;
      this.accumulator = 0;
      this.fixedStep = 1 / 60;
      this.maxSteps = 5;
      this.animation = new SemanticAnimationController();
    }

    registerModel(species, wrapper, rawRoot, clips, semanticMap) {
      if (!species || !wrapper) return null;
      const head = wrapper.userData && wrapper.userData.headGroup ? wrapper.userData.headGroup : null;
      const body = wrapper.userData && wrapper.userData.bodyGroup ? wrapper.userData.bodyGroup : null;
      const record = {
        species, wrapper, rawRoot: rawRoot || null,
        clips: Array.isArray(clips) ? clips.slice() : [],
        semanticMap: Object.assign(Object.fromEntries(SEMANTIC_SLOTS.map(slot => [slot, null])), semanticMap || {}),
        head,
        headBaseY: head && head.rotation ? head.rotation.y : 0,
        body,
        bodyBaseY: body && body.position ? body.position.y : 0,
        bodyBaseZRot: body && body.rotation ? body.rotation.z : 0
      };
      this.models.set(species, record);
      if (species === this.species) this._activateRecord(record);
      return record;
    }

    setActiveSpecies(species) {
      if (!species) return false;
      this._restoreProceduralPose();
      this.species = species;
      const record = this.models.get(species);
      if (record) this._activateRecord(record);
      else this.animation.attach(null, [], null);
      this.target = null;
      this.targetSource = null;
      this.state = 'idle';
      this.idleTimer = this._nextIdleDelay();
      return !!record;
    }

    _activateRecord(record) {
      this.animation.attach(record.rawRoot || record.wrapper, record.clips, record.semanticMap);
      this.animation.play('idle', 0);
    }

    setAutonomyEnabled(enabled) {
      this.autonomyEnabled = !!enabled;
      if (!this.autonomyEnabled && this.targetSource === 'autonomy') this.stop();
    }

    enterRoom(roomId, built) {
      this.roomId = roomId || null;
      this.walkable = [];
      this.navCenter.set(0, 0, 0);
      this.navRadius = 3;
      if (built && built.group && built.group.traverse) {
        built.group.traverse(obj => {
          if (obj && obj.isMesh && obj.userData && obj.userData.walkable) this.walkable.push(obj);
        });
      }
      const floor = this.walkable[0];
      if (floor) {
        if (floor.getWorldPosition) floor.getWorldPosition(this.navCenter);
        this.navCenter.y = 0;
        this.navRadius = Math.max(0.75, Number(floor.userData.walkRadius) || 3);
      }
      const spawn = built && built.spawnPoint ? built.spawnPoint : this.navCenter;
      this.root.position.x = spawn.x;
      this.root.position.z = spawn.z;
      this.target = null;
      this.targetSource = null;
      this.state = 'idle';
      this.idleTimer = this._nextIdleDelay();
      this.holdTimer = 0.6;
      return this.getDebugState();
    }

    moveTo(point, options) {
      if (!point) return false;
      options = options || {};
      const target = this._clampToNav(point);
      const dx = target.x - this.root.position.x;
      const dz = target.z - this.root.position.z;
      if ((dx * dx + dz * dz) < 0.0125) {
        this.target = null;
        this.targetSource = null;
        this.state = 'idle';
        return false;
      }
      this.target = target;
      this.targetSource = options.manual ? 'manual' : (options.source || 'script');
      this.holdTimer = 0;
      this.state = 'walk';
      this.lookAtWorld(target, 1.0);
      return true;
    }

    lookAtWorld(point, seconds) {
      if (!point) return;
      this.attentionPoint = new THREE.Vector3(point.x, point.y || 0, point.z);
      this.attentionTimer = Math.max(0.1, seconds == null ? 1.5 : seconds);
    }

    hold(seconds) {
      this.target = null;
      this.targetSource = null;
      this.state = 'idle';
      this.holdTimer = Math.max(this.holdTimer, seconds == null ? 0.5 : seconds);
      this.idleTimer = this._nextIdleDelay();
      this.animation.play('idle', 0.12);
    }

    stop() { this.hold(0.25); }

    update(dt, elapsed, context) {
      if (!this.enabled) return;
      context = context || {};
      dt = Math.max(0, Math.min(Number(dt) || 0, 0.1));
      if (context.suspended) {
        this.target = null;
        this.targetSource = null;
        this.state = 'held';
        this.accumulator = 0;
        this.idleTimer = this._nextIdleDelay();
        this._relaxView(dt);
        this.animation.play('idle', 0.12);
        this.animation.update(dt);
        return;
      }

      this.accumulator += dt;
      let steps = 0;
      while (this.accumulator >= this.fixedStep && steps < this.maxSteps) {
        this._step(this.fixedStep, context);
        this.accumulator -= this.fixedStep;
        steps++;
      }
      if (steps === this.maxSteps) this.accumulator = 0;

      this._updateAttention(dt, context);
      this._updateProceduralView(dt);
      this.animation.update(dt);
    }

    _step(step, context) {
      if (this.holdTimer > 0) {
        this.holdTimer = Math.max(0, this.holdTimer - step);
        this.state = 'idle';
        return;
      }

      if (this.target) {
        const dx = this.target.x - this.root.position.x;
        const dz = this.target.z - this.root.position.z;
        const distance = Math.sqrt(dx * dx + dz * dz);
        if (distance <= 0.055) {
          this.root.position.x = this.target.x;
          this.root.position.z = this.target.z;
          this.target = null;
          this.targetSource = null;
          this.state = 'idle';
          this.idleTimer = this._nextIdleDelay(context.chillMode ? 0.55 : 1);
          this.animation.play('idle', 0.14);
          return;
        }
        const motion = SPECIES_MOTION[this.species] || SPECIES_MOTION.eevee;
        const desiredHeading = Math.atan2(dx, dz);
        this.heading = lerpAngle(this.heading, desiredHeading, motion.turnRate * step);
        this.root.rotation.y = this.heading;
        const stride = Math.min(distance, motion.speed * step);
        this.root.position.x += (dx / distance) * stride;
        this.root.position.z += (dz / distance) * stride;
        this.state = 'walk';
        this.gaitPhase += step * (7.5 + motion.speed * 2.5);
        this.animation.play('walk', 0.12);
        return;
      }

      this.state = 'idle';
      this.animation.play('idle', 0.16);
      this.idleTimer -= step;
      if (this.autonomyEnabled && !context.reducedMotion && this.idleTimer <= 0) {
        this.moveTo(this._chooseAutonomyTarget(), { source: 'autonomy' });
      }
    }

    _chooseAutonomyTarget() {
      const angle = Math.random() * Math.PI * 2;
      const radius = this.navRadius * (0.18 + Math.random() * 0.62);
      return new THREE.Vector3(
        this.navCenter.x + Math.cos(angle) * radius,
        0,
        this.navCenter.z + Math.sin(angle) * radius
      );
    }

    _clampToNav(point) {
      const dx = Number(point.x) - this.navCenter.x;
      const dz = Number(point.z) - this.navCenter.z;
      const d = Math.sqrt(dx * dx + dz * dz);
      if (!Number.isFinite(d) || d <= this.navRadius) return new THREE.Vector3(Number(point.x) || 0, 0, Number(point.z) || 0);
      const s = this.navRadius / d;
      return new THREE.Vector3(this.navCenter.x + dx * s, 0, this.navCenter.z + dz * s);
    }

    _updateAttention(dt, context) {
      if (this.attentionTimer > 0) this.attentionTimer = Math.max(0, this.attentionTimer - dt);
      let point = this.attentionTimer > 0 ? this.attentionPoint : null;
      if (!point && this.state === 'idle' && context.cameraPosition) point = context.cameraPosition;
      const record = this.models.get(this.species);
      if (!record || !record.head || !record.head.rotation) return;

      let targetYaw = record.headBaseY;
      if (point) {
        const dx = point.x - this.root.position.x;
        const dz = point.z - this.root.position.z;
        const worldHeading = Math.atan2(dx, dz);
        const relative = angleDelta(this.root.rotation.y || 0, worldHeading);
        targetYaw += Math.max(-0.38, Math.min(0.38, relative * 0.55));
      }
      record.head.rotation.y = lerpAngle(record.head.rotation.y, targetYaw, Math.min(1, dt * 7));
    }

    _updateProceduralView(dt) {
      const record = this.models.get(this.species);
      if (!record || !record.body) return;
      if (this.state === 'walk') {
        const bob = Math.abs(Math.sin(this.gaitPhase)) * 0.035;
        const sway = Math.sin(this.gaitPhase * 0.5) * 0.018;
        record.body.position.y = record.bodyBaseY + bob;
        record.body.rotation.z = record.bodyBaseZRot + sway;
      } else {
        record.body.position.y += (record.bodyBaseY - record.body.position.y) * Math.min(1, dt * 10);
        record.body.rotation.z += (record.bodyBaseZRot - record.body.rotation.z) * Math.min(1, dt * 10);
      }
    }

    _relaxView(dt) {
      const record = this.models.get(this.species);
      if (!record) return;
      if (record.body) {
        record.body.position.y += (record.bodyBaseY - record.body.position.y) * Math.min(1, dt * 12);
        record.body.rotation.z += (record.bodyBaseZRot - record.body.rotation.z) * Math.min(1, dt * 12);
      }
      if (record.head && record.head.rotation) {
        record.head.rotation.y = lerpAngle(record.head.rotation.y, record.headBaseY, Math.min(1, dt * 9));
      }
    }

    _restoreProceduralPose() {
      const record = this.models.get(this.species);
      if (!record) return;
      if (record.body) {
        record.body.position.y = record.bodyBaseY;
        record.body.rotation.z = record.bodyBaseZRot;
      }
      if (record.head && record.head.rotation) record.head.rotation.y = record.headBaseY;
    }

    _nextIdleDelay(multiplier) {
      const motion = SPECIES_MOTION[this.species] || SPECIES_MOTION.eevee;
      const t = motion.idleMin + Math.random() * (motion.idleMax - motion.idleMin);
      return t * (multiplier == null ? 1 : multiplier);
    }

    getDebugState() {
      return {
        species: this.species,
        roomId: this.roomId,
        state: this.state,
        targetSource: this.targetSource,
        target: this.target ? { x: this.target.x, z: this.target.z } : null,
        position: { x: this.root.position.x, y: this.root.position.y, z: this.root.position.z },
        heading: this.root.rotation.y,
        navRadius: this.navRadius,
        walkableCount: this.walkable.length,
        rawClipCount: (this.models.get(this.species) || { clips: [] }).clips.length,
        activeSemantic: this.animation.activeSlot,
        mappedClipActive: !!this.animation.activeAction
      };
    }
  }

  global.CreatureActorSystem = { SEMANTIC_SLOTS, SPECIES_MOTION, SemanticAnimationController, CreatureActor };
})(window);
