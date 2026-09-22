/* ==========================================================================
   ROOM MANAGER — lifecycle owner for the Habitat House. Exactly one heavy
   room lives in the scene at a time (Part III / Part X). Handles enter/
   exit/update/dispose, cross-room memory (Part XV), and light cross-
   contamination traces (Part XVI).
   ========================================================================== */
(function (global) {
  'use strict';
  const THREE = global.THREE;

  class RoomManager {
    constructor({ scene, save, discoveryLog, resonance, cameraController, onRoomEnter, onDiscovery, roomLabel }) {
      this.scene = scene;
      this.save = save;
      this.discoveryLog = discoveryLog;
      this.resonance = resonance;
      this.cameraController = cameraController;
      this.onRoomEnter = onRoomEnter || function () {};
      this.roomLabel = roomLabel || (id => id);

      this.current = null; // { def, built, id, atmosphereIndex }
      this.previousId = null;
    }

    _ctxFor(roomId) {
      return {
        goTo: (targetId) => this.goTo(targetId),
        roomLabel: this.roomLabel,
        onRoomProp: (roomId2, detail) => {
          this.resonance.bump(roomId2, 0.08);
          const found = this.discoveryLog.checkCombo(roomId2, this._activeForm, 'roomProp');
          this._recordRoomMemory(roomId2, detail);
          this.onDiscoveryFeedback && this.onDiscoveryFeedback(found, detail);
        },
        onMemento: (roomId2, mementoId, label) => {
          const unlocked = this.discoveryLog.unlockMemento(mementoId, label);
          if (unlocked) this.onDiscoveryFeedback && this.onDiscoveryFeedback({ label }, null);
        }
      };
    }

    setActiveForm(form) { this._activeForm = form; }

    _recordRoomMemory(roomId, detail) {
      const mem = this.save.get(`roomMemory.${roomId}`, {});
      Object.assign(mem, detail);
      this.save.set(`roomMemory.${roomId}`, mem);
    }

    listRooms() { return global.ROOM_ORDER.map(id => global.ROOM_DEFINITIONS[id]); }

    getInteractables() { return this.current ? this.current.built.interactables : []; }
    getInteractableMeshes() {
      if (!this.current) return [];
      return this.current.built.interactables.map(i => i.object3D);
    }

    goTo(roomId, opts = {}) {
      const def = global.ROOM_DEFINITIONS[roomId];
      if (!def) return null;
      if (this.current && this.current.id === roomId && !opts.force) return this.current;

      const prevCamPos = this.cameraController ? this.cameraController.camera.position.clone() : null;

      this._disposeCurrent();

      const built = def.build(this._ctxFor(roomId));
      built.group.name = 'room_' + roomId;
      this.scene.add(built.group);
      built.lights.forEach(l => this.scene.add(l));

      // Apply saved atmosphere selection if unlocked, else default variant 0.
      const unlocked = this.save.get(`atmosphereUnlocked.${roomId}`, []);
      const selected = this.save.get(`atmosphereSelected.${roomId}`, built.atmosphereVariants[0].id);
      const variantIdx = built.atmosphereVariants.findIndex(v => v.id === selected && (unlocked.includes(v.id) || v === built.atmosphereVariants[0]));
      this.current = { id: roomId, def, built, atmosphereIndex: Math.max(0, variantIdx) };
      this._applyAtmosphere(this.current.atmosphereIndex);

      // Apply habitat memory: reposition/restore small symbolic leftovers.
      const memory = this.save.get(`roomMemory.${roomId}`, {});
      this._applyRoomMemory(memory);

      // Cross-contamination: small markers seeded by discoveries made elsewhere.
      this._applyCrossContamination(roomId);

      this.save.set('lastRoom', roomId);
      this.previousId = this.current.id;

      if (this.cameraController) {
        this.cameraController.setRoomBounds(built.cameraBounds);
        const spawn = built.spawnPoint || new THREE.Vector3(0, 0, 1.2);
        const camTarget = new THREE.Vector3(0, 0.9, 0);
        const camPos = prevCamPos || new THREE.Vector3(spawn.x, 2.4, spawn.z + 5);
        const toPos = new THREE.Vector3(spawn.x + 2.2, 1.9, spawn.z + 3.4);
        this.cameraController.cinematicEnter(camPos, toPos, camTarget, 46);
      }

      this.onRoomEnter(roomId, built);
      return this.current;
    }

    _applyAtmosphere(idx) {
      if (!this.current) return;
      const variant = this.current.built.atmosphereVariants[idx] || this.current.built.atmosphereVariants[0];
      const lights = this.current.built.lights;
      // lights[0] = hemi, lights[1] = key by lightingProfile() convention.
      if (variant.hemiIntensity != null && lights[0]) lights[0].intensity = variant.hemiIntensity;
      if (variant.keyColor != null && lights[1]) lights[1].color.set(variant.keyColor);
      if (variant.keyIntensity != null && lights[1]) lights[1].intensity = variant.keyIntensity;
      this.current.atmosphereIndex = idx;
    }

    setAtmosphere(variantId) {
      if (!this.current) return;
      const idx = this.current.built.atmosphereVariants.findIndex(v => v.id === variantId);
      if (idx < 0) return false;
      const unlocked = this.save.get(`atmosphereUnlocked.${this.current.id}`, []);
      if (idx > 0 && !unlocked.includes(variantId)) return false;
      this._applyAtmosphere(idx);
      this.save.set(`atmosphereSelected.${this.current.id}`, variantId);
      return true;
    }

    unlockAtmosphereVariant(roomId, variantId) {
      const unlocked = this.save.get(`atmosphereUnlocked.${roomId}`, []);
      if (!unlocked.includes(variantId)) {
        unlocked.push(variantId);
        this.save.set(`atmosphereUnlocked.${roomId}`, unlocked);
      }
    }

    _applyRoomMemory(memory) {
      // Symbolic-only: a couple of visual toggles driven by bounded flags, not scene serialization.
      if (!this.current) return;
      const group = this.current.built.group;
      if (memory.charged) {
        group.traverse(c => { if (c.material && c.material.emissive) c.material.emissiveIntensity = Math.max(c.material.emissiveIntensity, 0.3); });
      }
    }

    _applyCrossContamination(roomId) {
      const totalDiscoveries = this.discoveryLog.count();
      if (totalDiscoveries < 2) return;
      const seeded = this.save.get(`crossContamination.${roomId}`, []);
      const candidateKinds = ['ribbon', 'shell', 'tag', 'frame'];
      const markerId = 'trace_' + roomId;
      if (seeded.includes(markerId)) {
        this._placeCrossTrace(roomId, markerId);
        return;
      }
      // Deterministic: once total discoveries clears a room-specific threshold, seed one trace.
      const threshold = 2 + (global.ROOM_ORDER.indexOf(roomId) % 3);
      if (totalDiscoveries >= threshold) {
        seeded.push(markerId);
        this.save.set(`crossContamination.${roomId}`, seeded);
        this._placeCrossTrace(roomId, markerId);
      }
    }

    _placeCrossTrace(roomId, markerId) {
      if (!global.RoomKit) return;
      const kind = ['ribbon', 'shell', 'tag'][global.ROOM_ORDER.indexOf(roomId) % 3];
      const trace = global.RoomKit.memento(kind, 0xffffff);
      trace.name = markerId;
      trace.scale.setScalar(0.7);
      trace.position.set(0.3, 0.08, 2.4);
      this.current.built.group.add(trace);
    }

    update(dt, elapsed) {
      if (this.current && this.current.built.update) this.current.built.update(dt, elapsed);
    }

    _disposeCurrent() {
      if (!this.current) return;
      const { built } = this.current;
      built.particleFields.forEach(pf => pf.dispose());
      built.lights.forEach(l => this.scene.remove(l));
      built.group.traverse(c => { if (c.isMesh) c.geometry.dispose(); });
      this.scene.remove(built.group);
      if (built.disposeExtra) built.disposeExtra();
      this.current = null;
    }
  }

  global.RoomManager = RoomManager;
})(window);
