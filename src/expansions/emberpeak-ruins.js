/* ==========================================================================
   EXPANSION 02 — EMBERPEAK RUINS
   A high mountain region: a dead volcano, a fallen sky-temple, glacier
   passes, geyser fields and a monastery of wind. Hub: The Pilgrim's Stair.
   ========================================================================== */
(function (global) {
  'use strict';
  const THREE = global.THREE;
  const K = global.ExpansionKit;
  const P = K.P;

  K.registerExpansion({
    id: 'emberpeak',
    displayName: 'Emberpeak Ruins — The Pilgrim\'s Stair',
    tagline: 'A mountain that was a temple, and before that, a volcano.',
    mood: 'Thin air, warm stone underfoot, and prayer flags that were here before the road.',
    doorColor: 0xd0653a,

    transition: 'emberpeak',
    hub: {
      radius: 7.0, floorColor: 0xa89786,
      weather: ['clear', 'mist', 'breeze', 'snow'], life: 'motes',
      stages: [
        { id: 'base-camp', label: 'Base Camp' }, { id: 'first-stair', label: 'First Stair Climbed' },
        { id: 'summit-seen', label: 'Summit Seen' }, { id: 'pilgrim', label: 'Pilgrim' }
      ],
      lights: { hemiSky: 0xe9eef7, hemiGround: 0x4a3a30, hemiIntensity: 0.6, keyColor: 0xffe7c9, keyIntensity: 1.0, keyPos: [-5, 10, 3] },
      variants: [{ id: 'highsun', label: 'High Sun' }, { id: 'alpenglow', label: 'Alpenglow', keyColor: 0xff8f6a, hemiIntensity: 0.38 }],
      // The Stair climbs in switchbacks from base camp (south, low) to the
      // summit gate (north, high). Habitats are reached at the altitude that
      // suits them: the hut and springs low, the caldera off the mid-terrace,
      // aerie / sanctum / glacier at the top.
      doorLayout() {
        return {
          eevee:    { x:  3.4, y: 0.0,  z:  4.6, ry: -0.6 },
          vaporeon: { x: -3.6, y: 0.0,  z:  4.2, ry: 0.7 },
          leafeon:  { x:  5.2, y: 0.44, z:  1.4, ry: -1.3, scale: 0.95 },
          flareon:  { x: -5.4, y: 0.44, z:  0.8, ry: 1.4, scale: 0.95 },
          umbreon:  { x:  4.6, y: 0.88, z: -2.2, ry: -1.9, scale: 0.9 },
          espeon:   { x: -4.8, y: 0.88, z: -2.4, ry: 1.9, scale: 0.9 },
          jolteon:  { x:  2.0, y: 1.32, z: -5.0, ry: -2.6, scale: 0.85 },
          glaceon:  { x: -2.0, y: 1.32, z: -5.0, ry: 2.6, scale: 0.85 },
          sylveon:  { x:  0.0, y: 1.76, z: -6.0, ry: Math.PI, scale: 0.85 },
          conservatory: { x: 0, y: 0, z: 6.4, ry: Math.PI }
        };
      },
      build(api) {
        const region = api.region;
        const stone = api.FX.Materials.stone(0xb8a894);
        // Four terraces stepping north, each 0.44 higher. Walk surface stays the flat floor; the
        // terraces are dressing that reads as a climb from the camera.
        const terraces = [[0, 0.0, 3.0, 7.0], [0, 0.44, 0.6, 5.6], [0, 0.88, -2.0, 4.6], [0, 1.32, -4.6, 3.4], [0, 1.76, -6.2, 2.0]];
        terraces.forEach(([x, y, z, w], i) => { const t = new THREE.Mesh(new THREE.CylinderGeometry(w, w + 0.3, 0.44, 24, 1, false, 0, Math.PI), stone); t.rotation.y = Math.PI; t.position.set(x, y - 0.22, z + w * 0.15); if (i > 0) api.add(P.shadowed(t)); for (let k = 0; k < 3; k++) { const step = P.slab(1.6, 0.12, 0.34, 0xc9baa2); step.position.set(0, y - 0.3 + k * 0.14, z + w * 0.15 + w - 0.2 + k * 0.34); if (i > 0) api.add(step); } });
        const gate = P.arch(0xc2b19b, 2.4, 3.0); gate.position.set(0, 1.76, -7.2); api.add(gate);
        if (region.get('spireStruck')) { const scorch = new THREE.Mesh(new THREE.BoxGeometry(0.05, 1.6, 0.05), api.FX.Materials.emissiveAccent(0xfff066, 0.5)); scorch.position.set(0.35, 3.0, -7.1); scorch.rotation.z = 0.25; api.add(scorch); }
        // Cairns line the switchbacks; prayer flags string between terraces.
        const cairns = []; [[-2.2, 0, 3.6], [2.6, 0.44, 1.2], [-2.8, 0.88, -1.6], [2.9, 1.32, -4.2], [-1.4, 1.76, -5.8]].forEach(([x, y, z]) => { const g = new THREE.Group(); for (let k = 0; k < 4; k++) { const r = P.rock(0x8f857a, 0.26 - k * 0.05); r.position.y = k * 0.28 + 0.1; g.add(r); } g.position.set(x, y, z); api.add(g); cairns.push(g); });
        const flags = []; for (let i = 0; i < 26; i++) { const f = new THREE.Mesh(new THREE.PlaneGeometry(0.26, 0.2), new THREE.MeshToonMaterial({ color: [0x3f7fd0, 0xf5f5f5, 0xd63c3c, 0x5fb85f, 0xf3c53d][i % 5], side: THREE.DoubleSide })); api.own(f.material); const k = i / 26; f.position.set(Math.sin(k * Math.PI * 4) * 4.2, 2.2 + k * 1.9 + Math.sin(i * 1.7) * 0.12, 5.5 - k * 12.5); api.add(f); flags.push(f); }
        // Lanterns along the stair: dark until Umbreon rings the monastery bell.
        const lanternsLit = region.get('lanternsLit', false);
        const lanterns = []; [[1.6, 0, 4.0], [-1.8, 0.44, 1.4], [1.8, 0.88, -1.2], [-1.6, 1.32, -4.0], [0.9, 1.76, -6.0], [-0.9, 1.76, -6.0]].forEach(([x, y, z], i) => { const l = P.lantern(0xffb070); l.position.set(x, y, z); l.userData.glow.material = api.own(l.userData.glow.material.clone()); l.userData.glow.material.emissiveIntensity = lanternsLit ? 1.4 : 0.05; l.children.forEach(c => { if (c.isPointLight) { c.intensity = lanternsLit ? 0.55 : 0; l.userData.light = c; } }); l.userData.seed = i; api.add(l); lanterns.push(l); });
        // Summit peaks + distant monastery silhouette that mirrors Umbreon's room.
        api.add(P.backdrop(7, 12, i => P.mountain(i % 2 ? 0x6f7f95 : 0x8a97a8, 5 + (i % 3) * 1.4, 3)));
        const farPagoda = new THREE.Group(); for (let i = 0; i < 3; i++) { const roof = new THREE.Mesh(new THREE.ConeGeometry(0.7 - i * 0.15, 0.3, 4), api.FX.Materials.stone(0x3a2f3a)); roof.position.y = 0.6 + i * 0.5; roof.rotation.y = Math.PI / 4; farPagoda.add(roof); } farPagoda.position.set(7.5, 3.4, -5.5); api.add(farPagoda);
        const farGlow = P.orb(0xffb070, 0.08, lanternsLit ? 1.6 : 0.05); farGlow.position.set(7.5, 3.9, -5.5); api.add(farGlow);
        // Offerings left at the gate: mementos found across the peak.
        region.mementos().forEach((id, i) => { const m = api.RoomKit.memento(['tag', 'notebook', 'frame', 'shell'][i % 4], 0xd9c6a0); m.scale.setScalar(0.65); m.position.set(-0.9 + i * 0.45, 1.8, -6.7); api.add(m); });
        // Steam from the hot springs drifts up the west flank once Vaporeon has woken them.
        if (region.get('springsWoken')) { const steam = api.particles(api.FX.VFX.dust({ area: [1.4, 3, 1.4], baseY: 0.5, count: 18, color: 0xffffff, size: 0.14, opacity: 0.3 })); steam.points.position.set(-5.2, 0, 3.6); }

        // Anchor: prayer wheel on the first landing.
        const wheel = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.3, 0.6, 12), api.FX.Materials.metal(0xd9a24a)); wheel.position.set(1.9, 1.34, 0.6);
        const wheelPost = P.pillar(0x8f857a, 0.6, 0.06); wheelPost.position.set(1.9, 0.44, 0.6); api.add(wheelPost);
        let spin = 0;
        api.curio(wheel, 'emberpeak_prayer_wheel', 'a prayer wheel', 'emberpeak_wheel_spun', 'Spun the prayer wheel — it went round nine times, then stopped exactly where it started.', () => { spin = 1; });
        api.particles(api.FX.VFX.dust({ area: [12, 5, 14], baseY: 0.4 }));
        const cloudShadow = new THREE.Mesh(new THREE.CircleGeometry(3, 20), new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.12, depthWrite: false })); api.own(cloudShadow.material); cloudShadow.rotation.x = -Math.PI / 2; cloudShadow.position.y = 0.02; api.add(cloudShadow);
        api.onUpdate((dt, t) => {
          spin = Math.max(0, spin - dt * 0.4); wheel.rotation.y += dt * (0.4 + spin * 9);
          flags.forEach((f, i) => { f.rotation.x = Math.sin(t * 2.2 + i) * 0.28; });
          cloudShadow.position.x = Math.sin(t * 0.08) * 5; cloudShadow.position.z = Math.cos(t * 0.06) * 4;
          if (lanternsLit) lanterns.forEach(l => { l.userData.glow.material.emissiveIntensity = 1.2 + Math.sin(t * 3 + l.userData.seed) * 0.25; });
        });
        return { applyStage(stage) { cairns.forEach((c, i) => c.scale.setScalar(i <= stage ? 1.12 : 1)); } };
      }
    },

    rooms: {
      eevee: {
        name: 'Waystation Hut', mood: 'A traveller\'s hut with a stove, nine kinds of tea and no decisions required yet.',
        floor: { radius: 4.0, color: 0xcbb798 }, weather: ['clear', 'breeze', 'snow'], life: 'motes',
        lights: { hemiSky: 0xffeacc, hemiGround: 0x5a4030, hemiIntensity: 0.5, keyColor: 0xffd09a, keyIntensity: 0.85, keyPos: [3, 6, 4] },
        variants: [{ id: 'stove', label: 'Stove Warm' }, { id: 'blizzard', label: 'Blizzard Outside', keyColor: 0xc8dcff, hemiIntensity: 0.35 }],
        stages: [{ id: 'unpacked', label: 'Pack Down' }, { id: 'rested', label: 'Rested' }, { id: 'tea', label: 'Tea Made' }, { id: 'ready', label: 'Ready to Climb' }],
        mementoLabel: 'a trail map',
        build(api) {
          const wall = api.FX.Materials.wood(0x8a6a44);
          for (let i = 0; i < 12; i++) { const a = (i / 12) * Math.PI * 2; if (a > 4.4 && a < 5.2) continue; const plank = new THREE.Mesh(new THREE.BoxGeometry(0.5, 2.0, 0.1), wall); plank.position.set(Math.cos(a) * 3.6, 1.0, Math.sin(a) * 3.6); plank.lookAt(0, 1.0, 0); api.add(P.shadowed(plank)); }
          const stove = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.4, 0.8, 10), api.FX.Materials.metal(0x33363c)); stove.position.set(-1.6, 0.4, -1.4);
          const stoveGlow = new THREE.Mesh(new THREE.CircleGeometry(0.16, 10), api.FX.Materials.emissiveAccent(0xff7a2f, 0.3)); stoveGlow.position.set(-1.6, 0.4, -1.0); api.add(stoveGlow);
          const stoveLight = new THREE.PointLight(0xff8a3d, 0.3, 4); stoveLight.position.set(-1.6, 0.8, -1.2); api.add(stoveLight);
          const pipe = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 2.0, 6), api.FX.Materials.metal(0x33363c)); pipe.position.set(-1.6, 1.8, -1.4); api.add(pipe);
          // Nine tea tins, one in every evolution colour.
          const tins = []; K.SPECIES.forEach((sp, i) => { const tin = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.14, 8), api.FX.Materials.cloth(K.SPECIES_COLOR[sp])); tin.position.set(0.9 + (i % 3) * 0.25, 0.9 + Math.floor(i / 3) * 0.3, -3.3); api.add(tin); tins.push(tin); });
          const shelf = P.slab(1.0, 0.04, 0.3, 0x6b4a33); shelf.position.set(1.15, 0.82, -3.3); api.add(shelf);
          const shelf2 = shelf.clone(); shelf2.position.y = 1.12; api.add(shelf2); const shelf3 = shelf.clone(); shelf3.position.y = 1.42; api.add(shelf3);
          const steam = api.particles(api.FX.VFX.dust({ area: [0.6, 1.4, 0.6], baseY: 0.9, count: 14, color: 0xffffff }));
          steam.points.position.set(-1.6, 0, -1.4);
          let warm = 0;
          api.prop(stove, 'emberpeak_eevee_stove', 'the stove', { stoveFed: true }, () => { warm = 1; });
          api.onUpdate((dt, t) => { warm = Math.max(0, warm - dt * 0.2); stoveLight.intensity = 0.3 + warm * 1.2 + Math.sin(t * 9) * 0.05; stoveGlow.material.emissiveIntensity = 0.3 + warm; steam.points.material.opacity = 0.2 + warm * 0.5; });
          api.onStage(stage => tins.forEach((tin, i) => { tin.scale.y = i < stage * 3 ? 1.2 : 1; }));
          api.toy('plush', 0xe0b47a, new THREE.Vector3(1.4, 0.15, 1.2)); api.toy('brush', 0, new THREE.Vector3(1.9, 0.12, 0.6));
          api.memento('notebook', 0xe0b47a, new THREE.Vector3(-1.2, 0.1, 1.6), 'A trail map. Every route to the summit has been traced, in a different colour, and none is crossed out.');
          return { spawnPoint: new THREE.Vector3(0, 0, 0.8), topology: { sleepSpots: [new THREE.Vector3(-0.6, 0, -1.0)] } };
        }
      },

      vaporeon: {
        consequence: 'springsWoken',
        name: 'Hotspring Terraces', mood: 'Mineral pools stepping down the mountainside. Warm on top, warmer below.',
        floor: { radius: 4.6, color: 0xd8c7a8 }, weather: ['mist', 'clear', 'snow'], life: 'droplets',
        lights: { hemiSky: 0xd6ecff, hemiGround: 0x5a4a3a, hemiIntensity: 0.55, keyColor: 0xffe7c9, keyIntensity: 0.85, keyPos: [4, 8, 2] },
        variants: [{ id: 'steam', label: 'Steam Morning' }, { id: 'starsoak', label: 'Star Soak', keyIntensity: 0.25, hemiIntensity: 0.2 }],
        stages: [{ id: 'cold', label: 'Pools Cold' }, { id: 'warmed', label: 'Pools Warmed' }, { id: 'overflow', label: 'Overflowing' }, { id: 'soaked', label: 'Properly Soaked' }],
        mementoLabel: 'a mineral-crusted cup',
        build(api) {
          const pools = [];
          for (let i = 0; i < 4; i++) {
            const tier = P.slab(2.6 - i * 0.4, 0.3, 2.0 - i * 0.2, 0xe4d6bb); tier.position.set(0, 0.15 + i * 0.3, -2.4 + i * 0.9); api.add(tier);
            const pool = P.waterDisk(0.9 - i * 0.12, 0x6fd7e0, 0.31 + i * 0.3); pool.position.set(0, 0.31 + i * 0.3, -2.4 + i * 0.9); api.add(pool); pools.push(pool);
          }
          const steam = api.particles(api.FX.VFX.dust({ area: [3, 2, 4], baseY: 0.8, count: 30, color: 0xffffff, size: 0.09 })); steam.points.position.z = -1.2;
          const vent = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.3, 0.3, 8), api.FX.Materials.stone(0x8a7a66)); vent.position.set(-2.2, 0.15, 0.4);
          const geyser = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.16, 1, 8, 1, true), new THREE.MeshBasicMaterial({ color: 0xcdeffb, transparent: true, opacity: 0, depthWrite: false })); api.own(geyser.material); geyser.position.set(-2.2, 0.8, 0.4); api.add(geyser);
          let erupt = 0;
          api.prop(vent, 'emberpeak_vaporeon_vent', 'the spring vent', { warmed: true }, () => { erupt = 1.2; });
          api.onUpdate((dt, t) => {
            erupt = Math.max(0, erupt - dt);
            geyser.scale.y = 0.2 + erupt * 2.4; geyser.position.y = 0.3 + geyser.scale.y * 0.5; geyser.material.opacity = Math.min(0.8, erupt);
            steam.points.material.opacity = 0.35 + erupt * 0.4;
          });
          api.onStage(stage => pools.forEach(p => p.scale.setScalar(1 + stage * 0.06)));
          api.add(P.backdrop(6, 7, i => P.mountain(0x7a8a9a, 3 + (i % 2), 2.6)));
          api.memento('shell', 0x49b2e8, new THREE.Vector3(1.9, 0.1, 1.4), 'A tin cup crusted white with minerals. Someone drank the spring water. Someone was probably fine.');
          return { spawnPoint: new THREE.Vector3(0.6, 0, 1.4) };
        }
      },

      jolteon: {
        consequence: 'spireStruck',
        name: 'Thunderhead Aerie', mood: 'The summit ledge where the clouds arrive charged. Jolteon considers this home turf.',
        floor: { radius: 3.8, color: 0x4c5260 }, weather: ['storm', 'static', 'clear'], life: 'sparks',
        lights: { hemiSky: 0xc9d4ee, hemiGround: 0x1c2130, hemiIntensity: 0.42, keyColor: 0xf0f4ff, keyIntensity: 0.8, keyPos: [-2, 9, 1] },
        variants: [{ id: 'cloudsea', label: 'Cloud Sea' }, { id: 'thunderhead', label: 'Thunderhead', keyIntensity: 0.3, hemiIntensity: 0.2 }],
        stages: [{ id: 'still-air', label: 'Still Air' }, { id: 'charged', label: 'Air Charged' }, { id: 'struck', label: 'Struck' }, { id: 'storm-perch', label: 'Storm Perch' }],
        mementoLabel: 'a fulgurite',
        build(api) {
          // Cloud sea below the ledge; a lightning-scarred spire with a conductor pinnacle.
          const clouds = new THREE.Group(); for (let i = 0; i < 14; i++) { const c = new THREE.Mesh(new THREE.SphereGeometry(0.7 + (i % 3) * 0.3, 8, 6), api.FX.Materials.cloth(0xe9eef8)); const a = i * 0.45, r = 4.6 + (i % 4) * 0.5; c.position.set(Math.cos(a) * r, -0.5 + (i % 2) * 0.2, Math.sin(a) * r); c.scale.y = 0.5; clouds.add(c); } api.add(clouds);
          const spire = new THREE.Mesh(new THREE.ConeGeometry(0.5, 3.2, 6), api.FX.Materials.stone(0x3a3f4b)); spire.position.set(0, 1.6, -2.2); api.add(P.shadowed(spire));
          const rod = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 1.2, 6), api.FX.Materials.metal(0xd9dde3)); rod.position.set(0, 3.8, -2.2); api.add(rod);
          const tip = P.orb(0xfff066, 0.08, 0.3); tip.position.set(0, 4.4, -2.2); api.add(tip);
          const bolt = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.06, 5, 4), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0 })); api.own(bolt.material); bolt.position.set(0, 6.5, -2.2); api.add(bolt);
          const flash = new THREE.PointLight(0xe8f0ff, 0, 12); flash.position.set(0, 4.4, -2.2); api.add(flash);
          const scars = []; for (let i = 0; i < 6; i++) { const s = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.9, 0.04), api.FX.Materials.emissiveAccent(0xfff066, 0.1)); const a = i * 1.05; s.position.set(Math.cos(a) * 0.45, 1.6 + (i % 2) * 0.4, -2.2 + Math.sin(a) * 0.45); s.rotation.z = 0.3 - (i % 3) * 0.3; api.add(s); scars.push(s); }
          let strike = 0, stageLevel = 0;
          api.prop(spire, 'emberpeak_jolteon_spire', 'the storm spire', { struck: true }, () => { strike = 1; });
          api.onUpdate((dt, t) => {
            strike = Math.max(0, strike - dt * 1.4);
            const on = strike > 0.6 ? 1 : (strike > 0.4 && strike < 0.5 ? 0.6 : 0);
            bolt.material.opacity = on; flash.intensity = on * 5 + stageLevel * 0.1;
            tip.material.emissiveIntensity = 0.3 + stageLevel * 0.3 + Math.max(0, Math.sin(t * 6)) * 0.4 + on * 2;
            scars.forEach(s => { s.material.emissiveIntensity = 0.1 + stageLevel * 0.25 + strike * 1.5; });
            clouds.rotation.y += dt * 0.03;
          });
          api.onStage(stage => { stageLevel = stage; });
          api.particles(api.FX.VFX.sparks({ area: [6, 4, 6], baseY: 0.5, count: 20 }));
          api.memento('tag', 0xfee033, new THREE.Vector3(1.5, 0.1, 1.2), 'A fulgurite — sand fused to glass by a strike. It is shaped, roughly, like a very smug fox.');
          return { spawnPoint: new THREE.Vector3(0, 0, 1.2) };
        }
      },

      flareon: {
        name: 'Caldera Heart', mood: 'The old volcano\'s floor. Cooled, mostly. Flareon sleeps directly on the warm part.',
        floor: { radius: 4.4, color: 0x3a2a26 }, weather: ['heat-haze', 'embers', 'clear'], life: 'embers',
        lights: { hemiSky: 0xffb08a, hemiGround: 0x2a0d08, hemiIntensity: 0.4, keyColor: 0xff8a4a, keyIntensity: 0.8, keyPos: [0, 9, 3] },
        variants: [{ id: 'smoulder', label: 'Smoulder' }, { id: 'vent-glow', label: 'Vent Glow', keyIntensity: 0.3, hemiIntensity: 0.2 }],
        stages: [{ id: 'crust', label: 'Cooled Crust' }, { id: 'stirred', label: 'Magma Stirred' }, { id: 'venting', label: 'Venting' }, { id: 'hearthstone', label: 'Hearthstone' }],
        mementoLabel: 'an obsidian shard',
        build(api) {
          const lavaMat = api.own(api.FX.createWaterMaterial(0xff5a1f));
          const lava = new THREE.Mesh(new THREE.RingGeometry(3.0, 4.4, 40), lavaMat); lava.rotation.x = -Math.PI / 2; lava.position.y = 0.02; api.add(lava);
          const cracks = []; for (let i = 0; i < 7; i++) { const c = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.02, 1.4 + (i % 3) * 0.5), api.FX.Materials.emissiveAccent(0xff6a1f, 0.4)); const a = i * 0.9; c.position.set(Math.cos(a) * 1.6, 0.02, Math.sin(a) * 1.6); c.rotation.y = -a + 0.4; api.add(c); cracks.push(c); }
          const basalt = []; for (let i = 0; i < 8; i++) { const b = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.28, 0.6 + (i % 3) * 0.5, 6), api.FX.Materials.stone(0x2b2220)); const a = i * 0.78 + 0.3; b.position.set(Math.cos(a) * 2.6, b.geometry.parameters.height / 2, Math.sin(a) * 2.6); api.add(P.shadowed(b)); basalt.push(b); }
          const core = P.orb(0xff7a2f, 0.5, 0.6); core.position.set(0, 0.5, -1.2); api.add(core);
          const coreLight = new THREE.PointLight(0xff6a2f, 0.6, 7); coreLight.position.set(0, 1.2, -1.2); api.add(coreLight);
          const embers = api.particles(api.FX.VFX.embers({ area: [8, 4, 8], baseY: 0.5, count: 34 }));
          let stir = 0, stageLevel = 0;
          api.prop(core, 'emberpeak_flareon_core', 'the magma core', { stirred: true }, () => { stir = 1; });
          api.onUpdate((dt, t) => {
            stir = Math.max(0, stir - dt * 0.3);
            const level = stageLevel * 0.25 + stir;
            core.material.emissiveIntensity = 0.6 + level * 1.2 + Math.sin(t * 2) * 0.1;
            coreLight.intensity = 0.6 + level * 1.6;
            cracks.forEach((c, i) => { c.material.emissiveIntensity = 0.4 + level + Math.sin(t * 3 + i) * 0.2; });
            embers.points.material.opacity = 0.4 + level * 0.4;
          });
          api.onStage(stage => { stageLevel = stage; });
          api.add(P.backdrop(8, 6.8, i => P.rock(0x2b2220, 1.4 + (i % 2) * 0.6)));
          api.memento('frame', 0xf76835, new THREE.Vector3(1.8, 0.12, 1.4), 'An obsidian shard, glass-black and warm. It has been used as a mirror by someone with very fluffy ears.');
          return { spawnPoint: new THREE.Vector3(0, 0, 1.3), topology: { sleepSpots: [new THREE.Vector3(1.0, 0, -0.4)] } };
        }
      },

      espeon: {
        name: 'Fallen Sky-Temple', mood: 'The temple fell. Some of it is still falling, very slowly, held up by nothing anyone can see.',
        floor: { radius: 4.4, color: 0xcfc6de }, weather: ['aurora', 'clear', 'mist'], life: 'wisps',
        lights: { hemiSky: 0xe8dcff, hemiGround: 0x2e2a44, hemiIntensity: 0.5, keyColor: 0xf3dcff, keyIntensity: 0.8, keyPos: [-3, 9, 2] },
        variants: [{ id: 'dawnlight', label: 'Dawnlight' }, { id: 'suspension', label: 'Suspension', keyColor: 0xc99cff, hemiIntensity: 0.3 }],
        stages: [{ id: 'fallen', label: 'Fallen' }, { id: 'held', label: 'Held' }, { id: 'rising', label: 'Rising' }, { id: 'restored', label: 'Restored in Mind' }],
        mementoLabel: 'a temple key',
        build(api) {
          const psy = api.own(api.FX.createPsychicMaterial(0xd09cf5));
          const shards = []; for (let i = 0; i < 12; i++) { const s = P.slab(0.5 + (i % 3) * 0.3, 0.14, 0.4 + (i % 2) * 0.3, 0xd7cfe6); const a = i * 0.52, r = 1.2 + (i % 4) * 0.6; s.position.set(Math.cos(a) * r, 0.9 + (i % 5) * 0.4, Math.sin(a) * r); s.rotation.set(Math.sin(i) * 0.4, a, Math.cos(i) * 0.3); s.userData.base = s.position.clone(); api.add(s); shards.push(s); }
          const altar = new THREE.Mesh(new THREE.CylinderGeometry(0.6, 0.7, 0.9, 8), api.FX.Materials.stone(0xbeb2d6)); altar.position.set(0, 0.45, -1.4); api.add(P.shadowed(altar));
          const eye = new THREE.Mesh(new THREE.SphereGeometry(0.28, 16, 16), psy); eye.position.set(0, 1.3, -1.4); api.add(eye);
          const columns = []; for (let i = 0; i < 5; i++) { const c = P.pillar(0xd7cfe6, 1.4 + (i % 3) * 0.7, 0.16, i % 2 === 0); const a = i * 1.25 + 0.3; c.position.set(Math.cos(a) * 3.4, 0, Math.sin(a) * 3.4); api.add(c); columns.push(c); }
          let lift = 0, stageLevel = 0;
          api.prop(altar, 'emberpeak_espeon_altar', 'the temple altar', { lifted: true }, () => { lift = 1; });
          api.onUpdate((dt, t) => {
            psy.uniforms.uTime.value = t;
            lift = Math.max(0, lift - dt * 0.25);
            shards.forEach((s, i) => { const b = s.userData.base; s.position.y = b.y + Math.sin(t * 0.7 + i) * 0.08 + lift * 0.8 + stageLevel * 0.15; s.rotation.y += dt * (0.05 + lift * 0.6); });
            eye.rotation.y += dt * 0.4; eye.scale.setScalar(1 + lift * 0.3);
          });
          api.onStage(stage => { stageLevel = stage; columns.forEach(c => { c.rotation.z *= stage >= 2 ? 0.3 : 1; }); });
          api.particles(api.FX.VFX.motes({ area: [8, 4, 8], baseY: 0.6, count: 26 }));
          api.add(P.backdrop(6, 8, i => P.mountain(0x8a86a8, 4 + (i % 2), 2.8)));
          api.memento('tag', 0xc68fed, new THREE.Vector3(1.9, 0.1, 1.5), 'A temple key that fits no door. Espeon looked at it once and the key got warm.');
          return { spawnPoint: new THREE.Vector3(0, 0, 1.2) };
        }
      },

      umbreon: {
        consequence: 'lanternsLit',
        name: 'Lantern Monastery', mood: 'A cliffside monastery lit by a hundred paper lanterns, kept by no one now but the moon.',
        floor: { radius: 4.2, color: 0x2c2a33 }, weather: ['moon-haze', 'clear', 'mist'], life: 'fireflies',
        lights: { hemiSky: 0x55608a, hemiGround: 0x0a0a12, hemiIntensity: 0.3, keyColor: 0x8899ff, keyIntensity: 0.45, keyPos: [2, 7, -3] },
        variants: [{ id: 'vigil', label: 'Vigil' }, { id: 'lantern-festival', label: 'Lantern Festival', keyColor: 0xffb070, hemiIntensity: 0.32 }],
        stages: [{ id: 'unlit', label: 'Lanterns Dark' }, { id: 'first-light', label: 'First Lantern' }, { id: 'aglow', label: 'Courtyard Aglow' }, { id: 'kept', label: 'Vigil Kept' }],
        mementoLabel: 'a monk\'s bell',
        build(api) {
          const pagoda = new THREE.Group();
          for (let i = 0; i < 3; i++) { const roof = new THREE.Mesh(new THREE.ConeGeometry(1.4 - i * 0.3, 0.5, 4), api.FX.Materials.wood(0x3a2530)); roof.position.y = 1.2 + i * 0.9; roof.rotation.y = Math.PI / 4; pagoda.add(P.shadowed(roof)); const body = new THREE.Mesh(new THREE.BoxGeometry(1.4 - i * 0.3, 0.7, 1.4 - i * 0.3), api.FX.Materials.stone(0x4a4452)); body.position.y = 0.75 + i * 0.9; pagoda.add(P.shadowed(body)); }
          pagoda.position.set(0, 0, -2.4); api.add(pagoda);
          const lanterns = []; for (let i = 0; i < 14; i++) { const l = new THREE.Mesh(new THREE.SphereGeometry(0.11, 8, 8), api.FX.Materials.emissiveAccent(0xffb070, 0.08)); const a = i * 0.45, r = 1.6 + (i % 3) * 0.8; l.position.set(Math.cos(a) * r, 1.6 + (i % 4) * 0.35, Math.sin(a) * r); l.userData.seed = i; api.add(l); lanterns.push(l); }
          const light = new THREE.PointLight(0xffb070, 0, 8); light.position.set(0, 2, 0); api.add(light);
          const bell = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.32, 0.5, 12), api.FX.Materials.metal(0x8c7a4a)); bell.position.set(1.8, 1.0, -0.6);
          const frame = P.arch(0x3a2530, 0.9, 1.4); frame.position.set(1.8, 0, -0.6); api.add(frame);
          const moon = P.orb(0xf3f0ff, 0.45, 0.7); moon.position.set(-3, 4.2, -4); api.add(moon);
          let toll = api.region.get('lanternsLit') ? 0.6 : 0, stageLevel = 0;
          api.prop(bell, 'emberpeak_umbreon_bell', 'the monastery bell', { tolled: true }, () => { toll = 1; });
          api.onUpdate((dt, t) => {
            toll = Math.max(api.region.get('lanternsLit') ? 0.35 : 0, toll - dt * 0.2);
            bell.rotation.z = Math.sin(t * 6) * 0.18 * Math.max(0, toll - 0.35);
            lanterns.forEach(l => { const flick = 0.85 + Math.sin(t * 3 + l.userData.seed) * 0.15; l.material.emissiveIntensity = (0.08 + stageLevel * 0.35 + toll * 1.0) * flick; l.position.y += Math.sin(t + l.userData.seed) * dt * 0.02; });
            light.intensity = stageLevel * 0.25 + toll * 0.9;
          });
          api.onStage(stage => { stageLevel = stage; });
          api.particles(api.FX.VFX.fireflies({ area: [7, 3, 7], baseY: 0.4, count: 18 }));
          api.add(P.backdrop(6, 7.5, i => P.mountain(0x2a2c3a, 4 + (i % 2), 2.5)));
          api.memento('tag', 0x8899ff, new THREE.Vector3(-1.8, 0.1, 1.5), 'A hand bell with no clapper. It still gets rung, every night, by something walking past it on purpose.');
          return { spawnPoint: new THREE.Vector3(0, 0, 1.2), topology: { sleepSpots: [new THREE.Vector3(-1.4, 0, -1.0)] } };
        }
      },

      leafeon: {
        name: 'Cloudforest Ledge', mood: 'Moss on everything, ferns in the fog, and a tree that grew through the temple wall on purpose.',
        floor: { radius: 4.6, color: 0x4f7a4a }, weather: ['mist', 'pollen', 'rain'], life: 'butterflies',
        lights: { hemiSky: 0xd6f2d6, hemiGround: 0x243a26, hemiIntensity: 0.55, keyColor: 0xeaffd8, keyIntensity: 0.75, keyPos: [3, 9, 3] },
        variants: [{ id: 'fogbank', label: 'Fogbank' }, { id: 'sunshaft', label: 'Sun Shafts', keyIntensity: 1.1, hemiIntensity: 0.4 }],
        stages: [{ id: 'mossed', label: 'Mossed Over' }, { id: 'unfurled', label: 'Ferns Unfurled' }, { id: 'through-wall', label: 'Through the Wall' }, { id: 'canopy-ledge', label: 'Canopy Ledge' }],
        mementoLabel: 'a moss-covered tile',
        build(api) {
          const wall = new THREE.Mesh(new THREE.BoxGeometry(3.4, 1.8, 0.4), api.FX.Materials.stone(0x7a8a72)); wall.position.set(0, 0.9, -2.6); api.add(P.shadowed(wall));
          const bigTree = P.tree(0x5a4632, 0x5fb051, 3.6); bigTree.position.set(0, 0, -2.6); api.add(bigTree);
          const ferns = []; for (let i = 0; i < 10; i++) { const f = new THREE.Group(); for (let k = 0; k < 5; k++) { const frond = new THREE.Mesh(new THREE.PlaneGeometry(0.12, 0.55), api.FX.Materials.foliage(0x74c15c)); frond.position.y = 0.25; frond.rotation.z = -0.5; frond.rotation.y = k * 1.256; f.add(frond); } const a = i * 0.63, r = 1.4 + (i % 3) * 0.8; f.position.set(Math.cos(a) * r, 0, Math.sin(a) * r); api.add(f); ferns.push(f); }
          const mossStones = []; for (let i = 0; i < 6; i++) { const m = P.rock(0x5f8a5a, 0.3); const a = i * 1.05 + 0.5; m.position.set(Math.cos(a) * 3.2, 0.1, Math.sin(a) * 3.2); api.add(m); mossStones.push(m); }
          const fog = api.particles(api.FX.VFX.dust({ area: [9, 2.5, 9], baseY: 0.3, count: 36, color: 0xffffff, size: 0.1, opacity: 0.25 }));
          const shafts = []; for (let i = 0; i < 3; i++) { const s = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.5, 5, 8, 1, true), new THREE.MeshBasicMaterial({ color: 0xfff7c8, transparent: true, opacity: 0.05, depthWrite: false, side: THREE.DoubleSide })); api.own(s.material); s.position.set(-1.5 + i * 1.5, 2.5, -0.5 + i * 0.4); s.rotation.z = 0.2; api.add(s); shafts.push(s); }
          let unfurl = 0, stageLevel = 0;
          api.prop(bigTree, 'emberpeak_leafeon_tree', 'the wall tree', { unfurled: true }, () => { unfurl = 1; });
          api.onUpdate((dt, t) => {
            unfurl = Math.max(0, unfurl - dt * 0.3);
            ferns.forEach((f, i) => { const k = 1 + stageLevel * 0.2 + unfurl * 0.6; f.scale.setScalar(k); f.rotation.y += dt * unfurl * 0.4; f.children.forEach((c, ci) => { c.rotation.z = -0.5 + Math.sin(t * 1.5 + i + ci) * 0.08; }); });
            shafts.forEach((s, i) => { s.material.opacity = 0.04 + stageLevel * 0.03 + unfurl * 0.12 + Math.sin(t * 0.5 + i) * 0.02; });
            fog.points.material.opacity = 0.25 - unfurl * 0.15;
          });
          api.onStage(stage => { stageLevel = stage; });
          api.toy('ball', 0x76b852, new THREE.Vector3(1.6, 0.22, 1.5));
          api.memento('notebook', 0x76b852, new THREE.Vector3(-1.8, 0.1, 1.5), 'A roof tile, furred green. Underneath the moss is a carving of a leaf, so the moss is arguably a restoration.');
          return { spawnPoint: new THREE.Vector3(0, 0, 1.2) };
        }
      },

      glaceon: {
        name: 'Glacier Pass', mood: 'A blue-ice corridor through the saddle. The crevasses sing when the wind is right.',
        floor: { radius: 4.2, color: 0xdff0f7 }, weather: ['snow', 'diamond-dust', 'clear'], life: 'crystals',
        lights: { hemiSky: 0xf2fbff, hemiGround: 0x2b4c66, hemiIntensity: 0.65, keyColor: 0xdff4ff, keyIntensity: 0.8, keyPos: [-3, 8, 2] },
        variants: [{ id: 'bluehour', label: 'Blue Hour' }, { id: 'ice-glare', label: 'Ice Glare', hemiIntensity: 0.95, keyIntensity: 1.1 }],
        stages: [{ id: 'silent', label: 'Silent Pass' }, { id: 'sung', label: 'Crevasse Sung' }, { id: 'crossed', label: 'Pass Crossed' }, { id: 'ice-road', label: 'Ice Road' }],
        mementoLabel: 'a climber\'s piton',
        build(api) {
          const iceMat = api.FX.Materials.ice(0xbfe6fb);
          const walls = []; for (let s = -1; s <= 1; s += 2) { for (let i = 0; i < 4; i++) { const w = new THREE.Mesh(new THREE.BoxGeometry(1.0, 2.4 + (i % 2), 1.6), iceMat); w.position.set(s * 3.0, 1.2, -2.4 + i * 1.6); w.rotation.y = s * 0.1; api.add(P.shadowed(w)); walls.push(w); } }
          const crevasse = new THREE.Mesh(new THREE.PlaneGeometry(0.5, 6), api.FX.Materials.emissiveAccent(0x2fa4ff, 0.3)); crevasse.rotation.x = -Math.PI / 2; crevasse.position.set(0.8, 0.02, 0); api.add(crevasse);
          const crystals = []; for (let i = 0; i < 8; i++) { const c = P.crystal(0x9be7ff, 0.5 + (i % 3) * 0.3, 0.12); const a = i * 0.78; c.position.set(Math.cos(a) * 2.2, 0, Math.sin(a) * 2.2); api.add(c); crystals.push(c); }
          const bridge = P.slab(1.4, 0.12, 0.6, 0xa9c7d6); bridge.position.set(0.8, 0.08, -1.0);
          const snow = api.particles(api.FX.VFX.snow({ area: [8, 4, 8], baseY: 2.8, count: 36 }));
          let sing = 0, stageLevel = 0;
          api.prop(bridge, 'emberpeak_glaceon_bridge', 'the ice bridge', { sung: true }, () => { sing = 1; });
          api.onUpdate((dt, t) => {
            sing = Math.max(0, sing - dt * 0.3);
            crevasse.material.emissiveIntensity = 0.3 + stageLevel * 0.25 + sing * 1.2 * (0.6 + Math.sin(t * 5) * 0.4);
            crystals.forEach((c, i) => { c.material.emissiveIntensity = 0.55 + stageLevel * 0.2 + Math.max(0, Math.sin(t * 4 - i * 0.6)) * sing; });
            snow.points.material.opacity = 0.6 + sing * 0.3;
          });
          api.onStage(stage => { stageLevel = stage; });
          api.add(P.backdrop(6, 8, i => P.mountain(0xe6f5fb, 4 + (i % 3), 2.8)));
          if (api.region.get('lanternsLit')) for (let i = 0; i < 5; i++) { const g = P.orb(0xffb070, 0.06, 1.4); g.position.set(3.5 + i * 0.5, 2.6 + i * 0.22, -6.2); api.add(g); }
          api.memento('tag', 0x8be5f5, new THREE.Vector3(-1.6, 0.1, 1.5), 'A piton hammered into the ice a very long time ago. The ice has since grown around it, protectively.');
          return { spawnPoint: new THREE.Vector3(0, 0, 1.4) };
        }
      },

      sylveon: {
        name: 'Windchime Sanctum', mood: 'The highest room. Every gust plays a different chord, and Sylveon has learned to tune the wind.',
        floor: { radius: 4.0, color: 0xe6d3dc }, weather: ['breeze', 'petals', 'clear'], life: 'ribbons',
        lights: { hemiSky: 0xffeaf3, hemiGround: 0x4f4050, hemiIntensity: 0.6, keyColor: 0xffe1ec, keyIntensity: 0.85, keyPos: [3, 9, 2] },
        variants: [{ id: 'hush', label: 'Hush' }, { id: 'gale', label: 'Chiming Gale', hemiIntensity: 0.4, keyColor: 0xd6c7ff }],
        stages: [{ id: 'silent', label: 'Chimes Silent' }, { id: 'first-chord', label: 'First Chord' }, { id: 'in-tune', label: 'In Tune' }, { id: 'wind-kept', label: 'Wind-Kept' }],
        mementoLabel: 'a single chime',
        build(api) {
          const dome = new THREE.Mesh(new THREE.SphereGeometry(4.2, 20, 12, 0, Math.PI * 2, 0, Math.PI / 2.4), new THREE.MeshToonMaterial({ color: 0xf4e3ea, side: THREE.BackSide, transparent: true, opacity: 0.55 })); api.own(dome.material); dome.position.y = 0.4; api.add(dome);
          for (let i = 0; i < 8; i++) { const p = P.pillar(0xe6d3dc, 2.6, 0.12); const a = i * 0.785; p.position.set(Math.cos(a) * 3.5, 0, Math.sin(a) * 3.5); api.add(p); }
          const chimes = []; for (let i = 0; i < 9; i++) { const g = new THREE.Group(); const a = i * 0.698, r = 1.6 + (i % 2) * 0.5; const tube = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.6 + (i % 4) * 0.2, 6), api.FX.Materials.metal(0xe8d5a8)); tube.position.y = -0.4; g.add(tube); const ribbon = new THREE.Mesh(new THREE.PlaneGeometry(0.08, 0.5), new THREE.MeshToonMaterial({ color: K.SPECIES_COLOR[K.SPECIES[i]], side: THREE.DoubleSide })); api.own(ribbon.material); ribbon.position.y = -0.9; g.add(ribbon); g.position.set(Math.cos(a) * r, 2.5, Math.sin(a) * r); g.userData.seed = i; api.add(g); chimes.push(g); }
          const bowl = new THREE.Mesh(new THREE.SphereGeometry(0.4, 16, 10, 0, Math.PI * 2, 0, Math.PI / 2), api.FX.Materials.metal(0xd9b86a)); bowl.rotation.x = Math.PI; bowl.position.set(0, 0.4, -1.2);
          const bowlRing = P.ring(0.5, 0.02, 0xffaec9, 0.2); bowlRing.position.set(0, 0.42, -1.2); api.add(bowlRing);
          let strike = 0, stageLevel = 0;
          api.prop(bowl, 'emberpeak_sylveon_bowl', 'the singing bowl', { rung: true }, () => { strike = 1; });
          api.onUpdate((dt, t) => {
            strike = Math.max(0, strike - dt * 0.2);
            chimes.forEach(g => { g.rotation.z = Math.sin(t * 2 + g.userData.seed) * (0.08 + strike * 0.5 + stageLevel * 0.04); g.rotation.x = Math.cos(t * 1.6 + g.userData.seed) * (0.06 + strike * 0.4); });
            bowlRing.scale.setScalar(1 + strike * 2.5); bowlRing.material.emissiveIntensity = 0.2 + strike * 1.5;
          });
          api.onStage(stage => { stageLevel = stage; });
          api.particles(api.FX.VFX.sparkles({ area: [7, 3, 7], baseY: 0.8, count: 22 }));
          api.add(P.backdrop(7, 9, i => P.mountain(0xb9c3d6, 5 + (i % 3), 3)));
          api.toy('plush', 0xffaec9, new THREE.Vector3(1.6, 0.15, 1.4));
          api.memento('ribbon', 0xffaec9, new THREE.Vector3(-1.6, 0.1, 1.5), 'A single chime, taken down so the chord could be re-tuned. It was, apparently, a quarter-tone selfish.');
          return { spawnPoint: new THREE.Vector3(0, 0, 1.2) };
        }
      }
    }
  });
})(window);
