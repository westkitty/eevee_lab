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
    constructor({ scene, save, discoveryLog, resonance, cameraController, worldState, livingWorld, onRoomEnter, onDoorTravelRequested, onEvolutionRequested, onDiscovery, roomLabel }) {
      this.scene = scene;
      this.save = save;
      this.discoveryLog = discoveryLog;
      this.resonance = resonance;
      this.cameraController = cameraController;
      this.worldState = worldState || null;
      this.livingWorld = livingWorld || null;
      this.onRoomEnter = onRoomEnter || function () {};
      this.onDoorTravelRequested = onDoorTravelRequested || null;
      this.onEvolutionRequested = onEvolutionRequested || null;
      this.roomLabel = roomLabel || (id => id);

      this.current = null; // { def, built, id, atmosphereIndex }
      this.previousId = null;
    }

    _ctxFor(roomId) {
      return {
        goTo: (targetId) => this.goTo(targetId),
        requestDoor: (targetId, doorObject) => this.requestDoor(targetId, doorObject),
        requestEvolution: (targetSpecies, stoneObject) => this.requestEvolution(targetSpecies, stoneObject),
        roomLabel: this.roomLabel,
        onRoomProp: (roomId2, detail) => {
          this.resonance.bump(roomId2, 0.08);
          const found = this.discoveryLog.checkCombo(roomId2, this._activeForm, 'roomProp');
          this._recordRoomMemory(roomId2, detail);
          if (this.worldState) {
            const state = this.worldState.noteRoomEvent(roomId2, 'roomProp', detail || {});
            this._applyNarrativeState(roomId2, state);
          }
          this.onDiscoveryFeedback && this.onDiscoveryFeedback(found, detail);
        },
        onMemento: (roomId2, mementoId, label) => {
          const unlocked = this.discoveryLog.unlockMemento(mementoId, label);
          if (unlocked && this.worldState) {
            const state = this.worldState.noteRoomEvent(roomId2, 'memento', { id: mementoId, label });
            this._applyNarrativeState(roomId2, state);
          }
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

    getWalkableMeshes() {
      if (!this.current) return [];
      const meshes = [];
      this.current.built.group.traverse(obj => {
        if (obj && obj.isMesh && obj.userData && obj.userData.walkable) meshes.push(obj);
      });
      return meshes;
    }

    requestDoor(targetId, doorObject) {
      if (!targetId || !global.ROOM_DEFINITIONS[targetId]) return false;
      const request = {
        targetId,
        sourceRoomId: this.current ? this.current.id : null,
        doorObject: doorObject || null
      };
      if (this.onDoorTravelRequested) {
        const handled = this.onDoorTravelRequested(request);
        if (handled !== false) return true;
      }
      this.goTo(targetId, { entryFrom: request.sourceRoomId, viaDoor: true });
      return true;
    }

    requestEvolution(targetSpecies, stoneObject) {
      if (!targetSpecies || !stoneObject || !this.onEvolutionRequested) return false;
      return this.onEvolutionRequested({
        targetSpecies,
        stoneObject,
        roomId: this.current ? this.current.id : null
      }) !== false;
    }

    getAbilityTargets() {
      return this.current && Array.isArray(this.current.built.abilityTargets)
        ? this.current.built.abilityTargets.slice()
        : [];
    }

    applyAbilityMutation(mutation) {
      if (!this.current || !mutation || mutation.roomId !== this.current.id) return false;
      if (!this.current.built.applyAbilityMutation) return false;
      return this.current.built.applyAbilityMutation(mutation);
    }

    capturePlacement(object) {
      if (!this.current || !this.worldState || !object || !object.userData || !object.userData.placeableId) return null;
      return this.worldState.savePlacement(this.current.id, object.userData.placeableId, {
        position: object.position,
        rotationY: object.rotation ? object.rotation.y || 0 : 0
      });
    }

    goTo(roomId, opts = {}) {
      const def = global.ROOM_DEFINITIONS[roomId];
      if (!def) return null;
      if (this.current && this.current.id === roomId && !opts.force) return this.current;

      const sourceRoomId = opts.entryFrom || (this.current ? this.current.id : null);
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
      const narrativeState = this.worldState ? this.worldState.noteVisit(roomId) : null;
      this.current = { id: roomId, def, built, atmosphereIndex: Math.max(0, variantIdx), narrativeState };
      this._applyAtmosphere(this.current.atmosphereIndex);

      // Phase 7 atmosphere is room-bound and layered after the user's manual
      // atmosphere baseline so unlocked variants keep their lighting authority.
      if (this.livingWorld) {
        this.livingWorld.enterRoom(roomId, built);
        this.livingWorld.setManualLighting(this.current.atmosphereIndex > 0);
      }

      // Apply legacy symbolic memory plus Phase-5 semantic world state.
      const memory = this.save.get(`roomMemory.${roomId}`, {});
      this._applyRoomMemory(memory);
      this._applyPlacements(roomId);
      this._applyNarrativeState(roomId, narrativeState);
      this._applyAbilityMutations(roomId);
      this._applyCrossContamination(roomId);
      if (roomId === 'conservatory' && this.worldState && built.applyHistory) {
        built.applyHistory(this.worldState.getHistorySummary());
      }

      this.save.set('lastRoom', roomId);
      this.previousId = sourceRoomId;

      const entryFrom = opts.entryFrom || sourceRoomId;
      const entryPoint = opts.viaDoor && entryFrom && built.entryPoints && built.entryPoints[entryFrom]
        ? built.entryPoints[entryFrom].clone()
        : (built.spawnPoint || new THREE.Vector3(0, 0, 1.2)).clone();
      const continuePoint = opts.viaDoor && entryFrom && built.continuationPoints && built.continuationPoints[entryFrom]
        ? built.continuationPoints[entryFrom].clone()
        : null;

      if (this.cameraController) {
        this.cameraController.setRoomBounds(built.cameraBounds);
        const camTarget = new THREE.Vector3(entryPoint.x * 0.15, 0.9, entryPoint.z * 0.15);
        const camPos = prevCamPos || new THREE.Vector3(entryPoint.x, 2.4, entryPoint.z + 5);
        const toPos = new THREE.Vector3(entryPoint.x + 2.2, 1.9, entryPoint.z + 3.4);
        this.cameraController.cinematicEnter(camPos, toPos, camTarget, 46);
      }

      this.onRoomEnter(roomId, built, {
        fromRoomId: entryFrom,
        entryPoint,
        continuePoint,
        viaDoor: !!opts.viaDoor
      });
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
      if (this.livingWorld) this.livingWorld.setManualLighting(idx > 0);
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

    _applyPlacements(roomId) {
      if (!this.current || !this.worldState) return;
      const placements = this.worldState.listPlacements(roomId);
      this.current.built.group.traverse(obj => {
        const id = obj && obj.userData ? obj.userData.placeableId : null;
        const saved = id ? placements[id] : null;
        if (!saved || !obj.position) return;
        obj.position.set(Number(saved.x) || 0, Number(saved.y) || 0, Number(saved.z) || 0);
        if (obj.rotation) obj.rotation.y = Number(saved.ry) || 0;
        if (obj.userData.directManipulation) obj.userData.directManipulation.state = 'resting';
      });
    }

    _applyNarrativeState(roomId, state) {
      if (!this.current || this.current.id !== roomId || !state) return;
      this.current.narrativeState = state;
      if (this.current.built.applyNarrativeStage) this.current.built.applyNarrativeStage(state);
      if (roomId === 'conservatory' && this.worldState && this.current.built.applyHistory) {
        this.current.built.applyHistory(this.worldState.getHistorySummary());
      }
    }

    _applyAbilityMutations(roomId) {
      if (!this.current || !this.worldState || !this.current.built.applyAbilityMutation) return;
      this.worldState.listAbilityMutations(roomId).forEach(mutation => {
        this.current.built.applyAbilityMutation(mutation);
      });
    }

    _applyCrossContamination(roomId) {
      if (!this.current) return;
      if (this.worldState) {
        const traces = this.worldState.listTraces(roomId);
        traces.forEach((trace, index) => this._placeCrossTrace(trace, index));
        return;
      }

      // Legacy fallback for an older runtime loading this manager without HabitatWorldState.
      const seeded = this.save.get(`crossContamination.${roomId}`, []);
      if (!Array.isArray(seeded)) return;
      seeded.forEach((markerId, index) => {
        if (typeof markerId !== 'string') return;
        this._placeCrossTrace({
          id: markerId,
          originRoom: 'legacy',
          originEvent: 'legacy',
          objectType: ['ribbon', 'shell', 'tag'][global.ROOM_ORDER.indexOf(roomId) % 3],
          destinationRoom: roomId
        }, index);
      });
    }

    _placeCrossTrace(traceInfo, index) {
      if (!global.RoomKit || !traceInfo || !this.current) return;
      const trace = global.RoomKit.memento(traceInfo.objectType || 'tag', 0xffffff);
      trace.name = traceInfo.id || ('trace_' + index);
      trace.userData.traceProvenance = {
        originRoom: traceInfo.originRoom || 'unknown',
        originEvent: traceInfo.originEvent || 'unknown',
        destinationRoom: traceInfo.destinationRoom || this.current.id,
        objectType: traceInfo.objectType || 'tag'
      };
      trace.scale.setScalar(0.62 + Math.min(0.16, index * 0.03));
      const angle = -0.65 + index * 0.55;
      trace.position.set(Math.cos(angle) * 1.8, 0.08, 2.15 + Math.sin(angle) * 0.55);
      this.current.built.group.add(trace);
    }

    update(dt, elapsed) {
      if (this.current && this.current.built.update) this.current.built.update(dt, elapsed);
      if (this.livingWorld) this.livingWorld.update(dt, elapsed);
    }

    _disposeCurrent() {
      if (!this.current) return;
      const { built } = this.current;
      if (this.livingWorld) this.livingWorld.leaveRoom(built);
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
