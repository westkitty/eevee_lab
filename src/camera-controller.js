/* ==========================================================================
   CAMERA CONTROLLER — wraps OrbitControls instead of replacing it.
   Owns: auto-framing from live model bounds, focus-on-raycast, named
   presets, context FOV, short cinematic room-transitions, and simple
   per-room orbit bounds (a lightweight stand-in for wall collision).
   ========================================================================== */
(function (global) {
  'use strict';
  const THREE = global.THREE;

  const PRESETS = {
    fullbody: { name: 'Full Body', distanceFactor: 2.6, heightFactor: 0.55, fov: 46, polar: 1.15 },
    portrait: { name: 'Portrait', distanceFactor: 1.15, heightFactor: 0.85, fov: 34, polar: 1.35 },
    lowthreequarter: { name: 'Low Three-Quarter', distanceFactor: 1.9, heightFactor: 0.25, fov: 44, polar: 1.55 },
    overshoulder: { name: 'Habitat View', distanceFactor: 3.4, heightFactor: 0.7, fov: 54, polar: 1.05 },
    free: { name: 'Free Camera', distanceFactor: 2.2, heightFactor: 0.5, fov: 48, polar: 1.2 }
  };
  const PRESET_ORDER = ['fullbody', 'portrait', 'lowthreequarter', 'overshoulder', 'free'];

  function easeInOutCubic(t) {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  }

  class CameraController {
    constructor(camera, domElement, opts = {}) {
      this.camera = camera;
      this.domElement = domElement;
      this.reducedMotion = !!opts.reducedMotion;
      this.sensitivity = opts.sensitivity || 1.0;

      this.controls = new THREE.OrbitControls(camera, domElement);
      this.controls.enableDamping = true;
      this.controls.dampingFactor = 0.08;
      this.controls.target.set(0, 1.1, 0);
      this.controls.maxPolarAngle = Math.PI / 2 + 0.08;
      this.controls.minDistance = 0.9;
      this.controls.maxDistance = 14;
      this.controls.rotateSpeed = this.sensitivity;

      this.modelBox = new THREE.Box3();
      this.modelRadius = 1.0;
      this.modelHeight = 1.3;
      this.presetKey = 'fullbody';

      this._tween = null; // { fromPos, toPos, fromTarget, toTarget, fromFov, toFov, t, duration, onDone }
      this._roomBounds = null; // { minDistance, maxDistance, minPolar, maxPolar }

      this._raycaster = new THREE.Raycaster();
      this._pointer = new THREE.Vector2();
    }

    setReducedMotion(v) { this.reducedMotion = v; }
    setSensitivity(v) { this.sensitivity = v; this.controls.rotateSpeed = v; }

    /** Re-measure the active model and recompute safe zoom / framing limits. Call on species change. */
    setModelBounds(object3D) {
      this.modelBox.setFromObject(object3D);
      const size = new THREE.Vector3();
      this.modelBox.getSize(size);
      this.modelHeight = Math.max(size.y, 0.3);
      this.modelRadius = Math.max(size.x, size.z, 0.3) * 0.5;

      // Close inspection distance derived from the model, not one hardcoded value.
      // Small forms (Eevee) get a tighter minimum than tall forms (Sylveon's ribbons etc).
      const safeMin = Math.max(0.55, this.modelRadius * 1.35 + this.camera.near * 4);
      this.controls.minDistance = Math.min(1.5, Math.max(0.8, safeMin));
      this.controls.maxDistance = this._roomBounds ? this._roomBounds.maxDistance : 14;

      // Recompute the currently active preset so switching species never
      // leaves the camera clipping through, or microscopic against, the model.
      this.applyPreset(this.presetKey, { immediate: false });
    }

    setRoomBounds(bounds) {
      this._roomBounds = bounds || null;
      if (bounds) {
        this.controls.maxDistance = bounds.maxDistance;
        this.controls.minPolarAngle = bounds.minPolar != null ? bounds.minPolar : 0.15;
        this.controls.maxPolarAngle = bounds.maxPolar != null ? bounds.maxPolar : Math.PI / 2 + 0.08;
      } else {
        this.controls.maxDistance = 14;
        this.controls.minPolarAngle = 0;
        this.controls.maxPolarAngle = Math.PI / 2 + 0.08;
      }
    }

    /** Apply a named preset (Full Body / Portrait / Low 3/4 / Habitat / Free). */
    applyPreset(key, opts = {}) {
      const preset = PRESETS[key] || PRESETS.fullbody;
      this.presetKey = key;
      const dist = Math.max(this.controls.minDistance + 0.05, this.modelRadius * preset.distanceFactor + this.modelHeight * 0.4);
      const targetY = this.modelHeight * preset.heightFactor;
      const angle = this.controls.getAzimuthalAngle ? this.controls.getAzimuthalAngle() : 0.4;

      const toTarget = new THREE.Vector3(0, targetY, 0);
      const toPos = new THREE.Vector3(
        Math.sin(angle) * dist,
        targetY + dist * 0.28,
        Math.cos(angle) * dist
      );

      this._startTween(toPos, toTarget, preset.fov, opts.duration != null ? opts.duration : 0.6, opts.immediate);
      return preset;
    }

    cyclePreset() {
      const idx = PRESET_ORDER.indexOf(this.presetKey);
      const next = PRESET_ORDER[(idx + 1) % PRESET_ORDER.length];
      return this.applyPreset(next);
    }

    /** Double-click/tap focus: raycast against the given object, dolly toward the hit region. */
    focusOnPoint(ndcX, ndcY, focusObject) {
      this._pointer.set(ndcX, ndcY);
      this._raycaster.setFromCamera(this._pointer, this.camera);
      const hits = this._raycaster.intersectObject(focusObject, true);
      if (!hits.length) return false;

      const hit = hits[0].point;
      const localY = hit.y;
      const isHead = localY > this.modelHeight * 0.55;
      this.applyPreset(isHead ? 'portrait' : 'fullbody');
      // Nudge the orbit target toward the actual clicked point for a natural focus feel.
      const blended = this.controls.target.clone().lerp(hit, 0.5);
      this._startTween(null, blended, null, 0.5, false);
      return true;
    }

    resetCamera() {
      this.applyPreset('fullbody', { duration: 0.7 });
    }

    /** Short, non-stealing cinematic move used on room entry. Caps at ~1.4s. */
    cinematicEnter(fromPos, toPos, toTarget, fov) {
      const duration = this.reducedMotion ? 0.35 : 1.2;
      this.camera.position.copy(fromPos);
      this._startTween(toPos, toTarget, fov, duration, false);
    }

    _startTween(toPos, toTarget, toFov, duration, immediate) {
      if (this.reducedMotion) duration = Math.min(duration, 0.25);
      if (immediate || duration <= 0) {
        if (toPos) this.camera.position.copy(toPos);
        if (toTarget) this.controls.target.copy(toTarget);
        if (toFov) { this.camera.fov = toFov; this.camera.updateProjectionMatrix(); }
        this._tween = null;
        return;
      }
      this._tween = {
        fromPos: this.camera.position.clone(),
        toPos: toPos || this.camera.position.clone(),
        fromTarget: this.controls.target.clone(),
        toTarget: toTarget || this.controls.target.clone(),
        fromFov: this.camera.fov,
        toFov: toFov || this.camera.fov,
        t: 0,
        duration
      };
    }

    update(dt) {
      if (this._tween) {
        const tw = this._tween;
        tw.t += dt;
        const k = easeInOutCubic(Math.min(1, tw.t / tw.duration));
        this.camera.position.lerpVectors(tw.fromPos, tw.toPos, k);
        this.controls.target.lerpVectors(tw.fromTarget, tw.toTarget, k);
        if (tw.fromFov !== tw.toFov) {
          this.camera.fov = THREE.MathUtils.lerp(tw.fromFov, tw.toFov, k);
          this.camera.updateProjectionMatrix();
        }
        if (k >= 1) this._tween = null;
      }
      this.controls.update();
    }

    get isTransitioning() { return !!this._tween; }
  }

  global.CameraController = CameraController;
})(window);
