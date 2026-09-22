/* ============================================================================
   INTERACTION SYSTEM — Phase 2 tactile strokes, tools and manipulable props
   ============================================================================ */
(function (global) {
  'use strict';

  const THREE = global.THREE;
  if (!THREE) throw new Error('InteractionSystem requires THREE');

  const TOUCH_PROFILES = Object.freeze({
    eevee:    { head: 1.3, ears: 1.2, cheek: 1.2, neck: 1.1, back: 1.0, flank: 0.9, tail: 0.8, special: 1.0 },
    vaporeon: { head: 1.0, ears: 0.9, cheek: 1.0, neck: 0.8, back: 0.9, flank: 1.0, tail: 1.3, special: 1.2 },
    jolteon:  { head: 1.0, ears: 0.8, cheek: 0.9, neck: 0.7, back: 0.8, flank: 0.8, tail: 0.9, special: 1.2 },
    flareon:  { head: 1.2, ears: 1.0, cheek: 1.2, neck: 1.3, back: 1.0, flank: 1.0, tail: 1.2, special: 1.0 },
    espeon:   { head: 1.3, ears: 0.9, cheek: 1.1, neck: 1.0, back: 0.9, flank: 0.8, tail: 0.9, special: 1.3 },
    umbreon:  { head: 1.0, ears: 0.9, cheek: 0.9, neck: 0.9, back: 1.0, flank: 0.9, tail: 0.8, special: 1.1 },
    leafeon:  { head: 1.0, ears: 0.8, cheek: 1.0, neck: 1.0, back: 1.2, flank: 1.1, tail: 1.2, special: 1.1 },
    glaceon:  { head: 1.1, ears: 0.8, cheek: 1.0, neck: 1.0, back: 0.9, flank: 0.9, tail: 0.9, special: 1.1 },
    sylveon:  { head: 1.2, ears: 1.0, cheek: 1.2, neck: 1.1, back: 1.0, flank: 1.0, tail: 1.0, special: 1.35 }
  });

  function objectPathName(obj) {
    const parts = [];
    let cur = obj;
    let depth = 0;
    while (cur && depth < 6) {
      if (cur.name) parts.push(String(cur.name).toLowerCase());
      cur = cur.parent;
      depth++;
    }
    return parts.join(' ');
  }

  function classifyTactileRegion(hitObject, point, bounds) {
    const names = objectPathName(hitObject);
    if (/ear/.test(names)) return 'ears';
    if (/tail|fluke/.test(names)) return 'tail';
    if (/ribbon|feeler|gem|bang|fin/.test(names)) return 'special';
    if (/cheek|jaw|mouth|muzzle|nose/.test(names)) return 'cheek';
    if (/neck|ruff|collar/.test(names)) return 'neck';

    if (!point || !bounds || !bounds.min || !bounds.max) return 'flank';
    const sx = Math.max(0.0001, bounds.max.x - bounds.min.x);
    const sy = Math.max(0.0001, bounds.max.y - bounds.min.y);
    const sz = Math.max(0.0001, bounds.max.z - bounds.min.z);
    const nx = (point.x - bounds.min.x) / sx;
    const ny = (point.y - bounds.min.y) / sy;
    const nz = (point.z - bounds.min.z) / sz;

    if (ny > 0.78) return Math.abs(nx - 0.5) > 0.24 ? 'ears' : 'head';
    if (ny > 0.60 && nz > 0.58) return 'neck';
    if (ny > 0.56 && nz <= 0.58) return 'back';
    if (nz < 0.18 && ny > 0.35) return 'tail';
    return 'flank';
  }

  class StrokeTracker {
    constructor() { this.reset(); }

    reset() {
      this.active = false;
      this.startedAt = 0;
      this.lastAt = 0;
      this.lastX = 0;
      this.lastY = 0;
      this.distance = 0;
      this.samples = 0;
      this.regions = Object.create(null);
      this.primaryRegion = 'flank';
    }

    begin(x, y, region, timeMs) {
      this.reset();
      this.active = true;
      this.startedAt = timeMs == null ? performance.now() : timeMs;
      this.lastAt = this.startedAt;
      this.lastX = x || 0;
      this.lastY = y || 0;
      this.primaryRegion = region || 'flank';
      this.regions[this.primaryRegion] = 1;
      this.samples = 1;
      return this;
    }

    sample(x, y, region, timeMs) {
      if (!this.active) return null;
      const now = timeMs == null ? performance.now() : timeMs;
      const dx = (x || 0) - this.lastX;
      const dy = (y || 0) - this.lastY;
      this.distance += Math.sqrt(dx * dx + dy * dy);
      this.lastX = x || 0;
      this.lastY = y || 0;
      this.lastAt = now;
      this.samples++;
      if (region) {
        this.regions[region] = (this.regions[region] || 0) + 1;
        if (this.regions[region] > (this.regions[this.primaryRegion] || 0)) this.primaryRegion = region;
      }
      return this.snapshot(now);
    }

    snapshot(timeMs) {
      const now = timeMs == null ? this.lastAt : timeMs;
      const duration = Math.max(1, now - this.startedAt);
      const avgSpeed = this.distance / duration;
      return {
        durationMs: duration,
        distancePx: this.distance,
        avgSpeedPxMs: avgSpeed,
        speed: avgSpeed < 0.18 ? 'slow' : (avgSpeed < 0.65 ? 'gentle' : 'fast'),
        length: this.distance < 35 ? 'short' : (this.distance < 130 ? 'medium' : 'long'),
        primaryRegion: this.primaryRegion,
        regions: Object.assign({}, this.regions),
        samples: this.samples
      };
    }

    end(timeMs) {
      if (!this.active) return null;
      const out = this.snapshot(timeMs == null ? performance.now() : timeMs);
      this.active = false;
      return out;
    }
  }

  class DirectInteractionSystem {
    constructor(options) {
      options = options || {};
      this.scene = options.scene || null;
      this.reducedMotion = !!options.reducedMotion;
      this.roomGroup = null;
      this.props = new Set();
      this.activeDrag = null;
      this.brushActive = false;
      this.brushVisual = null;
    }

    setReducedMotion(v) { this.reducedMotion = !!v; }

    registerRoom(group) {
      this.roomGroup = group || null;
      this.props.clear();
      if (group && group.traverse) {
        group.traverse(obj => {
          if (obj && obj.userData && obj.userData.directManipulation) this.registerProp(obj);
        });
      }
      return this.props.size;
    }

    registerProp(object, defaults) {
      if (!object) return null;
      object.userData = object.userData || {};
      const existing = object.userData.directManipulation || {};
      const meta = Object.assign({
        kind: 'prop',
        floorY: Math.max(0.08, object.position ? object.position.y : 0.08),
        state: 'resting',
        velocity: new THREE.Vector3(),
        restitution: 0.24,
        friction: 0.84
      }, existing, defaults || {});
      if (!meta.velocity || typeof meta.velocity.set !== 'function') meta.velocity = new THREE.Vector3();
      object.userData.directManipulation = meta;
      this.props.add(object);
      return object;
    }

    getManipulableObjects() { return Array.from(this.props); }

    resolveDirectObject(obj) {
      let cur = obj;
      let depth = 0;
      while (cur && depth < 8) {
        if (cur.userData && cur.userData.directManipulation) return cur;
        cur = cur.parent;
        depth++;
      }
      return null;
    }

    beginPropDrag(obj, point, timeMs) {
      const object = this.resolveDirectObject(obj);
      if (!object) return null;
      const meta = object.userData.directManipulation;
      meta.state = 'dragging';
      meta.velocity.set(0, 0, 0);
      const p = point ? point.clone() : object.getWorldPosition(new THREE.Vector3());
      this.activeDrag = {
        object,
        samples: [{ point: p.clone(), time: timeMs == null ? performance.now() : timeMs }]
      };
      this.haptic(8);
      return object;
    }

    dragPropTo(worldPoint, timeMs) {
      if (!this.activeDrag || !worldPoint) return false;
      const object = this.activeDrag.object;
      const meta = object.userData.directManipulation;
      const world = worldPoint.clone();
      world.y = Math.max(meta.floorY, world.y || meta.floorY);
      const local = object.parent && object.parent.worldToLocal ? object.parent.worldToLocal(world.clone()) : world;
      object.position.copy(local);
      const now = timeMs == null ? performance.now() : timeMs;
      this.activeDrag.samples.push({ point: world.clone(), time: now });
      if (this.activeDrag.samples.length > 4) this.activeDrag.samples.shift();
      return true;
    }

    releaseProp(timeMs) {
      if (!this.activeDrag) return null;
      const drag = this.activeDrag;
      this.activeDrag = null;
      const object = drag.object;
      const meta = object.userData.directManipulation;
      const now = timeMs == null ? performance.now() : timeMs;
      const samples = drag.samples;
      let velocity = new THREE.Vector3();
      if (samples.length >= 2) {
        const a = samples[Math.max(0, samples.length - 3)];
        const b = samples[samples.length - 1];
        const seconds = Math.max(0.016, (b.time - a.time) / 1000);
        velocity.copy(b.point).sub(a.point).multiplyScalar(1 / seconds);
        const speed = velocity.length();
        if (speed > 5) velocity.multiplyScalar(5 / speed);
      }
      if (velocity.length() < 0.15) {
        meta.state = 'resting';
        velocity.set(0, 0, 0);
      } else {
        meta.state = 'released';
        velocity.y = Math.max(0.8, velocity.y + 1.1);
      }
      meta.velocity.copy(velocity);
      const world = object.getWorldPosition ? object.getWorldPosition(new THREE.Vector3()) : object.position.clone();
      const predictedPoint = world.clone().addScaledVector(velocity, 0.45);
      predictedPoint.y = meta.floorY;
      this.haptic(12);
      return { object, kind: meta.kind, velocity: velocity.clone(), predictedPoint, releasedAt: now };
    }

    isDragging(object) { return !!(this.activeDrag && this.activeDrag.object === object); }

    update(dt) {
      dt = Math.max(0, Math.min(Number(dt) || 0, 0.05));
      this.props.forEach(object => {
        if (!object || !object.userData || !object.userData.directManipulation) return;
        const meta = object.userData.directManipulation;
        if (meta.state !== 'released') return;
        meta.velocity.y -= 6.2 * dt;

        const world = object.getWorldPosition ? object.getWorldPosition(new THREE.Vector3()) : object.position.clone();
        world.addScaledVector(meta.velocity, dt);
        if (world.y <= meta.floorY) {
          world.y = meta.floorY;
          if (Math.abs(meta.velocity.y) < 0.55) meta.velocity.y = 0;
          else meta.velocity.y = Math.abs(meta.velocity.y) * meta.restitution;
          meta.velocity.x *= Math.pow(meta.friction, dt * 60);
          meta.velocity.z *= Math.pow(meta.friction, dt * 60);
        }
        const local = object.parent && object.parent.worldToLocal ? object.parent.worldToLocal(world.clone()) : world;
        object.position.copy(local);

        if (meta.velocity.lengthSq() < 0.012) {
          meta.velocity.set(0, 0, 0);
          meta.state = 'resting';
        }
      });
    }

    activateBrush() {
      this.brushActive = true;
      if (!this.brushVisual && this.scene) this.brushVisual = this._buildBrush();
      if (this.brushVisual) this.brushVisual.visible = true;
      this.haptic(6);
      return this.brushVisual;
    }

    deactivateBrush() {
      this.brushActive = false;
      if (this.brushVisual) this.brushVisual.visible = false;
    }

    toggleBrush() {
      if (this.brushActive) this.deactivateBrush();
      else this.activateBrush();
      return this.brushActive;
    }

    updateBrushAt(worldPoint, normal) {
      if (!this.brushActive || !this.brushVisual || !worldPoint) return false;
      this.brushVisual.position.copy(worldPoint);
      const n = normal && typeof normal.clone === 'function' ? normal.clone() : new THREE.Vector3(0, 1, 0);
      if (n.lengthSq() < 0.001) n.set(0, 1, 0);
      this.brushVisual.lookAt(worldPoint.clone().add(n));
      return true;
    }

    _buildBrush() {
      const group = new THREE.Group();
      group.name = 'phase2_brush_tool';
      const handle = new THREE.Mesh(
        new THREE.BoxGeometry(0.07, 0.38, 0.07),
        new THREE.MeshToonMaterial({ color: 0x8b5a2b })
      );
      handle.position.y = 0.16;
      const pad = new THREE.Mesh(
        new THREE.BoxGeometry(0.25, 0.08, 0.15),
        new THREE.MeshToonMaterial({ color: 0xe7c79b })
      );
      pad.position.y = -0.06;
      group.add(handle, pad);
      group.visible = false;
      this.scene.add(group);
      return group;
    }

    haptic(pattern) {
      if (this.reducedMotion) return false;
      try {
        if (global.navigator && typeof global.navigator.vibrate === 'function') return !!global.navigator.vibrate(pattern);
      } catch (e) { /* optional enhancement */ }
      return false;
    }

    dispose() {
      if (this.brushVisual) {
        this.brushVisual.traverse(obj => {
          if (obj.geometry && obj.geometry.dispose) obj.geometry.dispose();
          if (obj.material && obj.material.dispose) obj.material.dispose();
        });
        if (this.brushVisual.parent) this.brushVisual.parent.remove(this.brushVisual);
      }
      this.brushVisual = null;
      this.props.clear();
      this.activeDrag = null;
    }
  }

  global.EeveeInteractionSystem = {
    TOUCH_PROFILES,
    objectPathName,
    classifyTactileRegion,
    StrokeTracker,
    DirectInteractionSystem
  };
})(window);
