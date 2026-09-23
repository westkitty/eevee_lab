/* ==========================================================================
   EXPANSION KIT — declarative region builder for Habitat House expansions.

   An expansion is a *region*: one hub room (its own Conservatory-like
   crossroads) plus nine habitat rooms, one per Eeveelution, each with its
   own environment, native setpiece, memento, weather palette, ambient life,
   narrative stages and atmosphere variants. Regions plug into the existing
   RoomManager / HabitatWorldState / LivingWorld systems without touching the
   nine original habitats; everything here is additive and procedural.

   Load order: rooms.js -> expansion-kit.js -> expansions/*.js -> room-manager.js
   ========================================================================== */
(function (global) {
  'use strict';
  const THREE = global.THREE;
  const FX = global.RenderEffects;
  const RoomKit = global.RoomKit;
  const ROOMS = global.ROOM_DEFINITIONS;

  const SPECIES = ['eevee', 'vaporeon', 'jolteon', 'flareon', 'espeon', 'umbreon', 'leafeon', 'glaceon', 'sylveon'];
  const SPECIES_COLOR = {
    eevee: 0xe0b47a, vaporeon: 0x49b2e8, jolteon: 0xfee033, flareon: 0xf76835, espeon: 0xc68fed,
    umbreon: 0x8899ff, leafeon: 0x76b852, glaceon: 0x8be5f5, sylveon: 0xffaec9
  };
  const SPECIES_ABILITY = {
    vaporeon: 'water', jolteon: 'power', flareon: 'heat', espeon: 'telekinesis',
    umbreon: 'shadow', leafeon: 'growth', glaceon: 'freeze', sylveon: 'bind'
  };
  const SPECIES_LIFE = {
    eevee: 'motes', vaporeon: 'droplets', jolteon: 'sparks', flareon: 'embers', espeon: 'wisps',
    umbreon: 'fireflies', leafeon: 'butterflies', glaceon: 'crystals', sylveon: 'ribbons'
  };
  const SPECIES_MEMENTO_KIND = {
    eevee: 'notebook', vaporeon: 'shell', jolteon: 'tag', flareon: 'frame', espeon: 'tag',
    umbreon: 'tag', leafeon: 'notebook', glaceon: 'tag', sylveon: 'ribbon'
  };

  // Registry consumed by living-world (weather/life) and habitat-state (narrative).
  const REGISTRY = global.EXPANSION_REGISTRY || { weather: {}, life: {}, narrative: {}, expansions: [], roomsByExpansion: {} };
  global.EXPANSION_REGISTRY = REGISTRY;

  /* --------------------------------------------------------------------
     Primitive library shared by every region. Small, cheap, toon-shaded.
     -------------------------------------------------------------------- */
  /* FX.Materials.emissiveAccent is cached by colour. Expansion rooms animate
     emissiveIntensity per-mesh constantly, so every emissive mesh a region
     builds gets a private clone that is tracked and disposed with the room.
     The active room's tracker is swapped in by buildHabitatRoom/buildHub. */
  let activeOwned = null;
  function emissive(color, intensity) {
    const mat = FX.Materials.emissiveAccent(color, intensity).clone();
    mat.emissiveIntensity = intensity;
    if (activeOwned) activeOwned.push(mat);
    return mat;
  }

  const P = {
    shadowed(mesh) { mesh.castShadow = true; mesh.receiveShadow = true; return mesh; },
    rock(color = 0x8a8577, r = 0.4) {
      const m = new THREE.Mesh(new THREE.DodecahedronGeometry(r, 0), FX.Materials.stone(color));
      const k = (r * 1000 + (color & 0xfff)) % 7;
      m.rotation.set(k * 0.08, k * 0.45, (7 - k) * 0.07);
      m.scale.set(1, 0.6 + k * 0.07, 1);
      return P.shadowed(m);
    },
    crystal(color = 0x9be7ff, h = 0.8, r = 0.16) {
      const m = new THREE.Mesh(new THREE.ConeGeometry(r, h, 6), emissive(color, 0.55));
      m.position.y = h / 2;
      return P.shadowed(m);
    },
    tree(trunk = 0x6b4a2b, leaf = 0x4f9a3f, h = 2.2, style = 'round') {
      const g = new THREE.Group();
      const t = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.14, h * 0.55, 7), FX.Materials.wood(trunk));
      t.position.y = h * 0.275;
      g.add(P.shadowed(t));
      if (style === 'pine') {
        for (let i = 0; i < 3; i++) {
          const c = new THREE.Mesh(new THREE.ConeGeometry(0.55 - i * 0.13, h * 0.42, 8), FX.Materials.foliage(leaf));
          c.position.y = h * 0.5 + i * h * 0.2;
          g.add(P.shadowed(c));
        }
      } else if (style === 'palm') {
        t.geometry = new THREE.CylinderGeometry(0.07, 0.11, h, 7);
        t.position.y = h / 2; t.rotation.z = 0.12;
        for (let i = 0; i < 6; i++) {
          const f = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.03, 0.22), FX.Materials.foliage(leaf));
          f.position.set(0.12, h, 0);
          f.rotation.y = (i / 6) * Math.PI * 2;
          f.rotation.z = -0.5;
          f.translateX(0.5);
          g.add(P.shadowed(f));
        }
      } else {
        const c = new THREE.Mesh(new THREE.SphereGeometry(h * 0.32, 9, 8), FX.Materials.foliage(leaf));
        c.position.y = h * 0.72;
        g.add(P.shadowed(c));
      }
      return g;
    },
    pillar(color = 0xcac1b3, h = 2.4, r = 0.18, broken = false) {
      const m = new THREE.Mesh(new THREE.CylinderGeometry(r, r * 1.15, h, 10), FX.Materials.stone(color));
      m.position.y = h / 2;
      if (broken) m.rotation.z = 0.08;
      return P.shadowed(m);
    },
    ring(radius = 1, tube = 0.04, color = 0xffffff, intensity = 0.5) {
      const m = new THREE.Mesh(new THREE.TorusGeometry(radius, tube, 8, 40), emissive(color, intensity));
      m.rotation.x = Math.PI / 2;
      return m;
    },
    orb(color = 0xffffff, r = 0.2, intensity = 1) {
      const m = new THREE.Mesh(new THREE.SphereGeometry(r, 16, 14), emissive(color, intensity));
      m.castShadow = true;
      return m;
    },
    lantern(color = 0xffc66b) {
      const g = new THREE.Group();
      const post = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.04, 1.4, 6), FX.Materials.wood(0x3b2b1c));
      post.position.y = 0.7;
      const cage = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.26, 0.2), FX.Materials.metal(0x3a3f47));
      cage.position.y = 1.5;
      const glow = new THREE.Mesh(new THREE.SphereGeometry(0.07, 8, 8), emissive(color, 1.4));
      glow.position.y = 1.5;
      const light = new THREE.PointLight(color, 0.55, 3.2);
      light.position.y = 1.5;
      g.add(P.shadowed(post), P.shadowed(cage), glow, light);
      g.userData.glow = glow;
      return g;
    },
    banner(color = 0xff9bc7, h = 1.6) {
      const g = new THREE.Group();
      const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, h, 6), FX.Materials.wood(0x5a4630));
      pole.position.y = h / 2;
      const cloth = new THREE.Mesh(new THREE.PlaneGeometry(0.42, 0.7), new THREE.MeshToonMaterial({ color, side: THREE.DoubleSide }));
      cloth.position.set(0.22, h - 0.4, 0);
      g.add(P.shadowed(pole), cloth);
      g.userData.cloth = cloth;
      return g;
    },
    waterDisk(r = 2.4, color = 0x3fa7d6, y = 0.02) {
      const mat = FX.createWaterMaterial(color);
      const m = new THREE.Mesh(new THREE.CircleGeometry(r, 40), mat);
      m.rotation.x = -Math.PI / 2; m.position.y = y;
      m.userData.ownedMaterial = mat;
      return m;
    },
    slab(w = 1, h = 0.2, d = 1, color = 0xa8a095) {
      return P.shadowed(new THREE.Mesh(new THREE.BoxGeometry(w, h, d), FX.Materials.stone(color)));
    },
    arch(color = 0xcac1b3, w = 1.6, h = 2.2) {
      const g = new THREE.Group();
      const mat = FX.Materials.stone(color);
      const l = new THREE.Mesh(new THREE.BoxGeometry(0.22, h, 0.22), mat); l.position.set(-w / 2, h / 2, 0);
      const r = l.clone(); r.position.x = w / 2;
      const top = new THREE.Mesh(new THREE.TorusGeometry(w / 2, 0.11, 8, 20, Math.PI), mat); top.position.y = h;
      g.add(P.shadowed(l), P.shadowed(r), P.shadowed(top));
      return g;
    },
    /** Backdrop ring of silhouettes: mountains, skyline, cliffs, treeline. */
    backdrop(count, radius, factory) {
      const g = new THREE.Group();
      g.name = 'backdrop';
      for (let i = 0; i < count; i++) {
        const a = (i / count) * Math.PI * 2 + 0.17;
        const obj = factory(i, a);
        if (!obj) continue;
        obj.position.set(Math.cos(a) * radius, obj.position.y, Math.sin(a) * radius);
        obj.lookAt(0, obj.position.y, 0);
        g.add(obj);
      }
      return g;
    },
    mountain(color = 0x6d7480, h = 4, r = 2) {
      const m = new THREE.Mesh(new THREE.ConeGeometry(r, h, 5), FX.Materials.stone(color));
      m.position.y = h / 2 - 0.3;
      return m;
    },
    tower(color = 0x2a2f3a, h = 4, w = 0.9, windowColor = 0x59f0ff) {
      const g = new THREE.Group();
      const b = new THREE.Mesh(new THREE.BoxGeometry(w, h, w), FX.Materials.stone(color));
      b.position.y = h / 2 - 0.3;
      g.add(b);
      const wmat = FX.Materials.emissiveAccent(windowColor, 0.9);
      let seed = (h * 97 + w * 31 + (windowColor & 0xff)) | 0;
      const rnd = () => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return seed / 0x7fffffff; };
      for (let y = 0.4; y < h - 0.4; y += 0.55) {
        if (rnd() < 0.55) {
          const win = new THREE.Mesh(new THREE.PlaneGeometry(0.18, 0.22), wmat);
          win.position.set((rnd() - 0.5) * (w * 0.6), y, w / 2 + 0.01);
          g.add(win);
        }
      }
      return g;
    },
    scatter(parent, count, radiusMin, radiusMax, factory) {
      for (let i = 0; i < count; i++) {
        const a = (i / count) * Math.PI * 2 + (i % 2) * 0.3;
        const r = radiusMin + ((i * 7919) % 100) / 100 * (radiusMax - radiusMin);
        const obj = factory(i);
        if (!obj) continue;
        obj.position.x += Math.cos(a) * r;
        obj.position.z += Math.sin(a) * r;
        parent.add(obj);
      }
    }
  };

  /* --------------------------------------------------------------------
     Region state: one bounded save record per expedition
     (`expeditions.<id>`) holding small flags + memento ids. Rooms write
     flags when their setpiece fires; sibling rooms and the hub read them
     on build. No scene graph is ever serialized. Falls back to an
     in-memory store if no SaveManager is available (tests).
     -------------------------------------------------------------------- */
  const memoryStore = {};
  function saveApi() {
    const s = global.save || (global.habitatSave) || null;
    if (s && typeof s.get === 'function' && typeof s.set === 'function') return s;
    return {
      get(path, fb) { return path in memoryStore ? memoryStore[path] : fb; },
      set(path, v) { memoryStore[path] = v; return v; }
    };
  }
  function regionRecord(id) {
    const raw = saveApi().get('expeditions.' + id, null);
    const rec = raw && typeof raw === 'object' ? raw : {};
    return {
      flags: rec.flags && typeof rec.flags === 'object' ? Object.assign({}, rec.flags) : {},
      mementos: Array.isArray(rec.mementos) ? rec.mementos.slice(0, 12) : [],
      setpieces: rec.setpieces && typeof rec.setpieces === 'object' ? Object.assign({}, rec.setpieces) : {}
    };
  }
  function writeRegion(id, rec) { saveApi().set('expeditions.' + id, rec); return rec; }
  function regionApi(expansionId, roomId) {
    return {
      flag(name, value) { const r = regionRecord(expansionId); r.flags[name] = value === undefined ? true : value; if (Object.keys(r.flags).length > 24) delete r.flags[Object.keys(r.flags)[0]]; writeRegion(expansionId, r); return r.flags[name]; },
      get(name, fallback) { const v = regionRecord(expansionId).flags[name]; return v === undefined ? fallback : v; },
      noteSetpiece() { const r = regionRecord(expansionId); r.setpieces[roomId] = Math.min(99, (Number(r.setpieces[roomId]) || 0) + 1); writeRegion(expansionId, r); return r.setpieces[roomId]; },
      setpieceUses(rid) { return Number(regionRecord(expansionId).setpieces[rid || roomId]) || 0; },
      noteMemento(id) { const r = regionRecord(expansionId); if (!r.mementos.includes(id)) r.mementos.push(id); writeRegion(expansionId, r); return r.mementos.length; },
      mementos() { return regionRecord(expansionId).mementos.slice(); },
      record() { return regionRecord(expansionId); }
    };
  }

  function circleSpots(radius, count, y = 0, offset = 0) {
    const out = [];
    for (let i = 0; i < count; i++) {
      const a = (i / count) * Math.PI * 2 + offset;
      out.push(new THREE.Vector3(Math.cos(a) * radius, y, Math.sin(a) * radius));
    }
    return out;
  }

  /* --------------------------------------------------------------------
     Room assembly: turns a compact room spec into a full RoomManager build.
     -------------------------------------------------------------------- */
  function buildHabitatRoom(expansion, species, spec, ctx, roomId) {
    const group = new THREE.Group();
    const floorRadius = spec.floor && spec.floor.radius ? spec.floor.radius : 4.4;
    const floorColor = spec.floor && spec.floor.color != null ? spec.floor.color : 0xc9c2b4;
    group.add(RoomKit.floor(floorRadius, floorColor, spec.floor || {}));

    const interactables = [];
    const particleFields = [];
    const ownedMaterials = [];
    const updaters = [];
    const stageAppliers = [];
    const accent = SPECIES_COLOR[species];

    const region = regionApi(expansion.id, roomId);
    activeOwned = ownedMaterials;
    const roomFX = Object.assign({}, FX, { Materials: Object.assign(Object.create(FX.Materials), { emissiveAccent: (c, i) => emissive(c, i == null ? 1.2 : i) }) });
    const api = {
      THREE, FX: roomFX, P, RoomKit, accent, roomId, species, expansion, region,
      add(obj) { group.add(obj); return obj; },
      own(material) { if (material) ownedMaterials.push(material); return material; },
      particles(field) { particleFields.push(field); group.add(field.points); return field; },
      onUpdate(fn) { updaters.push(fn); },
      onStage(fn) { stageAppliers.push(fn); },
      /** The room's native setpiece: also becomes the species' ability target. */
      prop(object3D, id, label, detail, onActivate) {
        group.add(object3D);
        const entry = RoomKit.makeInteractable(object3D, id, 'prop', label, () => {
          if (onActivate) onActivate();
          region.noteSetpiece();
          if (spec.consequence) region.flag(spec.consequence, true);
          ctx.onRoomProp(roomId, detail || { used: true });
        });
        interactables.push(entry);
        return object3D;
      },
      /** A secondary clickable thing that also tells a story beat. */
      curio(object3D, id, label, discoveryId, discoveryLabel, onActivate) {
        group.add(object3D);
        const entry = RoomKit.makeInteractable(object3D, id, 'curio', label, () => {
          if (onActivate) onActivate();
          if (discoveryId && ctx.unlockBehavior) ctx.unlockBehavior(discoveryId, discoveryLabel || label);
        });
        interactables.push(entry);
        return object3D;
      },
      memento(kind, color, position, text) {
        const m = RoomKit.memento(kind || SPECIES_MEMENTO_KIND[species], color != null ? color : accent);
        m.position.copy(position);
        group.add(m);
        const id = 'memento_' + roomId;
        interactables.push(RoomKit.makeInteractable(m, id, 'memento', spec.mementoLabel || 'a memento', () => {
          region.noteMemento(id);
          ctx.onMemento(roomId, id, text);
        }));
        return m;
      },
      toy(kind, color, position) {
        const t = kind === 'plush' ? RoomKit.toyPlush(color) : kind === 'brush' ? RoomKit.brush() : RoomKit.toyBall(color);
        t.userData.placeableId = roomId + '_' + kind;
        t.position.copy(position);
        group.add(t);
        return t;
      },
      lantern(color, position) { const l = P.lantern(color); l.position.copy(position); group.add(l); return l; }
    };

    const result = spec.build(api) || {};
    activeOwned = null;

    const lights = RoomKit.lightingProfile(Object.assign({
      hemiSky: 0xf3ead8, hemiGround: 0x54607a, hemiIntensity: 0.5,
      keyColor: 0xfff6e2, keyIntensity: 0.8, keyPos: [4, 8, 4], shadow: true
    }, spec.lights || {}));

    const spawn = result.spawnPoint || new THREE.Vector3(0, 0, 1.1);
    return {
      group, lights, particleFields, interactables,
      memento: result.memento || null,
      spawnPoint: spawn,
      cameraBounds: Object.assign({ minDistance: 0.8, maxDistance: Math.max(6, floorRadius + 2.4), minPolar: 0.2, maxPolar: Math.PI / 2 }, spec.cameraBounds || {}),
      atmosphereVariants: spec.variants || [{ id: 'default', label: 'Default' }, { id: 'alt', label: 'Alternate', hemiIntensity: 0.32 }],
      topology: result.topology || null,
      applyNarrativeStage(state) {
        const stage = state ? state.stageIndex || 0 : 0;
        stageAppliers.forEach(fn => fn(stage, state));
      },
      update(dt, elapsed) {
        particleFields.forEach(pf => pf.update(dt, elapsed));
        updaters.forEach(fn => fn(dt, elapsed));
      },
      disposeExtra() {
        ownedMaterials.forEach(m => { if (m && m.dispose) m.dispose(); });
        group.traverse(o => { if (o.userData && o.userData.ownedMaterial) o.userData.ownedMaterial.dispose(); });
        if (result.dispose) result.dispose();
      }
    };
  }

  /* --------------------------------------------------------------------
     Hub assembly: nine species doors around a themed centrepiece plus a
     return gate to the Conservatory.
     -------------------------------------------------------------------- */
  function buildHub(expansion, ctx) {
    const group = new THREE.Group();
    const radius = expansion.hub.radius || 6.2;
    const floor = RoomKit.floor(expansion.hub.walkRadius || radius, expansion.hub.floorColor || 0xd9d2c3, { segments: 48 });
    if (expansion.hub.hideFloor) { floor.visible = false; }
    group.add(floor);

    const interactables = [];
    const particleFields = [];
    const updaters = [];
    const entryPoints = {};
    const continuationPoints = {};
    const doorLights = [];

    const hubOwned = [];
    const region = regionApi(expansion.id, expansion.id);
    activeOwned = hubOwned;
    const hubFX = Object.assign({}, FX, { Materials: Object.assign(Object.create(FX.Materials), { emissiveAccent: (c, i) => emissive(c, i == null ? 1.2 : i) }) });
    const api = {
      THREE, FX: hubFX, P, RoomKit, expansion, region,
      SPECIES, SPECIES_COLOR,
      add(obj) { group.add(obj); return obj; },
      own(material) { if (material) hubOwned.push(material); return material; },
      particles(field) { particleFields.push(field); group.add(field.points); return field; },
      onUpdate(fn) { updaters.push(fn); },
      curio(object3D, id, label, discoveryId, discoveryLabel, onActivate) {
        group.add(object3D);
        interactables.push(RoomKit.makeInteractable(object3D, id, 'curio', label, () => {
          if (onActivate) onActivate();
          if (discoveryId && ctx.unlockBehavior) ctx.unlockBehavior(discoveryId, discoveryLabel || label);
        }));
        return object3D;
      }
    };

    // Doors: nine species rooms. The hub spec may supply a layout
    // (position/rotation/scale per species) so the region's geography, not
    // a ring, decides where each habitat is reached from.
    const layout = typeof expansion.hub.doorLayout === 'function' ? expansion.hub.doorLayout(SPECIES, radius) : null;
    SPECIES.forEach((species, i) => {
      const rid = expansion.id + '_' + species;
      const a = (i / SPECIES.length) * Math.PI * 2 - Math.PI / 2 + Math.PI / SPECIES.length;
      const door = RoomKit.doorway(SPECIES_COLOR[species], rid);
      const slot = layout && layout[species];
      if (slot) {
        door.position.set(slot.x || 0, slot.y || 0, slot.z || 0);
        door.rotation.y = slot.ry != null ? slot.ry : Math.atan2(-door.position.x, -door.position.z);
        if (slot.scale) door.scale.setScalar(slot.scale);
      } else {
        door.position.set(Math.cos(a) * (radius - 0.9), 0, Math.sin(a) * (radius - 0.9));
        door.rotation.y = -a + Math.PI / 2;
      }
      door.userData.portalTarget = rid;
      group.add(door);
      interactables.push(RoomKit.makeInteractable(door, 'door_' + rid, 'door', ctx.roomLabel(rid), () => ctx.requestDoor(rid, door)));
      const flat = door.position.clone(); flat.y = 0;
      const len = Math.max(0.01, flat.length());
      const inward = flat.clone().multiplyScalar(Math.max(0, (len - 1.1) / len)); inward.y = 0;
      const cont = flat.clone().multiplyScalar(Math.max(0, (len - 2.2) / len)); cont.y = 0;
      entryPoints[rid] = inward;
      continuationPoints[rid] = cont;
      door.traverse(o => { if (o.isPointLight) doorLights.push(o); });
    });

    const back = RoomKit.doorway(0xffffff, 'conservatory');
    const backSlot = layout && layout.conservatory;
    if (backSlot) { back.position.set(backSlot.x || 0, backSlot.y || 0, backSlot.z || 0); back.rotation.y = backSlot.ry || 0; }
    else back.position.set(0, 0, -(radius - 0.6));
    back.userData.portalTarget = 'conservatory';
    group.add(back);
    interactables.push(RoomKit.makeInteractable(back, 'door_conservatory', 'door', 'Conservatory', () => ctx.requestDoor('conservatory', back)));
    entryPoints.conservatory = back.position.clone().multiplyScalar(0.7).setY(0);
    continuationPoints.conservatory = back.position.clone().multiplyScalar(0.35).setY(0);

    const extra = expansion.hub.build(api) || {};
    activeOwned = null;

    const lights = RoomKit.lightingProfile(Object.assign({
      hemiSky: 0xf3ead8, hemiGround: 0x54607a, hemiIntensity: 0.55,
      keyColor: 0xfff6e2, keyIntensity: 0.8, keyPos: [5, 10, 4], shadow: true,
      fillColor: 0x9fd0ff, fillIntensity: 0.25, fillPos: [-6, 5, -4]
    }, expansion.hub.lights || {}));
    lights.push(FX.createCinematicRimLight(expansion.doorColor, 0.16));

    return {
      group, lights, particleFields, interactables, memento: null,
      spawnPoint: new THREE.Vector3(0, 0, 1.4),
      entryPoints, continuationPoints,
      topology: {
        interestPoints: circleSpots(2.4, 3, 0, 0.4),
        sleepSpots: [new THREE.Vector3(1.6, 0, 1.4)],
        socialSpots: [new THREE.Vector3(0, 0, 0.4)],
        propSockets: [new THREE.Vector3(1.6, 0.12, 1.4), new THREE.Vector3(-1.6, 0.12, 1.4)]
      },
      cameraBounds: { minDistance: 1.0, maxDistance: radius + 3, minPolar: 0.2, maxPolar: Math.PI / 2 + 0.05 },
      atmosphereVariants: expansion.hub.variants || [{ id: 'default', label: 'Default' }, { id: 'alt', label: 'Alternate', hemiIntensity: 0.3 }],
      applyNarrativeStage(state) {
        const stage = state ? state.stageIndex || 0 : 0;
        doorLights.forEach(l => { l.intensity = 0.7 + stage * 0.15; });
        if (extra.applyStage) extra.applyStage(stage);
      },
      update(dt, elapsed) {
        particleFields.forEach(pf => pf.update(dt, elapsed));
        updaters.forEach(fn => fn(dt, elapsed));
      },
      disposeExtra() {
        hubOwned.forEach(m => { if (m && m.dispose) m.dispose(); });
        group.traverse(o => { if (o.userData && o.userData.ownedMaterial) o.userData.ownedMaterial.dispose(); });
        if (extra.dispose) extra.dispose();
      }
    };
  }

  /* --------------------------------------------------------------------
     Conservatory: add an expedition gate per registered region.
     -------------------------------------------------------------------- */
  let conservatoryPatched = false;
  function patchConservatory() {
    if (conservatoryPatched || !ROOMS.conservatory) return;
    conservatoryPatched = true;
    const original = ROOMS.conservatory.build;
    ROOMS.conservatory.build = function (ctx) {
      const built = original.call(this, ctx);
      const list = REGISTRY.expansions;
      if (!list.length) return built;
      const gateGroup = new THREE.Group();
      gateGroup.name = 'expedition_gates';
      const gateOwned = []; activeOwned = gateOwned;
      const priorDispose = built.disposeExtra ? built.disposeExtra.bind(built) : null;
      built.disposeExtra = () => { gateOwned.forEach(m => m.dispose && m.dispose()); if (priorDispose) priorDispose(); };
      list.forEach((exp, i) => {
        // Inner ring, staggered between the original doors, facing centre.
        const a = Math.PI / 2 + ((i + 0.5) / list.length) * Math.PI * 2;
        const r = 3.55;
        const gate = RoomKit.doorway(exp.doorColor, exp.id);
        gate.scale.setScalar(0.82);
        gate.position.set(Math.cos(a) * r, 0, Math.sin(a) * r);
        gate.rotation.y = -a + Math.PI / 2;
        gate.userData.portalTarget = exp.id;
        gateGroup.add(gate);
        // A signpost crystal in the region's colour so the gates read as "elsewhere".
        const sign = P.crystal(exp.doorColor, 0.5, 0.09);
        sign.position.set(Math.cos(a) * (r - 0.9), 0, Math.sin(a) * (r - 0.9));
        gateGroup.add(sign);
        built.interactables.push(RoomKit.makeInteractable(gate, 'door_' + exp.id, 'door', exp.displayName, () => ctx.requestDoor(exp.id, gate)));
        const inward = gate.position.clone().multiplyScalar(0.7); inward.y = 0;
        built.entryPoints[exp.id] = inward;
        built.continuationPoints[exp.id] = gate.position.clone().multiplyScalar(0.4).setY(0);
      });
      built.group.add(gateGroup);
      activeOwned = null;
      return built;
    };
  }

  /* --------------------------------------------------------------------
     Public: registerExpansion(def)
     -------------------------------------------------------------------- */
  function registerExpansion(def) {
    if (!def || !def.id || ROOMS[def.id]) return null;
    patchConservatory();

    const roomIds = [];
    ROOMS[def.id] = {
      id: def.id,
      displayName: def.displayName,
      mood: def.mood,
      doorColor: def.doorColor,
      associatedForm: null,
      expansionId: def.id,
      isHub: true,
      build(ctx) { return buildHub(def, ctx); }
    };
    REGISTRY.weather[def.id] = def.hub.weather || ['clear', 'mist', 'breeze'];
    REGISTRY.life[def.id] = def.hub.life || 'motes';
    REGISTRY.narrative[def.id] = def.hub.stages || [
      { id: 'arrival', label: 'Arrival' }, { id: 'scouted', label: 'Trails Scouted' },
      { id: 'settled', label: 'Camp Settled' }, { id: 'home', label: 'A Second Home' }
    ];

    SPECIES.forEach(species => {
      const spec = def.rooms[species];
      if (!spec) return;
      const rid = def.id + '_' + species;
      roomIds.push(rid);
      const roomDef = {
        id: rid,
        displayName: spec.name.indexOf(' — ') >= 0 ? spec.name : (species.charAt(0).toUpperCase() + species.slice(1)) + ' — ' + spec.name,
        mood: spec.mood,
        doorColor: SPECIES_COLOR[species],
        associatedForm: species,
        expansionId: def.id,
        hubId: def.id,
        abilityType: SPECIES_ABILITY[species] || null,
        build(ctx) { return buildHabitatRoom(def, species, spec, ctx, rid); }
      };
      // decorateHabitatRoom adds the hub return door, ability plumbing, furniture & meter.
      const rawBuild = roomDef.build;
      roomDef.build = function (ctx) { return RoomKit.decorateHabitatRoom(rid, roomDef, rawBuild.call(roomDef, ctx), ctx); };
      ROOMS[rid] = roomDef;
      REGISTRY.weather[rid] = spec.weather || ['clear', 'mist'];
      REGISTRY.life[rid] = spec.life || SPECIES_LIFE[species];
      REGISTRY.narrative[rid] = spec.stages || [
        { id: 'found', label: 'Found' }, { id: 'explored', label: 'Explored' },
        { id: 'known', label: 'Known' }, { id: 'kept', label: 'Kept' }
      ];
    });

    global.ROOM_ORDER.push(def.id, ...roomIds);
    REGISTRY.expansions.push({ id: def.id, displayName: def.displayName, doorColor: def.doorColor, tagline: def.tagline || '' });
    REGISTRY.roomsByExpansion[def.id] = roomIds;
    REGISTRY.transitions = REGISTRY.transitions || {};
    if (def.transition) REGISTRY.transitions[def.id] = def.transition;
    return ROOMS[def.id];
  }

  function expansionOf(roomId) { const d = ROOMS[roomId]; return d ? d.expansionId || null : null; }
  global.ExpansionKit = { registerExpansion, regionApi, expansionOf, P, SPECIES, SPECIES_COLOR, SPECIES_ABILITY, circleSpots };
})(window);
