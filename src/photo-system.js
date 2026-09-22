/* ==========================================================================
   PHOTO SYSTEM — cinematic photo mode capture + an original deterministic
   "Moment Score". Never blocks the simple screenshot-tool use case; scoring
   is an optional layer on top of the same PNG capture.
   ========================================================================== */
(function (global) {
  'use strict';
  const THREE = global.THREE;

  class PhotoSystem {
    constructor(save) {
      this.save = save;
      this._box = new THREE.Box3();
      this._center = new THREE.Vector3();
      this._ndc = new THREE.Vector3();
      this._fwd = new THREE.Vector3();
      this._camFwd = new THREE.Vector3();
    }

    /**
     * Deterministic composition score (0-100) from real scene measurements —
     * no randomness. ctx: { activeBehavior, roomDiscoveredThisVisit, distinctInteraction }
     */
    score(subjectObject, camera, ctx = {}) {
      this._box.setFromObject(subjectObject);
      if (this._box.isEmpty()) return { total: 0, breakdown: {} };
      this._box.getCenter(this._center);
      this._ndc.copy(this._center).project(camera);

      const onScreen = Math.abs(this._ndc.x) <= 1 && Math.abs(this._ndc.y) <= 1 && this._ndc.z < 1;
      const size = new THREE.Vector3();
      this._box.getSize(size);
      const distance = camera.position.distanceTo(this._center);

      // Subject size: how much of the vertical frame the model's height occupies at this distance.
      const angularHeight = 2 * Math.atan((size.y * 0.5) / Math.max(distance, 0.01));
      const fovRad = THREE.MathUtils.degToRad(camera.fov);
      const sizeScore = THREE.MathUtils.clamp((angularHeight / fovRad) * 130, 0, 30);

      // Centrality: reward centered OR a clearly intentional rule-of-thirds offset, not just "closest to 0".
      const r = Math.hypot(this._ndc.x, this._ndc.y);
      const thirdsDist = Math.min(Math.abs(r - 0.0), Math.abs(r - 0.55));
      const centerScore = onScreen ? THREE.MathUtils.clamp(20 - thirdsDist * 22, 0, 20) : 0;

      // Facing: does the subject's forward vector point roughly back at the camera?
      subjectObject.getWorldDirection(this._fwd);
      this._camFwd.subVectors(camera.position, this._center).normalize();
      const facingDot = THREE.MathUtils.clamp(this._fwd.dot(this._camFwd), -1, 1);
      const facingScore = THREE.MathUtils.clamp((facingDot + 1) * 0.5, 0, 1) * 20;

      const behaviorScore = ctx.activeBehavior ? 15 : 0;
      const discoveryScore = ctx.roomDiscoveredThisVisit ? 10 : 0;
      const distanceScore = THREE.MathUtils.clamp(10 - Math.abs(distance - 2.0) * 3, 0, 5);

      const breakdown = {
        size: Math.round(sizeScore),
        centrality: Math.round(centerScore),
        facing: Math.round(facingScore),
        behavior: behaviorScore,
        discovery: discoveryScore,
        distance: Math.round(distanceScore)
      };
      const total = Math.round(
        Object.values(breakdown).reduce((a, b) => a + b, 0)
      );
      return { total: Math.min(100, total), breakdown, onScreen };
    }

    tierFor(total) {
      if (total >= 85) return 'Exceptional';
      if (total >= 65) return 'Great';
      if (total >= 40) return 'Good';
      return 'Casual';
    }

    /** Records bounded metadata only — never stores the image itself. */
    recordPhoto({ form, room, score }) {
      this.save.addPhoto({
        id: `${Date.now()}_${form}`,
        form, room,
        score: score.total,
        tier: this.tierFor(score.total),
        timestamp: Date.now()
      });
    }
  }

  global.PhotoSystem = PhotoSystem;
})(window);
