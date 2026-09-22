/* ==========================================================================
   ROOMS — the Habitat House: a data-driven Conservatory hub + nine habitat
   rooms. Everything is procedural primitives in the existing toon-material
   visual language (ASSET-01..ASSET-20). Shared builders live in RoomKit so
   no room reinvents doors, stones, toys or mementos from scratch.
   ========================================================================== */
(function (global) {
  'use strict';
  const THREE = global.THREE;
  const FX = global.RenderEffects;

  /* --------------------------------------------------------------------
     RoomKit: reusable prop / doorway / material builders (ASSET-11..14)
     -------------------------------------------------------------------- */
  const RoomKit = {
    floor(radius, color, opts = {}) {
      const geo = new THREE.CylinderGeometry(radius, radius * (opts.taper || 1.04), 0.3, opts.segments || 40);
      const mesh = new THREE.Mesh(geo, FX.Materials.stone(color));
      mesh.position.y = -0.15;
      mesh.receiveShadow = true;
      mesh.name = 'walkable_floor';
      mesh.userData.walkable = true;
      mesh.userData.walkRadius = Math.max(0.75, radius - 0.7);
      return mesh;
    },
    wallPanel(width, height, color, opts = {}) {
      const geo = new THREE.PlaneGeometry(width, height, 1, 1);
      const mat = new THREE.MeshToonMaterial({ color, side: THREE.DoubleSide });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.receiveShadow = true;
      return mesh;
    },
    doorway(color, label) {
      const group = new THREE.Group();
      group.name = 'doorway_' + label;
      const frameMat = FX.Materials.stone(0xcac1b3);
      const postGeo = new THREE.BoxGeometry(0.22, 2.1, 0.22);
      const left = new THREE.Mesh(postGeo, frameMat); left.position.set(-0.75, 1.05, 0);
      const right = new THREE.Mesh(postGeo, frameMat); right.position.set(0.75, 1.05, 0);
      const topGeo = new THREE.BoxGeometry(1.72, 0.22, 0.22);
      const top = new THREE.Mesh(topGeo, frameMat); top.position.set(0, 2.15, 0);
      [left, right, top].forEach(m => { m.castShadow = true; m.receiveShadow = true; group.add(m); });

      const glowGeo = new THREE.PlaneGeometry(1.4, 1.9);
      const glowMat = new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.5, side: THREE.DoubleSide });
      const glow = new THREE.Mesh(glowGeo, glowMat);
      glow.position.set(0, 1.05, 0.02);
      group.add(glow);

      const light = new THREE.PointLight(color, 0.9, 4);
      light.position.set(0, 1.4, 0.4);
      group.add(light);
      group.userData.glow = glow;
      return group;
    },
    evolutionStone(color, emissive) {
      const geo = new THREE.IcosahedronGeometry(0.16, 0);
      const mat = FX.Materials.emissiveAccent(emissive != null ? emissive : color, 0.9);
      mat.color.set(color);
      const mesh = new THREE.Mesh(geo, mat);
      mesh.castShadow = true;
      mesh.userData.isStone = true;
      return mesh;
    },
    cushion(color, radius = 0.4) {
      const geo = new THREE.SphereGeometry(radius, 14, 10);
      geo.scale(1, 0.55, 1);
      const mesh = new THREE.Mesh(geo, FX.Materials.cloth(color));
      mesh.castShadow = true; mesh.receiveShadow = true;
      return mesh;
    },
    toyBall(color) {
      const mesh = new THREE.Mesh(new THREE.SphereGeometry(0.22, 14, 14), FX.Materials.cloth(color));
      mesh.castShadow = true;
      return mesh;
    },
    toyPlush(color) {
      const group = new THREE.Group();
      const body = new THREE.Mesh(new THREE.SphereGeometry(0.2, 10, 10), FX.Materials.cloth(color));
      body.scale.set(1, 1.2, 0.8);
      const ear1 = new THREE.Mesh(new THREE.ConeGeometry(0.07, 0.16, 8), FX.Materials.cloth(color));
      ear1.position.set(-0.1, 0.22, 0);
      const ear2 = ear1.clone(); ear2.position.x = 0.1;
      group.add(body, ear1, ear2);
      group.traverse(c => { if (c.isMesh) c.castShadow = true; });
      return group;
    },
    treatBowl() {
      const group = new THREE.Group();
      const bowl = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.16, 0.14, 16, 1, true), FX.Materials.wood(0xb5652f));
      bowl.material.side = THREE.DoubleSide;
      const berry = new THREE.Mesh(new THREE.SphereGeometry(0.06, 8, 8), FX.Materials.emissiveAccent(0xff4d6d, 0.3));
      berry.position.set(0.05, 0.08, 0.02);
      group.add(bowl, berry);
      group.traverse(c => { if (c.isMesh) c.castShadow = true; });
      return group;
    },
    brush() {
      const group = new THREE.Group();
      const handle = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.3, 8), FX.Materials.wood());
      handle.rotation.z = Math.PI / 2.3;
      const head = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.05, 0.08), FX.Materials.cloth(0xf3e7d0));
      head.position.set(0.16, 0.06, 0);
      group.add(handle, head);
      return group;
    },
    memento(kind, color) {
      const group = new THREE.Group();
      group.name = 'memento_' + kind;
      if (kind === 'frame') {
        const frame = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.28, 0.02), FX.Materials.wood(0x6b4423));
        const photo = new THREE.Mesh(new THREE.PlaneGeometry(0.16, 0.22), FX.Materials.cloth(color));
        photo.position.z = 0.012;
        group.add(frame, photo);
      } else if (kind === 'ribbon') {
        const ribbon = new THREE.Mesh(new THREE.TorusGeometry(0.09, 0.02, 8, 16), FX.Materials.cloth(color));
        group.add(ribbon);
      } else if (kind === 'notebook') {
        const book = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.03, 0.24), FX.Materials.cloth(color));
        group.add(book);
      } else if (kind === 'tag') {
        const tag = new THREE.Mesh(new THREE.CircleGeometry(0.08, 5), FX.Materials.emissiveAccent(color, 0.4));
        group.add(tag);
      } else {
        const shell = new THREE.Mesh(new THREE.SphereGeometry(0.08, 10, 6, 0, Math.PI), FX.Materials.cloth(color));
        group.add(shell);
      }
      group.traverse(c => { if (c.isMesh) { c.castShadow = true; c.userData.isMemento = true; } });
      return group;
    },
    contactShadow(r) { return FX.createContactShadow(r); }
  };

  function makeInteractable(object3D, id, kind, label, onActivate) {
    object3D.userData.interactable = { id, kind, label, onActivate };
    return { object3D, id, kind, label, onActivate };
  }

  /* --------------------------------------------------------------------
     Lighting profile helper (ASSET-19): data-driven, only active room's
     lights ever exist in the scene at once.
     -------------------------------------------------------------------- */
  function lightingProfile({ hemiSky, hemiGround, hemiIntensity, keyColor, keyIntensity, keyPos, fillColor, fillIntensity, fillPos, shadow }) {
    const lights = [];
    const hemi = new THREE.HemisphereLight(hemiSky, hemiGround, hemiIntensity);
    lights.push(hemi);
    const key = new THREE.DirectionalLight(keyColor, keyIntensity);
    key.position.set(keyPos[0], keyPos[1], keyPos[2]);
    if (shadow) {
      key.castShadow = true;
      key.shadow.mapSize.set(1024, 1024);
      key.shadow.camera.near = 0.5;
      key.shadow.camera.far = 20;
      key.shadow.bias = -0.0006;
    }
    lights.push(key);
    if (fillColor != null) {
      const fill = new THREE.DirectionalLight(fillColor, fillIntensity || 0.3);
      fill.position.set(fillPos[0], fillPos[1], fillPos[2]);
      lights.push(fill);
    }
    return lights;
  }

  /* --------------------------------------------------------------------
     Room definitions. Each build(ctx) -> {
       group, lights, particleFields, interactables, memento,
       spawnPoint, cameraBounds, atmosphereVariants, disposables,
       update(dt, elapsed, ctx), onNativeReaction(kind, ctx)
     }
     -------------------------------------------------------------------- */
  const ROOMS = {};

  /* ---- HUB: Conservatory of Possibilities ---- */
  ROOMS.conservatory = {
    id: 'conservatory', displayName: 'The Conservatory of Possibilities', associatedForm: null,
    mood: 'A quiet stone room built to study how one creature becomes many.',
    doorColor: 0xffffff,
    build(ctx) {
      const group = new THREE.Group();
      const floor = RoomKit.floor(6.4, 0xe4ddcf);
      group.add(floor);

      // A modest ring of greenery softens the stone.
      for (let i = 0; i < 10; i++) {
        const a = (i / 10) * Math.PI * 2;
        const bush = new THREE.Mesh(new THREE.SphereGeometry(0.32, 8, 8), FX.Materials.foliage(0x5c9c4a));
        bush.position.set(Math.cos(a) * 5.9, 0.2, Math.sin(a) * 5.9);
        bush.castShadow = true;
        group.add(bush);
      }

      const pedestal = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.6, 0.9, 16), FX.Materials.stone(0xcfc6b4));
      pedestal.position.set(0, 0.45, -2.6);
      pedestal.receiveShadow = true; pedestal.castShadow = true;
      group.add(pedestal);
      const pedestalShadow = RoomKit.contactShadow(1.4);
      pedestalShadow.position.z = -2.6;
      group.add(pedestalShadow);

      const disposables = { particleFields: [], materials: [] };
      const roomOrder = ['eevee', 'vaporeon', 'jolteon', 'flareon', 'espeon', 'umbreon', 'leafeon', 'glaceon', 'sylveon'];
      const colors = { eevee: 0xe0b47a, vaporeon: 0x49b2e8, jolteon: 0xfee033, flareon: 0xf76835, espeon: 0xc68fed, umbreon: 0x8899ff, leafeon: 0x76b852, glaceon: 0x8be5f5, sylveon: 0xffaec9 };
      const interactables = [];
      roomOrder.forEach((rid, i) => {
        const a = (i / roomOrder.length) * Math.PI * 2 - Math.PI / 2;
        const door = RoomKit.doorway(colors[rid], rid);
        door.position.set(Math.cos(a) * 5.3, 0, Math.sin(a) * 5.3);
        door.rotation.y = -a + Math.PI / 2;
        group.add(door);
        interactables.push(makeInteractable(door, 'door_' + rid, 'door', ctx.roomLabel(rid), () => ctx.goTo(rid)));

        // Suspended evolution stone above each door, hinting at its habitat.
        const stone = RoomKit.evolutionStone(colors[rid]);
        stone.position.set(Math.cos(a) * 5.3, 2.6, Math.sin(a) * 5.3);
        stone.userData.floatSeed = i;
        group.add(stone);
      });

      const dust = FX.VFX.dust({ area: [10, 5, 10], baseY: 0.4 });
      group.add(dust.points);
      disposables.particleFields.push(dust);

      const lights = lightingProfile({
        hemiSky: 0xf3ead8, hemiGround: 0x54607a, hemiIntensity: 0.55,
        keyColor: 0xfff6e2, keyIntensity: 0.8, keyPos: [5, 10, 4], shadow: true,
        fillColor: 0x9fd0ff, fillIntensity: 0.25, fillPos: [-6, 5, -4]
      });

      return {
        group, lights, particleFields: disposables.particleFields, interactables,
        memento: null,
        spawnPoint: new THREE.Vector3(0, 0, 1.4),
        cameraBounds: { minDistance: 1.0, maxDistance: 9, minPolar: 0.2, maxPolar: Math.PI / 2 + 0.05 },
        atmosphereVariants: [{ id: 'day', label: 'Daylight' }],
        update(dt, elapsed) {
          group.traverse(c => { if (c.userData && c.userData.floatSeed != null) c.position.y = 2.6 + Math.sin(elapsed + c.userData.floatSeed) * 0.08; });
          dust.update(dt, elapsed);
        }
      };
    }
  };

  function commonReturnDoor(color) {
    const door = RoomKit.doorway(color, 'return');
    return door;
  }

  /* ---- ROOM 01: Eevee — The Unchosen Room ---- */
  ROOMS.eevee = {
    id: 'eevee', displayName: "Eevee's Den — The Unchosen Room", associatedForm: 'eevee',
    mood: 'Warm, curious, unfinished — every path investigated, none chosen.',
    doorColor: 0xe0b47a,
    build(ctx) {
      const group = new THREE.Group();
      group.add(RoomKit.floor(4.6, 0xead9b8));

      const nest = new THREE.Mesh(new THREE.TorusGeometry(0.9, 0.28, 10, 20), FX.Materials.cloth(0xd8b98a));
      nest.rotation.x = Math.PI / 2; nest.position.set(-1.4, 0.05, -1);
      nest.receiveShadow = true;
      group.add(nest);

      const stones = ['vaporeon', 'jolteon', 'flareon', 'espeon', 'umbreon', 'leafeon', 'glaceon', 'sylveon'];
      const colors = { vaporeon: 0x49b2e8, jolteon: 0xfee033, flareon: 0xf76835, espeon: 0xc68fed, umbreon: 0x8899ff, leafeon: 0x76b852, glaceon: 0x8be5f5, sylveon: 0xffaec9 };
      const interactables = [];
      stones.forEach((s, i) => {
        const stone = RoomKit.evolutionStone(colors[s]);
        const a = (i / stones.length) * Math.PI * 2;
        stone.position.set(Math.cos(a) * 1.9, 0.18, 1.6 + Math.sin(a) * 1.1);
        group.add(stone);
        interactables.push(makeInteractable(stone, 'stone_' + s, 'prop', s + ' stone', () =>
          ctx.onRoomProp('eevee', { stoneInspected: s })));
      });

      const toys = [RoomKit.toyBall(0xff6b6b), RoomKit.toyPlush(0x8ecae6), RoomKit.brush()];
      toys.forEach((t, i) => { t.position.set(-2.1 + i * 0.5, 0.15, 0.8); group.add(t); });

      const returnDoor = commonReturnDoor(0xffffff);
      returnDoor.position.set(0, 0, -4.2);
      group.add(returnDoor);
      interactables.push(makeInteractable(returnDoor, 'door_conservatory', 'door', 'Conservatory', () => ctx.goTo('conservatory')));

      const memento = RoomKit.memento('notebook', 0xd8b98a);
      memento.position.set(1.7, 0.12, -1.3);
      group.add(memento);
      interactables.push(makeInteractable(memento, 'memento_eevee_notebook', 'memento', 'field notebook', () =>
        ctx.onMemento('eevee', 'memento_eevee_notebook', 'A notebook of half-finished sketches: every evolution, none crossed out.')));

      const dust = FX.VFX.dust({ area: [7, 4, 7], baseY: 0.3 });
      group.add(dust.points);

      const lights = lightingProfile({
        hemiSky: 0xffe9c2, hemiGround: 0x6b5230, hemiIntensity: 0.5,
        keyColor: 0xffcf8a, keyIntensity: 0.9, keyPos: [4, 6, 5], shadow: true
      });

      return {
        group, lights, particleFields: [dust], interactables, memento,
        spawnPoint: new THREE.Vector3(0, 0, 0.4),
        cameraBounds: { minDistance: 0.8, maxDistance: 7, minPolar: 0.25, maxPolar: Math.PI / 2 },
        atmosphereVariants: [
          { id: 'afternoon', label: 'Late Afternoon' },
          { id: 'evening', label: 'Amber Evening', keyColor: 0xff9a5c, hemiIntensity: 0.35 }
        ],
        update(dt, elapsed) { dust.update(dt, elapsed); }
      };
    }
  };

  /* ---- ROOM 02: Vaporeon — Tideglass Grotto ---- */
  ROOMS.vaporeon = {
    id: 'vaporeon', displayName: 'Vaporeon — Tideglass Grotto', associatedForm: 'vaporeon',
    mood: 'Calm, submerged, playful — the room slowly flooded and Vaporeon approves.',
    doorColor: 0x49b2e8,
    build(ctx) {
      const group = new THREE.Group();
      group.add(RoomKit.floor(4.4, 0x2f6f8f));

      const waterMat = FX.createWaterMaterial(0x3fa7d6);
      const water = new THREE.Mesh(new THREE.CircleGeometry(2.6, 40), waterMat);
      water.rotation.x = -Math.PI / 2; water.position.y = 0.02;
      group.add(water);

      const ledgeMat = FX.Materials.stone(0x8fa8ab);
      for (let i = 0; i < 5; i++) {
        const a = (i / 5) * Math.PI * 2;
        const ledge = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.5, 0.3, 10), ledgeMat);
        ledge.position.set(Math.cos(a) * 3.2, 0.05, Math.sin(a) * 3.2);
        ledge.receiveShadow = true;
        group.add(ledge);
      }

      const toy = RoomKit.toyBall(0xffd166);
      toy.position.set(1.0, 0.25, 0.6);
      group.add(toy);
      const interactables = [
        makeInteractable(water, 'grotto_pool', 'prop', 'the pool', () => ctx.onRoomProp('vaporeon', { splashed: true }))
      ];

      const memento = RoomKit.memento('shell', 0xf2e9d8);
      memento.position.set(-1.6, 0.1, 1.9);
      group.add(memento);
      interactables.push(makeInteractable(memento, 'memento_vaporeon_shell', 'memento', 'a shell', () =>
        ctx.onMemento('vaporeon', 'memento_vaporeon_shell', 'A shell worn smooth — someone has been carrying this a long time.')));

      const droplets = FX.VFX.droplets({ area: [7, 4, 7], baseY: 2.5 });
      group.add(droplets.points);

      const lights = lightingProfile({
        hemiSky: 0xbdeaff, hemiGround: 0x0d3b52, hemiIntensity: 0.5,
        keyColor: 0x6fd7ff, keyIntensity: 0.85, keyPos: [3, 7, 4], shadow: true
      });

      return {
        group, lights, particleFields: [droplets], interactables, memento,
        spawnPoint: new THREE.Vector3(0, 0, 1.0),
        cameraBounds: { minDistance: 0.8, maxDistance: 7, minPolar: 0.2, maxPolar: Math.PI / 2 + 0.1 },
        atmosphereVariants: [
          { id: 'calm', label: 'Calm' },
          { id: 'moonlit', label: 'Moonlit Water', keyColor: 0x4c7db0, hemiIntensity: 0.3 }
        ],
        update(dt, elapsed) {
          waterMat.uniforms.uTime.value = elapsed;
          droplets.update(dt, elapsed);
        },
        disposeExtra: () => waterMat.dispose()
      };
    }
  };

  /* ---- ROOM 03: Jolteon — Storm Relay ---- */
  ROOMS.jolteon = {
    id: 'jolteon', displayName: 'Jolteon — Storm Relay', associatedForm: 'jolteon',
    mood: 'Nervous energy — someone tried to make a safe charging room.',
    doorColor: 0xfee033,
    build(ctx) {
      const group = new THREE.Group();
      group.add(RoomKit.floor(4.2, 0x2b2f38));

      const bulbs = [];
      const interactables = [];
      for (let i = 0; i < 6; i++) {
        const a = (i / 6) * Math.PI * 2;
        const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 1.1, 8), FX.Materials.metal(0x555b66));
        pole.position.set(Math.cos(a) * 2.9, 0.55, Math.sin(a) * 2.9);
        const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.12, 10, 10), FX.Materials.emissiveAccent(0xfff066, 0.0));
        bulb.position.set(0, 0.65, 0);
        pole.add(bulb);
        group.add(pole);
        bulbs.push(bulb);
      }
      const relayCore = new THREE.Mesh(new THREE.TorusKnotGeometry(0.35, 0.1, 60, 8), FX.Materials.metal(0x8f97a3));
      relayCore.position.set(0, 0.9, -1.8);
      group.add(relayCore);
      interactables.push(makeInteractable(relayCore, 'jolteon_relay', 'prop', 'the relay core', () => {
        bulbs.forEach(b => { b.material.emissiveIntensity = 1.6; });
        ctx.onRoomProp('jolteon', { charged: true });
        setTimeout(() => bulbs.forEach(b => { b.material.emissiveIntensity = 0.0; }), 1400);
      }));

      const memento = RoomKit.memento('tag', 0xfff066);
      memento.position.set(1.6, 0.1, -1.5);
      group.add(memento);
      interactables.push(makeInteractable(memento, 'memento_jolteon_tag', 'memento', 'a scorched tag', () =>
        ctx.onMemento('jolteon', 'memento_jolteon_tag', '"MAX SAFE LOAD" reads a tag, badly scorched at one corner.')));

      const sparks = FX.VFX.sparks({ area: [6, 3, 6], baseY: 0.4 });
      group.add(sparks.points);

      const lights = lightingProfile({
        hemiSky: 0xd8e6ff, hemiGround: 0x1a2030, hemiIntensity: 0.4,
        keyColor: 0xfff6b0, keyIntensity: 0.7, keyPos: [2, 6, 3], shadow: true
      });

      let flicker = 0;
      return {
        group, lights, particleFields: [sparks], interactables, memento,
        spawnPoint: new THREE.Vector3(0, 0, 1.2),
        cameraBounds: { minDistance: 0.8, maxDistance: 6.5, minPolar: 0.2, maxPolar: Math.PI / 2 },
        atmosphereVariants: [
          { id: 'clear', label: 'Clear' },
          { id: 'blackout', label: 'Blackout + Sparks', hemiIntensity: 0.15, keyIntensity: 0.2 }
        ],
        update(dt, elapsed) {
          sparks.update(dt, elapsed);
          flicker += dt;
          if (flicker > 2 + Math.random() * 3) {
            flicker = 0;
            const b = bulbs[Math.floor(Math.random() * bulbs.length)];
            b.material.emissiveIntensity = 0.9;
            setTimeout(() => { b.material.emissiveIntensity = 0.0; }, 120);
          }
        }
      };
    }
  };

  /* ---- ROOM 04: Flareon — Ember Den ---- */
  ROOMS.flareon = {
    id: 'flareon', displayName: 'Flareon — Ember Den', associatedForm: 'flareon',
    mood: 'A formal observation chamber, now a nest.',
    doorColor: 0xf76835,
    build(ctx) {
      const group = new THREE.Group();
      group.add(RoomKit.floor(4.0, 0x4a2e22));

      const hearth = new THREE.Mesh(new THREE.CylinderGeometry(0.7, 0.8, 0.35, 16), FX.Materials.stone(0x5c4636));
      hearth.position.set(0, 0.17, -1.6);
      group.add(hearth);
      const fireMat = FX.Materials.emissiveAccent(0xff6a2e, 1.4);
      const fire = new THREE.Mesh(new THREE.ConeGeometry(0.35, 0.6, 10), fireMat);
      fire.position.set(0, 0.55, -1.6);
      group.add(fire);

      const cushion = RoomKit.cushion(0xd98b4a, 0.55);
      cushion.position.set(0.9, 0.1, -0.3);
      group.add(cushion);

      const rack = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.08, 0.3), FX.Materials.wood(0x5a3a22));
      rack.position.set(-1.2, 0.35, -1.2);
      const berry = RoomKit.treatBowl();
      berry.position.set(-1.2, 0.45, -1.2);
      group.add(rack, berry);

      const interactables = [
        makeInteractable(hearth, 'flareon_hearth', 'prop', 'the hearth', () => {
          fire.scale.set(1.5, 1.8, 1.5);
          ctx.onRoomProp('flareon', { warmed: true });
          setTimeout(() => fire.scale.set(1, 1, 1), 900);
        })
      ];

      const memento = RoomKit.memento('frame', 0xffcf8a);
      memento.position.set(1.4, 0.14, 1.4);
      group.add(memento);
      interactables.push(makeInteractable(memento, 'memento_flareon_frame', 'memento', 'a photo frame', () =>
        ctx.onMemento('flareon', 'memento_flareon_frame', 'A soot-smudged photo frame, empty — nobody has replaced the picture.')));

      const embers = FX.VFX.embers({ area: [3, 2, 3], baseY: 0.5 });
      embers.points.position.set(0, 0, -1.6);
      group.add(embers.points);

      const lights = lightingProfile({
        hemiSky: 0xffd7a8, hemiGround: 0x2a1408, hemiIntensity: 0.45,
        keyColor: 0xff9a52, keyIntensity: 0.85, keyPos: [1, 5, -1], shadow: true
      });

      return {
        group, lights, particleFields: [embers], interactables, memento,
        spawnPoint: new THREE.Vector3(0, 0, 0.8),
        cameraBounds: { minDistance: 0.8, maxDistance: 6.5, minPolar: 0.2, maxPolar: Math.PI / 2 },
        atmosphereVariants: [
          { id: 'afternoon', label: 'Afternoon' },
          { id: 'hearthnight', label: 'Hearth Night', hemiIntensity: 0.2, keyIntensity: 0.5 }
        ],
        update(dt, elapsed) {
          fireMat.emissiveIntensity = 1.1 + Math.sin(elapsed * 9) * 0.3;
          embers.update(dt, elapsed);
        }
      };
    }
  };

  /* ---- ROOM 05: Espeon — Hourglass Observatory ---- */
  ROOMS.espeon = {
    id: 'espeon', displayName: 'Espeon — Hourglass Observatory', associatedForm: 'espeon',
    mood: 'Objects have been moved before anyone touched them.',
    doorColor: 0xc68fed,
    build(ctx) {
      const group = new THREE.Group();
      group.add(RoomKit.floor(4.2, 0x2e2540));

      const psychicMat = FX.createPsychicMaterial(0xd09cf5);
      const orbGeo = new THREE.IcosahedronGeometry(0.7, 1);
      const orb = new THREE.Mesh(orbGeo, psychicMat);
      orb.position.set(0, 1.1, -1.2);
      group.add(orb);

      const floatingBooks = [];
      const interactables = [];
      for (let i = 0; i < 4; i++) {
        const book = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.04, 0.3), FX.Materials.cloth([0x6b4fa0, 0x4a3a70, 0x8060b0, 0x3a2c5a][i]));
        book.position.set(-1.6 + i * 0.5, 0.9 + i * 0.15, 1.2);
        group.add(book);
        floatingBooks.push(book);
      }
      interactables.push(makeInteractable(orb, 'espeon_orb', 'prop', 'the star orb', () => {
        floatingBooks.forEach(b => { b.userData.kick = 1.0; });
        ctx.onRoomProp('espeon', { predicted: true });
      }));

      const memento = RoomKit.memento('tag', 0xc68fed);
      memento.position.set(1.6, 0.12, -1.1);
      group.add(memento);
      interactables.push(makeInteractable(memento, 'memento_espeon_tag', 'memento', 'a star chart fragment', () =>
        ctx.onMemento('espeon', 'memento_espeon_tag', 'A torn star chart, annotated in handwriting nobody recognizes.')));

      const motes = FX.VFX.motes({ area: [7, 4, 7], baseY: 0.6 });
      group.add(motes.points);

      const lights = lightingProfile({
        hemiSky: 0xe6d4ff, hemiGround: 0x22163a, hemiIntensity: 0.4,
        keyColor: 0xffb8ff, keyIntensity: 0.6, keyPos: [2, 6, 2], shadow: true
      });

      return {
        group, lights, particleFields: [motes], interactables, memento,
        spawnPoint: new THREE.Vector3(0, 0, 1.2),
        cameraBounds: { minDistance: 0.8, maxDistance: 6.5, minPolar: 0.2, maxPolar: Math.PI / 2 },
        atmosphereVariants: [
          { id: 'daylight', label: 'Daylight' },
          { id: 'twilight', label: 'Violet Twilight', hemiIntensity: 0.22, keyColor: 0x8a5fd6 }
        ],
        update(dt, elapsed) {
          psychicMat.uniforms.uTime.value = elapsed;
          orb.rotation.y += dt * 0.2;
          floatingBooks.forEach((b, i) => {
            const kick = b.userData.kick || 0;
            b.userData.kick = Math.max(0, kick - dt * 0.6);
            b.position.y = 0.9 + i * 0.15 + Math.sin(elapsed * 1.3 + i) * 0.05 + kick * 0.3;
            b.rotation.y = Math.sin(elapsed * 0.5 + i) * 0.3 + kick * 2;
          });
          motes.update(dt, elapsed);
        },
        disposeExtra: () => psychicMat.dispose()
      };
    }
  };

  /* ---- ROOM 06: Umbreon — Moon Garden ---- */
  ROOMS.umbreon = {
    id: 'umbreon', displayName: 'Umbreon — Moon Garden', associatedForm: 'umbreon',
    mood: 'The room seems empty until your eyes adjust.',
    doorColor: 0x8899ff,
    build(ctx) {
      const group = new THREE.Group();
      group.add(RoomKit.floor(4.2, 0x1b2130));

      const poolMat = FX.createWaterMaterial(0x1e2a4a);
      const pool = new THREE.Mesh(new THREE.CircleGeometry(1.1, 30), poolMat);
      pool.rotation.x = -Math.PI / 2; pool.position.set(-1.4, 0.02, -1.4);
      group.add(pool);

      const dial = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.45, 0.15, 20), FX.Materials.stone(0x3a3f52));
      dial.position.set(1.3, 0.08, 1.0);
      group.add(dial);
      const gnomon = new THREE.Mesh(new THREE.ConeGeometry(0.04, 0.35, 6), FX.Materials.metal(0xcfd6ff));
      gnomon.position.set(1.3, 0.3, 1.0);
      group.add(gnomon);

      for (let i = 0; i < 7; i++) {
        const bush = new THREE.Mesh(new THREE.SphereGeometry(0.28, 8, 8), FX.Materials.foliage(0x142016));
        bush.position.set(Math.cos(i) * 2.6, 0.15, Math.sin(i * 1.7) * 2.6);
        group.add(bush);
      }

      const interactables = [
        makeInteractable(dial, 'umbreon_dial', 'prop', 'the moon dial', () => ctx.onRoomProp('umbreon', { moonwatched: true }))
      ];
      const memento = RoomKit.memento('ribbon', 0x8899ff);
      memento.position.set(-1.7, 0.1, 1.6);
      group.add(memento);
      interactables.push(makeInteractable(memento, 'memento_umbreon_ribbon', 'memento', 'a stray ribbon', () =>
        ctx.onMemento('umbreon', 'memento_umbreon_ribbon', "A ribbon that isn't Umbreon's, caught on a branch. Someone else has been here.")));

      const fireflies = FX.VFX.fireflies({ area: [7, 3, 7], baseY: 0.4 });
      group.add(fireflies.points);

      const lights = lightingProfile({
        hemiSky: 0x39406b, hemiGround: 0x05060c, hemiIntensity: 0.32,
        keyColor: 0x6f83ff, keyIntensity: 0.35, keyPos: [1, 6, -1], shadow: true
      });
      const ringLight = new THREE.PointLight(0xfce029, 0.6, 3);
      ringLight.position.set(0, 0.8, 0.6);
      lights.push(ringLight);

      return {
        group, lights, particleFields: [fireflies], interactables, memento,
        spawnPoint: new THREE.Vector3(0, 0, 0.9),
        cameraBounds: { minDistance: 0.8, maxDistance: 6.5, minPolar: 0.2, maxPolar: Math.PI / 2 },
        atmosphereVariants: [
          { id: 'moonlight', label: 'Moonlight' },
          { id: 'deepnight', label: 'Deep Night', hemiIntensity: 0.18, keyIntensity: 0.18 }
        ],
        update(dt, elapsed) {
          poolMat.uniforms.uTime.value = elapsed;
          ringLight.intensity = 0.5 + Math.sin(elapsed * 2) * 0.2;
          fireflies.update(dt, elapsed);
        },
        disposeExtra: () => poolMat.dispose()
      };
    }
  };

  /* ---- ROOM 07: Leafeon — Overgrown Glasshouse ---- */
  ROOMS.leafeon = {
    id: 'leafeon', displayName: 'Leafeon — Overgrown Glasshouse', associatedForm: 'leafeon',
    mood: 'Nature reclaimed the laboratory faster than anyone stopped it.',
    doorColor: 0x76b852,
    build(ctx) {
      const group = new THREE.Group();
      group.add(RoomKit.floor(4.2, 0x3c4a2c));

      const planters = [];
      const interactables = [];
      for (let i = 0; i < 5; i++) {
        const pot = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.18, 0.3, 10), FX.Materials.wood(0x6b4a2a));
        const a = (i / 5) * Math.PI * 2;
        pot.position.set(Math.cos(a) * 2.6, 0.15, Math.sin(a) * 2.6);
        const plant = new THREE.Mesh(new THREE.ConeGeometry(0.22, 0.5, 8), FX.Materials.foliage(0x6fbf4a));
        plant.position.set(pot.position.x, 0.55, pot.position.z);
        plant.scale.y = 0.6;
        group.add(pot, plant);
        planters.push(plant);
      }
      interactables.push(makeInteractable(planters[0], 'leafeon_plant', 'prop', 'a young plant', () => {
        ctx.onRoomProp('leafeon', { grown: true });
      }));

      const frame = new THREE.Mesh(new THREE.BoxGeometry(0.06, 2.4, 0.06), FX.Materials.metal(0x9db08a));
      for (let i = -1; i <= 1; i += 2) {
        const beam = frame.clone(); beam.position.set(i * 3.6, 1.2, 0); group.add(beam);
      }

      const memento = RoomKit.memento('notebook', 0x7ea45a);
      memento.position.set(0, 0.14, -1.8);
      group.add(memento);
      interactables.push(makeInteractable(memento, 'memento_leafeon_notebook', 'memento', 'a watering log', () =>
        ctx.onMemento('leafeon', 'memento_leafeon_notebook', 'A watering schedule, abandoned mid-week. The plants did not need it.')));

      const pollen = FX.VFX.pollen({ area: [7, 3.5, 7], baseY: 2 });
      group.add(pollen.points);

      const lights = lightingProfile({
        hemiSky: 0xe6f2c8, hemiGround: 0x263318, hemiIntensity: 0.55,
        keyColor: 0xfff0b0, keyIntensity: 0.9, keyPos: [3, 8, 2], shadow: true
      });

      return {
        group, lights, particleFields: [pollen], interactables, memento,
        spawnPoint: new THREE.Vector3(0, 0, 1.0),
        cameraBounds: { minDistance: 0.8, maxDistance: 6.5, minPolar: 0.2, maxPolar: Math.PI / 2 },
        atmosphereVariants: [
          { id: 'clear', label: 'Clear' },
          { id: 'goldenmorning', label: 'Golden Morning', keyColor: 0xffd27a, hemiIntensity: 0.65 },
          { id: 'rain', label: 'Soft Rain', hemiIntensity: 0.35 }
        ],
        update(dt, elapsed) {
          planters.forEach((p, i) => { p.scale.y = 0.6 + Math.sin(elapsed * 0.5 + i) * 0.03 + (p.userData.grown ? 0.4 : 0); });
          pollen.update(dt, elapsed);
        }
      };
    }
  };

  /* ---- ROOM 08: Glaceon — Frost Gallery ---- */
  ROOMS.glaceon = {
    id: 'glaceon', displayName: 'Glaceon — Frost Gallery', associatedForm: 'glaceon',
    mood: 'It was not built as a freezer. It became one.',
    doorColor: 0x8be5f5,
    build(ctx) {
      const group = new THREE.Group();
      group.add(RoomKit.floor(4.2, 0xdff3fa));

      const sculptures = [];
      const interactables = [];
      for (let i = 0; i < 3; i++) {
        const geo = new THREE.OctahedronGeometry(0.4 + i * 0.05, 0);
        const sculpture = new THREE.Mesh(geo, FX.Materials.ice(0xcdeffb));
        sculpture.position.set(-1.6 + i * 1.6, 0.5, -1.2);
        group.add(sculpture);
        sculptures.push(sculpture);
      }
      interactables.push(makeInteractable(sculptures[1], 'glaceon_sculpture', 'prop', 'a crystal sculpture', () => {
        ctx.onRoomProp('glaceon', { frosted: true });
      }));

      const rimMat = FX.createFresnelMaterial(0xbdf3ff, 1.1);
      const rim = new THREE.Mesh(new THREE.SphereGeometry(0.42, 20, 20), rimMat);
      rim.position.copy(sculptures[1].position);
      group.add(rim);

      const memento = RoomKit.memento('tag', 0x8be5f5);
      memento.position.set(1.7, 0.12, 1.5);
      group.add(memento);
      interactables.push(makeInteractable(memento, 'memento_glaceon_tag', 'memento', 'a frozen tag', () =>
        ctx.onMemento('glaceon', 'memento_glaceon_tag', 'A collection tag, rimed with frost: "Do Not Touch — Still Cataloguing."')));

      const snow = FX.VFX.snow({ area: [7, 4, 7], baseY: 2.5 });
      group.add(snow.points);

      const lights = lightingProfile({
        hemiSky: 0xeaffff, hemiGround: 0x21414f, hemiIntensity: 0.6,
        keyColor: 0xcdeffb, keyIntensity: 0.75, keyPos: [2, 7, 3], shadow: true
      });

      return {
        group, lights, particleFields: [snow], interactables, memento,
        spawnPoint: new THREE.Vector3(0, 0, 1.0),
        cameraBounds: { minDistance: 0.8, maxDistance: 6.5, minPolar: 0.2, maxPolar: Math.PI / 2 },
        atmosphereVariants: [
          { id: 'still', label: 'Still' },
          { id: 'snowfall', label: 'Snowfall', hemiIntensity: 0.4 }
        ],
        update(dt, elapsed) {
          rim.rotation.y += dt * 0.15;
          snow.update(dt, elapsed);
        },
        disposeExtra: () => rimMat.dispose()
      };
    }
  };

  /* ---- ROOM 09: Sylveon — Ribbon Hall ---- */
  ROOMS.sylveon = {
    id: 'sylveon', displayName: 'Sylveon — Ribbon Hall', associatedForm: 'sylveon',
    mood: 'Unlike the others, this room was prepared for visitors.',
    doorColor: 0xffaec9,
    build(ctx) {
      const group = new THREE.Group();
      group.add(RoomKit.floor(4.4, 0xfff1f6));

      const lanternMat = FX.Materials.emissiveAccent(0xffe6f2, 1.0);
      const ribbons = [];
      const interactables = [];
      for (let i = 0; i < 6; i++) {
        const a = (i / 6) * Math.PI * 2;
        const lantern = new THREE.Mesh(new THREE.SphereGeometry(0.14, 10, 10), lanternMat);
        lantern.position.set(Math.cos(a) * 3.0, 1.6, Math.sin(a) * 3.0);
        group.add(lantern);

        const ribbon = new THREE.Mesh(new THREE.TorusGeometry(0.5, 0.03, 6, 16), FX.Materials.cloth([0xffb7df, 0xbfe3ff, 0xffffff][i % 3]));
        ribbon.position.set(Math.cos(a) * 1.8, 1.0, Math.sin(a) * 1.8);
        ribbon.rotation.x = Math.PI / 2;
        group.add(ribbon);
        ribbons.push(ribbon);
      }

      // Small mementos referencing every other habitat — the emotional conclusion room.
      const refKinds = [['shell', 0x8fd0ee], ['tag', 0xfee033], ['frame', 0xff9a52], ['notebook', 0x76b852], ['ribbon', 0x8be5f5]];
      refKinds.forEach(([kind, color], i) => {
        const m = RoomKit.memento(kind, color);
        m.position.set(-1.4 + i * 0.7, 0.1, -1.6);
        group.add(m);
      });

      const centerpiece = new THREE.Mesh(new THREE.SphereGeometry(0.3, 16, 16), FX.Materials.emissiveAccent(0xffd6ee, 0.6));
      centerpiece.position.set(0, 0.5, 1.2);
      group.add(centerpiece);
      interactables.push(makeInteractable(centerpiece, 'sylveon_centerpiece', 'prop', 'the ribbon centerpiece', () =>
        ctx.onRoomProp('sylveon', { connected: true })));

      const memento = RoomKit.memento('ribbon', 0xffaec9);
      memento.position.set(1.8, 0.12, 1.7);
      group.add(memento);
      interactables.push(makeInteractable(memento, 'memento_sylveon_ribbon', 'memento', 'a keepsake ribbon', () =>
        ctx.onMemento('sylveon', 'memento_sylveon_ribbon', 'A ribbon tied in a bow that could only be Sylveon\'s handiwork.')));

      const sparkles = FX.VFX.sparkles({ area: [7, 4, 7], baseY: 0.6 });
      group.add(sparkles.points);

      const lights = lightingProfile({
        hemiSky: 0xffe9f4, hemiGround: 0xcfe6ff, hemiIntensity: 0.6,
        keyColor: 0xffe0ef, keyIntensity: 0.8, keyPos: [3, 7, 3], shadow: true,
        fillColor: 0xcfe6ff, fillIntensity: 0.3, fillPos: [-3, 4, -3]
      });

      return {
        group, lights, particleFields: [sparkles], interactables, memento,
        spawnPoint: new THREE.Vector3(0, 0, 0.9),
        cameraBounds: { minDistance: 0.8, maxDistance: 6.5, minPolar: 0.2, maxPolar: Math.PI / 2 },
        atmosphereVariants: [
          { id: 'softday', label: 'Soft Daylight' },
          { id: 'lanternnight', label: 'Lantern Night', hemiIntensity: 0.3, keyIntensity: 0.35 }
        ],
        update(dt, elapsed) {
          ribbons.forEach((r, i) => { r.rotation.z = Math.sin(elapsed * 1.4 + i) * 0.2; });
          centerpiece.scale.setScalar(1 + Math.sin(elapsed * 2) * 0.05);
          sparkles.update(dt, elapsed);
        }
      };
    }
  };

  global.RoomKit = RoomKit;
  global.ROOM_DEFINITIONS = ROOMS;
  global.ROOM_ORDER = ['conservatory', 'eevee', 'vaporeon', 'jolteon', 'flareon', 'espeon', 'umbreon', 'leafeon', 'glaceon', 'sylveon'];
})(window);
