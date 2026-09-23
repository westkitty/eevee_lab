/* ==========================================================================
   EXPANSION 01 — TIDEWILD COAST
   An archipelago region: salt wind, tide pools, sea caves, a lighthouse, a
   wrecked survey ship and a reef that glows at night. Hub: Driftwood Harbor.
   ========================================================================== */
(function (global) {
  'use strict';
  const THREE = global.THREE;
  const K = global.ExpansionKit;
  const P = K.P;

  function ease(t) { return t < 0 ? 0 : t > 1 ? 1 : t * t * (3 - 2 * t); }

  K.registerExpansion({
    id: 'tidewild',
    displayName: 'Tidewild Coast — Driftwood Harbor',
    tagline: 'A scattered archipelago reached by tide-gate.',
    mood: 'Salt wind, gull-cries and a harbor built out of whatever floated in.',
    doorColor: 0x3fc1c9,

    transition: 'tidewild',
    hub: {
      radius: 7.2, floorColor: 0xd9c9a6,
      weather: ['clear', 'mist', 'rain', 'breeze'], life: 'droplets',
      stages: [
        { id: 'landfall', label: 'Landfall' }, { id: 'moored', label: 'Boats Moored' },
        { id: 'charted', label: 'Islands Charted' }, { id: 'harbor-home', label: 'Harbor Home' }
      ],
      lights: { hemiSky: 0xd8f3ff, hemiGround: 0x4b6b6e, hemiIntensity: 0.6, keyColor: 0xfff3d0, keyIntensity: 0.95, keyPos: [6, 9, 3] },
      variants: [{ id: 'noon', label: 'Noon Glare' }, { id: 'goldhour', label: 'Gold Hour', keyColor: 0xffb070, hemiIntensity: 0.4 }],
      // Geography decides where each habitat is reached from:
      //  - the beach arc (south/east): tidepools, bonfire cove, mangroves
      //  - the pier head (north, out over water): drop-off, iceberg, wreck
      //  - the cliff foot (west): lighthouse, sea cave, tidal clock
      doorLayout() {
        return {
          eevee:    { x:  4.6, z:  3.2, ry: -0.95 },
          flareon:  { x:  5.9, z:  0.4, ry: -1.5 },
          leafeon:  { x:  2.4, z:  5.4, ry: -0.4 },
          vaporeon: { x: -1.3, y: 0, z: -5.9, ry: 0.2, scale: 0.9 },
          glaceon:  { x:  1.3, y: 0, z: -5.9, ry: -0.2, scale: 0.9 },
          sylveon:  { x:  0,   y: 0, z: -6.4, ry: 0, scale: 0.9 },
          jolteon:  { x: -5.6, z: -1.6, ry: 1.85 },
          umbreon:  { x: -6.0, z:  1.2, ry: 1.4 },
          espeon:   { x: -4.4, z:  3.8, ry: 1.0 },
          conservatory: { x: -2.6, z: 6.0, ry: 0.4 }
        };
      },
      build(api) {
        const region = api.region;
        // Sea beyond the sand; a long pier reaching north over it.
        const sea = P.waterDisk(14, 0x2f8fb0, -0.05); api.add(sea);
        const sand = new THREE.Mesh(new THREE.CircleGeometry(7.2, 48, Math.PI * 0.05, Math.PI * 1.05), api.FX.Materials.stone(0xd9c9a6));
        sand.rotation.x = -Math.PI / 2; sand.position.y = 0.0; api.add(sand);
        const pierMat = api.FX.Materials.wood(0x8a6a44);
        for (let i = 0; i < 14; i++) { const plank = new THREE.Mesh(new THREE.BoxGeometry(2.6, 0.08, 0.36), pierMat); plank.position.set(0, 0.04, -1.6 - i * 0.4); api.add(P.shadowed(plank)); }
        const pierHead = new THREE.Mesh(new THREE.BoxGeometry(4.2, 0.1, 2.0), pierMat); pierHead.position.set(0, 0.04, -6.2); api.add(P.shadowed(pierHead));
        for (let i = 0; i < 8; i++) { const post = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.11, 1.3, 7), pierMat); post.position.set(i % 2 ? 1.4 : -1.4, 0.25, -2 - Math.floor(i / 2) * 1.5); api.add(P.shadowed(post)); const rope = new THREE.Mesh(new THREE.TorusGeometry(0.16, 0.025, 6, 12), api.FX.Materials.cloth(0xe6d7b4)); rope.position.set(post.position.x, 0.85, post.position.z); rope.rotation.x = Math.PI / 2; api.add(rope); }
        // Cliff to the west with the lighthouse silhouette above the Jolteon door.
        for (let i = 0; i < 5; i++) { const r = P.rock(0x5d6a70, 1.2 + (i % 2) * 0.5); r.position.set(-6.8 + (i % 2) * 0.6, 0.6 + i * 0.35, -3.5 + i * 1.6); api.add(r); }
        const farTower = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.3, 2.0, 10), api.FX.Materials.stone(0xe8e2d6)); farTower.position.set(-7.4, 2.9, -2.2); api.add(farTower);
        const farLamp = P.orb(0xfff2a8, 0.14, region.get('lighthouseLit') ? 1.6 : 0.15); farLamp.position.set(-7.4, 4.0, -2.2); api.add(farLamp);
        const farBeam = new THREE.PointLight(0xfff2a8, region.get('lighthouseLit') ? 0.8 : 0, 9); farBeam.position.copy(farLamp.position); api.add(farBeam);
        // Boats moored along the pier appear as the region's setpieces are used.
        const boats = []; for (let i = 0; i < 4; i++) { const b = new THREE.Group(); const hull = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.35, 0.5), api.FX.Materials.wood([0xb8563f, 0x4f8fb0, 0xd9b36a, 0x6fa06a][i])); hull.position.y = 0.05; b.add(P.shadowed(hull)); const mast = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.03, 1.0, 5), pierMat); mast.position.y = 0.6; b.add(mast); b.position.set(i % 2 ? 2.2 : -2.2, -0.02, -2.6 - Math.floor(i / 2) * 2.4); b.visible = false; b.userData.seed = i; api.add(b); boats.push(b); }
        // Palms + driftwood on the beach; distant islands.
        for (let i = 0; i < 4; i++) { const t = P.tree(0xa07a4c, 0x5fb46a, 3.0 + (i % 2) * 0.6, 'palm'); t.position.set(3.2 + i * 0.9, 0, 4.6 - i * 1.4); api.add(t); }
        for (let i = 0; i < 6; i++) { const d = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.09, 0.9 + (i % 3) * 0.4, 6), api.FX.Materials.wood(0xbfa383)); d.rotation.z = Math.PI / 2; d.rotation.y = i * 0.9; d.position.set(1.5 + Math.cos(i) * 2.2, 0.08, 2.4 + Math.sin(i * 1.7) * 1.6); api.add(P.shadowed(d)); }
        api.add(P.backdrop(8, 13, i => P.mountain(i % 2 ? 0x5d7a86 : 0x77939c, 2.4 + (i % 3), 2.4)));
        // Mementos found across the coast wash up at the tide line.
        const washed = region.mementos(); washed.forEach((id, i) => { const m = api.RoomKit.memento(['shell', 'tag', 'ribbon', 'notebook'][i % 4], 0xf2e9d8); m.scale.setScalar(0.7); m.position.set(-1.4 + i * 0.7, 0.06, 1.0 + Math.sin(i) * 0.3); api.add(m); });

        // Anchor: the harbor bell buoy at the pier head. Ringing it also rolls a swell along the pier.
        const buoy = new THREE.Group();
        const body = new THREE.Mesh(new THREE.ConeGeometry(0.45, 1.3, 10), api.FX.Materials.cloth(0xe8523f)); body.position.y = 0.65;
        const bell = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.18, 0.22, 10), api.FX.Materials.metal(0xd9b36a)); bell.position.y = 1.45;
        buoy.add(P.shadowed(body), P.shadowed(bell)); buoy.position.set(2.8, 0, -6.0);
        let ring = 0, swell = 0;
        api.curio(buoy, 'tidewild_bell', 'the harbor bell', 'tidewild_bell_rung', 'Rang the harbor bell — every gull on the coast objected.', () => { ring = 1; swell = 1; });
        const mist = api.particles(api.FX.VFX.droplets({ area: [14, 3, 14], baseY: 2.2, count: 22 }));
        const gulls = api.particles(api.FX.VFX.dust({ area: [10, 1, 10], baseY: 4.2, count: 6, color: 0xffffff, size: 0.12, opacity: 0.8 }));
        api.onUpdate((dt, t) => {
          ring = Math.max(0, ring - dt * 0.6); swell = Math.max(0, swell - dt * 0.4);
          buoy.rotation.z = Math.sin(t * 1.3) * 0.06 + Math.sin(t * 9) * 0.12 * ring;
          boats.forEach(b => { b.rotation.z = Math.sin(t * 1.1 + b.userData.seed) * 0.05 + Math.sin(t * 4 + b.position.z) * 0.12 * swell; b.position.y = -0.02 + Math.sin(t * 0.9 + b.userData.seed) * 0.03; });
          gulls.points.rotation.y += dt * 0.15;
          farLamp.material.emissiveIntensity = region.get('lighthouseLit') ? 1.2 + Math.max(0, Math.sin(t * 1.4)) * 0.8 : 0.15;
        });
        return {
          applyStage(stage) { boats.forEach((b, i) => { b.visible = i < stage + Math.min(1, region.setpieceUses('tidewild_vaporeon')); }); }
        };
      }
    },

    rooms: {
      eevee: {
        name: 'Tidepool Shallows', mood: 'Knee-deep rock pools. Everything here is small, bright and worth poking.',
        floor: { radius: 4.4, color: 0xc7b48c }, weather: ['clear', 'breeze', 'mist'], life: 'motes',
        lights: { hemiSky: 0xe6f7ff, hemiGround: 0x6b6f5c, hemiIntensity: 0.6, keyColor: 0xfff6dc, keyIntensity: 1.0, keyPos: [4, 7, 3] },
        variants: [{ id: 'lowtide', label: 'Low Tide' }, { id: 'hightide', label: 'High Tide', keyColor: 0xa9dcff, hemiIntensity: 0.45 }],
        stages: [{ id: 'poked', label: 'First Pool Poked' }, { id: 'stirred', label: 'Pools Stirred' }, { id: 'mapped', label: 'Every Pool Known' }, { id: 'tide-kept', label: 'Tide-Kept' }],
        mementoLabel: 'a pocket of sea glass',
        build(api) {
          const pools = [];
          for (let i = 0; i < 5; i++) {
            const a = (i / 5) * Math.PI * 2 + 0.6;
            const pool = P.waterDisk(0.55 + (i % 2) * 0.2, 0x4fc3d8, 0.03);
            pool.position.set(Math.cos(a) * 2.2, 0.03, Math.sin(a) * 2.2);
            api.add(pool); pools.push(pool);
            const rim = P.rock(0x9a8f78, 0.22); rim.position.set(Math.cos(a) * 2.9, 0.1, Math.sin(a) * 2.9); api.add(rim);
            const star = new THREE.Mesh(new THREE.CircleGeometry(0.12, 5), api.FX.Materials.emissiveAccent([0xff7f50, 0xffd166, 0xef476f][i % 3], 0.4));
            star.rotation.x = -Math.PI / 2; star.position.set(pool.position.x + 0.1, 0.05, pool.position.z - 0.1); api.add(star);
          }
          // Setpiece: the big anemone pool — tap it and every anemone closes then reopens.
          const big = P.waterDisk(1.1, 0x36b0cc, 0.03); big.position.set(0, 0.03, -1.2); 
          const anemones = [];
          for (let i = 0; i < 7; i++) {
            const an = new THREE.Mesh(new THREE.ConeGeometry(0.07, 0.24, 6), api.FX.Materials.emissiveAccent(0xff8fb1, 0.5));
            const a = i * 0.9; an.position.set(Math.cos(a) * 0.55, 0.12, -1.2 + Math.sin(a) * 0.55); api.add(an); anemones.push(an);
          }
          let shy = 0;
          api.prop(big, 'tidewild_eevee_pool', 'the anemone pool', { pokedPool: true }, () => { shy = 1; });
          api.onUpdate((dt, t) => {
            shy = Math.max(0, shy - dt * 0.5);
            anemones.forEach((an, i) => { an.scale.y = 1 - ease(shy) * 0.75 + Math.sin(t * 2 + i) * 0.05; an.position.y = 0.12 * an.scale.y; });
          });
          api.onStage(stage => anemones.forEach(an => { an.material.emissiveIntensity = 0.5 + stage * 0.25; }));
          // Smoke from Bonfire Cove is visible over the headland once Flareon has lit it.
          if (api.region.get('bonfireLit')) { const smoke = api.particles(api.FX.VFX.dust({ area: [0.8, 3, 0.8], baseY: 1.5, count: 16, color: 0xd8d8d8, size: 0.14, opacity: 0.35 })); smoke.points.position.set(4.2, 0, -3.0); const glow = P.orb(0xff7a2f, 0.08, 1.2); glow.position.set(4.2, 0.6, -3.0); api.add(glow); }
          api.toy('ball', 0xffd166, new THREE.Vector3(1.6, 0.22, 1.3));
          api.memento('shell', 0x9fe3e8, new THREE.Vector3(-1.9, 0.1, 1.5), 'Sea glass, tumbled soft, in nine colours. Someone was collecting one of each.');
          api.particles(api.FX.VFX.droplets({ area: [7, 2, 7], baseY: 1.6, count: 12 }));
          return { spawnPoint: new THREE.Vector3(0.4, 0, 1.0), topology: { sleepSpots: [new THREE.Vector3(1.8, 0, -1.6)] } };
        }
      },

      vaporeon: {
        consequence: 'reefDived',
        name: 'Glassreef Drop-off', mood: 'The reef falls away into blue. Vaporeon has been down there and back, twice.',
        floor: { radius: 4.6, color: 0x2a6f86 }, weather: ['mist', 'rain', 'drizzle'], life: 'droplets',
        lights: { hemiSky: 0x9fe6ff, hemiGround: 0x0b3448, hemiIntensity: 0.48, keyColor: 0x6fd7ff, keyIntensity: 0.9, keyPos: [2, 7, 4] },
        variants: [{ id: 'sunlit', label: 'Sunlit Reef' }, { id: 'deepblue', label: 'Deep Blue', keyColor: 0x2a7fd0, hemiIntensity: 0.28 }],
        stages: [{ id: 'surface', label: 'Surface Only' }, { id: 'dived', label: 'First Dive' }, { id: 'reef-lit', label: 'Reef Lit' }, { id: 'depth-known', label: 'The Depth Known' }],
        mementoLabel: 'a diver\'s slate',
        build(api) {
          const water = P.waterDisk(3.6, 0x2f9fd0, 0.04); api.add(water);
          const corals = [];
          for (let i = 0; i < 14; i++) {
            const a = i * 0.45, r = 1.2 + (i % 4) * 0.55;
            const c = new THREE.Mesh(i % 3 === 0 ? new THREE.TorusKnotGeometry(0.12, 0.04, 30, 6) : new THREE.ConeGeometry(0.1, 0.4, 5), api.FX.Materials.emissiveAccent([0xff6b9d, 0xffb347, 0x9b5de5, 0x00f5d4][i % 4], 0.35));
            c.position.set(Math.cos(a) * r, 0.18, Math.sin(a) * r); api.add(c); corals.push(c);
          }
          // Setpiece: the drop-off ledge; a shoal of light-fish circles when called.
          const ledge = P.slab(2.2, 0.3, 1.0, 0x8fa8ab); ledge.position.set(0, 0.15, -1.6);
          const shoal = api.FX.VFX.sparkles({ area: [2.6, 0.6, 2.6], baseY: 0.3, count: 40, color: 0xbff7ff, size: 0.05 });
          api.particles(shoal);
          shoal.points.position.set(0, 0, -1.6);
          let shoalSpin = 0;
          api.prop(ledge, 'tidewild_vaporeon_ledge', 'the drop-off ledge', { dived: true }, () => { shoalSpin = 1; });
          api.onUpdate((dt, t) => {
            shoalSpin = Math.max(0, shoalSpin - dt * 0.35);
            shoal.points.rotation.y += dt * (0.3 + shoalSpin * 3.5);
            shoal.points.material.opacity = 0.35 + shoalSpin * 0.6;
            corals.forEach((c, i) => { c.rotation.y = Math.sin(t * 0.7 + i) * 0.15; });
          });
          api.onStage(stage => corals.forEach(c => { c.material.emissiveIntensity = 0.35 + stage * 0.3; }));
          api.memento('tag', 0x49b2e8, new THREE.Vector3(1.9, 0.1, 1.6), 'A diver\'s slate: "Depth 40 — it just kept going. V. went further."');
          api.add(P.backdrop(6, 7, i => P.mountain(0x1e5a70, 2 + (i % 2), 2.5)));
          return { spawnPoint: new THREE.Vector3(0, 0, 1.4) };
        }
      },

      jolteon: {
        consequence: 'lighthouseLit',
        name: 'Stormwatch Lighthouse', mood: 'The lamp still turns. The storms come to it, not the other way round.',
        floor: { radius: 4.0, color: 0x5d6068 }, weather: ['storm', 'static', 'rain', 'clear'], life: 'sparks',
        lights: { hemiSky: 0xb9c6dd, hemiGround: 0x1b2230, hemiIntensity: 0.38, keyColor: 0xfff5c2, keyIntensity: 0.7, keyPos: [-3, 8, 2] },
        variants: [{ id: 'squall', label: 'Squall' }, { id: 'lampnight', label: 'Lamp Night', keyIntensity: 0.25, hemiIntensity: 0.16 }],
        stages: [{ id: 'dark', label: 'Lamp Dark' }, { id: 'lit', label: 'Lamp Lit' }, { id: 'sweeping', label: 'Beam Sweeping' }, { id: 'stormcaller', label: 'Stormcaller' }],
        mementoLabel: 'a keeper\'s logbook',
        build(api) {
          const towerMat = api.FX.Materials.stone(0xe8e2d6);
          const tower = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.75, 3.2, 14), towerMat); tower.position.set(0, 1.6, -2.0); api.add(P.shadowed(tower));
          const band = new THREE.Mesh(new THREE.CylinderGeometry(0.62, 0.62, 0.5, 14), api.FX.Materials.cloth(0xd8322d)); band.position.set(0, 1.4, -2.0); api.add(band);
          const cage = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.5, 0.6, 10, 1, true), api.FX.Materials.glass(0xdff6ff, 0.35)); cage.position.set(0, 3.5, -2.0); api.add(cage);
          const lamp = P.orb(0xfff2a8, 0.22, 0.2); lamp.position.set(0, 3.5, -2.0); api.add(lamp);
          const beam = new THREE.Mesh(new THREE.ConeGeometry(0.9, 5, 12, 1, true), new THREE.MeshBasicMaterial({ color: 0xfff2a8, transparent: true, opacity: 0, side: THREE.DoubleSide, depthWrite: false }));
          api.own(beam.material);
          beam.rotation.z = Math.PI / 2; beam.position.set(2.5, 3.5, -2.0);
          const beamPivot = new THREE.Group(); beamPivot.position.set(0, 3.5, -2.0); beam.position.set(2.5, 0, 0); beamPivot.add(beam); api.add(beamPivot);
          const lampLight = new THREE.PointLight(0xfff2a8, 0, 7); lampLight.position.set(0, 3.5, -2.0); api.add(lampLight);
          // Rods on the rocks, and the storm-rail the keeper used to ground the strikes.
          for (let i = 0; i < 5; i++) { const rod = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 1.2, 5), api.FX.Materials.metal(0x9aa3ad)); const a = i * 1.25; rod.position.set(Math.cos(a) * 3.1, 0.6, Math.sin(a) * 3.1); api.add(rod); }
          api.add(P.backdrop(7, 6.5, i => P.rock(0x3d434d, 0.9 + (i % 3) * 0.4)));
          let power = 0, surge = 0, stageLevel = 0;
          const rail = new THREE.Mesh(new THREE.TorusGeometry(1.1, 0.05, 8, 40), api.FX.Materials.metal(0x7b8794)); rail.rotation.x = Math.PI / 2; rail.position.set(0, 0.08, 0.2);
          api.prop(rail, 'tidewild_jolteon_rail', 'the storm rail', { lampLit: true }, () => { surge = 1; });
          api.onUpdate((dt, t) => {
            surge = Math.max(0, surge - dt * 0.4);
            power = Math.max(stageLevel * 0.33, surge);
            lamp.material.emissiveIntensity = 0.2 + power * 1.6;
            lampLight.intensity = power * 1.6;
            beam.material.opacity = power * 0.22;
            beamPivot.rotation.y += dt * (0.4 + power * 1.4);
          });
          api.onStage(stage => { stageLevel = stage; });
          api.particles(api.FX.VFX.sparks({ area: [7, 4, 7], baseY: 0.6, count: 16 }));
          api.particles(api.FX.VFX.droplets({ area: [8, 4, 8], baseY: 3.0, count: 26 }));
          api.memento('notebook', 0xfee033, new THREE.Vector3(1.6, 0.1, 1.2), 'The keeper\'s log, last entry: "Lamp lit itself tonight. Yellow one on the gallery, tail straight up."');
          return { spawnPoint: new THREE.Vector3(0, 0, 1.5) };
        }
      },

      flareon: {
        consequence: 'bonfireLit',
        name: 'Bonfire Cove', mood: 'A sheltered cove where the driftwood fire never quite goes out.',
        floor: { radius: 4.4, color: 0xd9c092 }, weather: ['clear', 'embers', 'breeze'], life: 'embers',
        lights: { hemiSky: 0xffd7b0, hemiGround: 0x4a2f22, hemiIntensity: 0.42, keyColor: 0xff9a5c, keyIntensity: 0.85, keyPos: [-4, 6, 3] },
        variants: [{ id: 'dusk', label: 'Cove Dusk' }, { id: 'embernight', label: 'Ember Night', keyIntensity: 0.3, hemiIntensity: 0.18 }],
        stages: [{ id: 'ashes', label: 'Cold Ashes' }, { id: 'kindled', label: 'Kindled' }, { id: 'roaring', label: 'Roaring' }, { id: 'everburn', label: 'Everburn' }],
        mementoLabel: 'a marshmallow stick',
        build(api) {
          const sea = P.waterDisk(9, 0x2f7fa8, -0.06); sea.position.z = 3.5; api.add(sea);
          const logs = new THREE.Group();
          for (let i = 0; i < 5; i++) { const l = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.11, 1.1, 7), api.FX.Materials.wood(0x5a4030)); l.rotation.z = Math.PI / 2 - 0.5; l.rotation.y = i * 1.26; l.position.y = 0.25; logs.add(P.shadowed(l)); }
          logs.position.set(0, 0, -0.8); api.add(logs);
          const flame = new THREE.Mesh(new THREE.ConeGeometry(0.35, 1.0, 8), api.FX.Materials.emissiveAccent(0xff7a2f, 1.2)); flame.position.set(0, 0.8, -0.8); api.add(flame);
          const flameIn = new THREE.Mesh(new THREE.ConeGeometry(0.18, 0.7, 8), api.FX.Materials.emissiveAccent(0xffe066, 1.6)); flameIn.position.set(0, 0.7, -0.8); api.add(flameIn);
          const fireLight = new THREE.PointLight(0xff8a3d, 0.4, 6); fireLight.position.set(0, 1.2, -0.8); api.add(fireLight);
          for (let i = 0; i < 4; i++) { const seat = P.rock(0x9c8b70, 0.36); const a = 0.8 + i * 1.2; seat.position.set(Math.cos(a) * 1.9, 0.12, -0.8 + Math.sin(a) * 1.9); api.add(seat); }
          const cliff = P.backdrop(5, 6.4, i => P.rock(0x8a6f52, 1.6 + (i % 2) * 0.5)); cliff.position.z = -1.2; api.add(cliff);
          const embers = api.particles(api.FX.VFX.embers({ area: [1.4, 2.4, 1.4], baseY: 0.8, count: 30 })); embers.points.position.set(0, 0, -0.8);
          let heat = 0, stageLevel = 0;
          api.prop(logs, 'tidewild_flareon_bonfire', 'the driftwood bonfire', { kindled: true }, () => { heat = 1; });
          api.onUpdate((dt, t) => {
            heat = Math.max(0, heat - dt * 0.25);
            const level = Math.max(0.15, stageLevel * 0.3, heat);
            const flick = 1 + Math.sin(t * 11) * 0.06 + Math.sin(t * 17) * 0.04;
            flame.scale.set(level * flick, level * 1.4 * flick, level * flick);
            flameIn.scale.copy(flame.scale).multiplyScalar(0.9);
            fireLight.intensity = 0.3 + level * 1.5 * flick;
            embers.points.material.opacity = 0.2 + level * 0.6;
          });
          api.onStage(stage => { stageLevel = stage; });
          api.toy('plush', 0xf76835, new THREE.Vector3(-1.8, 0.15, 1.2));
          api.memento('frame', 0xf76835, new THREE.Vector3(2.0, 0.12, 0.6), 'A toasting stick, charred at one end and gnawed at the other.');
          return { spawnPoint: new THREE.Vector3(0.6, 0, 1.2), topology: { sleepSpots: [new THREE.Vector3(1.3, 0, -0.2)] } };
        }
      },

      espeon: {
        name: 'Moonpull Tidal Clock', mood: 'A stone dial that the tide winds. Espeon reads it a day early.',
        floor: { radius: 4.2, color: 0xd6cfe6 }, weather: ['clear', 'aurora', 'mist'], life: 'wisps',
        lights: { hemiSky: 0xe8dcff, hemiGround: 0x33304a, hemiIntensity: 0.5, keyColor: 0xf3dcff, keyIntensity: 0.8, keyPos: [3, 8, -2] },
        variants: [{ id: 'slack', label: 'Slack Tide' }, { id: 'spring', label: 'Spring Tide', keyColor: 0xc99cff, hemiIntensity: 0.34 }],
        stages: [{ id: 'unread', label: 'Dial Unread' }, { id: 'turned', label: 'Dial Turned' }, { id: 'in-phase', label: 'In Phase' }, { id: 'foreseen', label: 'Foreseen' }],
        mementoLabel: 'a tide table',
        build(api) {
          const psy = api.own(api.FX.createPsychicMaterial(0xd09cf5));
          const dial = new THREE.Mesh(new THREE.CylinderGeometry(1.6, 1.7, 0.2, 32), api.FX.Materials.stone(0xbfb4d6)); dial.position.set(0, 0.1, -1.2); api.add(P.shadowed(dial));
          const glyphs = new THREE.Mesh(new THREE.RingGeometry(0.8, 1.45, 32), psy); glyphs.rotation.x = -Math.PI / 2; glyphs.position.set(0, 0.22, -1.2); api.add(glyphs);
          const hand = new THREE.Mesh(new THREE.BoxGeometry(1.3, 0.06, 0.12), api.FX.Materials.metal(0xc9b8ff)); hand.position.set(0, 0.28, -1.2); api.add(hand);
          const moon = P.orb(0xf5f0ff, 0.3, 0.6); moon.position.set(0, 3.2, -3.2); api.add(moon);
          const orbit = []; for (let i = 0; i < 3; i++) { const o = P.orb(0xc68fed, 0.07, 1.0); api.add(o); orbit.push(o); }
          const pillars = []; for (let i = 0; i < 6; i++) { const p = P.pillar(0xcac1d8, 1.6 + (i % 2) * 0.6, 0.14); const a = i * 1.047; p.position.set(Math.cos(a) * 3.3, 0, Math.sin(a) * 3.3); api.add(p); pillars.push(p); }
          const shallows = P.waterDisk(6, 0x8fc3e6, -0.04); api.add(shallows);
          let spin = 0, aim = 0;
          api.prop(dial, 'tidewild_espeon_dial', 'the tidal dial', { dialTurned: true }, () => { spin = 1; aim += Math.PI / 3; });
          api.onUpdate((dt, t) => {
            psy.uniforms.uTime.value = t;
            spin = Math.max(0, spin - dt * 0.5);
            hand.rotation.y += (aim - hand.rotation.y) * dt * 3;
            glyphs.rotation.z += dt * (0.08 + spin * 1.2);
            orbit.forEach((o, i) => { const a = t * (0.6 + spin) + i * 2.09; o.position.set(Math.cos(a) * 1.05, 0.5 + Math.sin(a * 2) * 0.1, -1.2 + Math.sin(a) * 1.05); });
            moon.position.y = 3.2 + Math.sin(t * 0.3) * 0.15;
          });
          api.onStage(stage => { moon.material.emissiveIntensity = 0.6 + stage * 0.35; moon.scale.setScalar(1 + stage * 0.1); });
          api.particles(api.FX.VFX.motes({ area: [7, 3, 7], baseY: 0.5, count: 22 }));
          api.memento('tag', 0xc68fed, new THREE.Vector3(1.8, 0.1, 1.4), 'A tide table with tomorrow\'s column already filled in. In pawprint.');
          return { spawnPoint: new THREE.Vector3(0, 0, 1.2) };
        }
      },

      umbreon: {
        name: 'Blackwater Sea Cave', mood: 'The tide comes in through the floor. The rings on the wall glow back.',
        floor: { radius: 4.0, color: 0x1a1f2a }, weather: ['moon-haze', 'mist', 'drizzle'], life: 'fireflies',
        lights: { hemiSky: 0x5a6a9a, hemiGround: 0x05070d, hemiIntensity: 0.28, keyColor: 0x8899ff, keyIntensity: 0.45, keyPos: [0, 6, 4] },
        variants: [{ id: 'ebb', label: 'Ebb' }, { id: 'phosphor', label: 'Phosphor Flood', keyColor: 0x4fe0c8, hemiIntensity: 0.18 }],
        stages: [{ id: 'unlit', label: 'Unlit' }, { id: 'rings-lit', label: 'Rings Lit' }, { id: 'echoing', label: 'Echoing' }, { id: 'night-tide', label: 'Night Tide' }],
        mementoLabel: 'a moon-shell',
        build(api) {
          const water = P.waterDisk(2.4, 0x0f3a4a, 0.02); api.add(water);
          const glow = new THREE.Mesh(new THREE.RingGeometry(2.4, 2.75, 40), api.FX.Materials.emissiveAccent(0x4fe0c8, 0.2)); glow.rotation.x = -Math.PI / 2; glow.position.y = 0.03; api.add(glow);
          const stalactites = []; for (let i = 0; i < 12; i++) { const s = new THREE.Mesh(new THREE.ConeGeometry(0.12 + (i % 3) * 0.05, 0.9 + (i % 4) * 0.4, 6), api.FX.Materials.stone(0x2b3140)); const a = i * 0.52, r = 1.2 + (i % 5) * 0.55; s.position.set(Math.cos(a) * r, 3.6 - (i % 4) * 0.2, Math.sin(a) * r); s.rotation.x = Math.PI; api.add(s); stalactites.push(s); }
          const rings = []; for (let i = 0; i < 5; i++) { const r = P.ring(0.28 + i * 0.05, 0.02, 0x8899ff, 0.1); r.rotation.x = 0; const a = i * 1.26; r.position.set(Math.cos(a) * 3.4, 1.2 + (i % 2) * 0.5, Math.sin(a) * 3.4); r.lookAt(0, r.position.y, 0); api.add(r); rings.push(r); }
          const walls = P.backdrop(9, 4.6, i => (i === 4 ? null : P.rock(0x252b38, 1.2 + (i % 2) * 0.6))); api.add(walls);
          // The cave mouth faces the lighthouse. If Jolteon has lit it, its beam sweeps past the opening.
          const mouth = new THREE.Mesh(new THREE.PlaneGeometry(2.2, 2.6), new THREE.MeshBasicMaterial({ color: 0x0c1a2a, side: THREE.DoubleSide })); api.own(mouth.material); mouth.position.set(0, 1.3, 4.5); api.add(mouth);
          const sweep = new THREE.Mesh(new THREE.PlaneGeometry(0.5, 2.6), new THREE.MeshBasicMaterial({ color: 0xfff2a8, transparent: true, opacity: 0, side: THREE.DoubleSide, depthWrite: false })); api.own(sweep.material); sweep.position.set(0, 1.3, 4.45); api.add(sweep);
          const lit = api.region.get('lighthouseLit', false);
          const fire = api.particles(api.FX.VFX.fireflies({ area: [6, 2.5, 6], baseY: 0.4, count: 20, color: 0x4fe0c8 }));
          let echo = 0, stageLevel = 0;
          api.prop(water, 'tidewild_umbreon_pool', 'the blackwater pool', { echoed: true }, () => { echo = 1; });
          api.onUpdate((dt, t) => {
            echo = Math.max(0, echo - dt * 0.3);
            rings.forEach((r, i) => { const wave = Math.max(0, Math.sin(t * 3 - i * 0.8)) * echo; r.material.emissiveIntensity = 0.1 + stageLevel * 0.3 + wave * 1.2; r.scale.setScalar(1 + wave * 0.3); });
            glow.material.emissiveIntensity = 0.2 + stageLevel * 0.25 + echo * 0.6;
            fire.points.material.opacity = 0.4 + echo * 0.5;
            if (lit) { const ph = (t * 0.35) % 1; sweep.position.x = -1.1 + ph * 2.2; sweep.material.opacity = Math.sin(ph * Math.PI) * 0.55; }
          });
          api.onStage(stage => { stageLevel = stage; });
          api.memento('shell', 0x8899ff, new THREE.Vector3(1.9, 0.1, 1.7), 'A moon-shell, ringed like Umbreon\'s legs. It hums very quietly at night.');
          return { spawnPoint: new THREE.Vector3(0, 0, 1.6), topology: { sleepSpots: [new THREE.Vector3(-1.9, 0, -1.4)] } };
        }
      },

      leafeon: {
        name: 'Mangrove Boardwalk', mood: 'Roots in salt, leaves in sun. The boardwalk was Leafeon\'s idea, apparently.',
        floor: { radius: 4.6, color: 0x5f8c58 }, weather: ['pollen', 'rain', 'clear'], life: 'butterflies',
        lights: { hemiSky: 0xd9ffd0, hemiGround: 0x2f4a30, hemiIntensity: 0.58, keyColor: 0xf6ffd6, keyIntensity: 0.9, keyPos: [3, 8, 4] },
        variants: [{ id: 'morning', label: 'Salt Morning' }, { id: 'greenrain', label: 'Green Rain', keyColor: 0xa9d9a0, hemiIntensity: 0.4 }],
        stages: [{ id: 'tangled', label: 'Tangled' }, { id: 'rooted', label: 'New Roots' }, { id: 'canopy', label: 'Canopy Closed' }, { id: 'grove-home', label: 'Grove Home' }],
        mementoLabel: 'a seed pod',
        build(api) {
          const brack = P.waterDisk(6, 0x3d7d6e, -0.04); api.add(brack);
          const plank = api.FX.Materials.wood(0x9a7a50);
          for (let i = 0; i < 12; i++) { const b = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.06, 0.28), plank); const a = -1.2 + i * 0.22; b.position.set(Math.cos(a) * 2.2, 0.06, Math.sin(a) * 2.2); b.rotation.y = -a; api.add(P.shadowed(b)); }
          const trees = [];
          for (let i = 0; i < 7; i++) {
            const g = new THREE.Group(); const a = i * 0.9, r = 2.9 + (i % 2) * 0.6;
            for (let k = 0; k < 4; k++) { const root = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.05, 0.9, 5), api.FX.Materials.wood(0x6d4b2b)); root.position.set(Math.cos(k * 1.57) * 0.25, 0.35, Math.sin(k * 1.57) * 0.25); root.rotation.z = Math.cos(k * 1.57) * 0.4; root.rotation.x = -Math.sin(k * 1.57) * 0.4; g.add(root); }
            const t = P.tree(0x6d4b2b, 0x66b04f, 2.4); t.position.y = 0.5; g.add(t); g.position.set(Math.cos(a) * r, 0, Math.sin(a) * r); api.add(g); trees.push(t);
          }
          // Setpiece: a seed-drum stump; tap it and the canopy sheds a cloud of pollen and the saplings jump a size.
          const stump = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.5, 0.5, 12), api.FX.Materials.wood(0x7a5a3a)); stump.position.set(0, 0.25, -1.0);
          const saplings = []; for (let i = 0; i < 5; i++) { const s = new THREE.Mesh(new THREE.ConeGeometry(0.12, 0.4, 5), api.FX.Materials.foliage(0x8fd66a)); const a = 0.4 + i * 1.2; s.position.set(Math.cos(a) * 1.3, 0.2, -1.0 + Math.sin(a) * 1.3); api.add(s); saplings.push(s); }
          const pollen = api.particles(api.FX.VFX.pollen({ area: [7, 3, 7], baseY: 1.5, count: 30 }));
          let burst = 0, stageLevel = 0;
          api.prop(stump, 'tidewild_leafeon_stump', 'the seed drum', { drummed: true }, () => { burst = 1; });
          api.onUpdate((dt, t) => {
            burst = Math.max(0, burst - dt * 0.4);
            pollen.points.material.opacity = 0.3 + burst * 0.6;
            saplings.forEach((s, i) => { const k = 1 + stageLevel * 0.35 + burst * 0.5 + Math.sin(t * 1.5 + i) * 0.04; s.scale.set(k, k, k); s.position.y = 0.2 * k; });
            trees.forEach((tr, i) => { tr.rotation.z = Math.sin(t * 0.8 + i) * 0.03; });
          });
          api.onStage(stage => { stageLevel = stage; });
          api.toy('ball', 0x76b852, new THREE.Vector3(1.5, 0.22, 1.5));
          api.memento('notebook', 0x76b852, new THREE.Vector3(-1.7, 0.1, 1.6), 'A seed pod, split. Both halves have been kept, which is more than most people bother with.');
          return { spawnPoint: new THREE.Vector3(0, 0, 1.2) };
        }
      },

      glaceon: {
        name: 'Iceberg Landing', mood: 'A berg that drifted south and decided to stay. It has its own weather.',
        floor: { radius: 4.2, color: 0xe6f7fb }, weather: ['snow', 'diamond-dust', 'clear', 'mist'], life: 'crystals',
        lights: { hemiSky: 0xf0fdff, hemiGround: 0x2b4c5a, hemiIntensity: 0.62, keyColor: 0xd8f4ff, keyIntensity: 0.8, keyPos: [2, 7, 3] },
        variants: [{ id: 'bright', label: 'Berg Bright' }, { id: 'whiteout', label: 'Whiteout', hemiIntensity: 0.9, keyIntensity: 0.4 }],
        stages: [{ id: 'drifting', label: 'Drifting' }, { id: 'anchored', label: 'Anchored' }, { id: 'carved', label: 'Carved' }, { id: 'berg-home', label: 'Berg Home' }],
        mementoLabel: 'a frozen bottle',
        build(api) {
          const sea = P.waterDisk(9, 0x1f5f8a, -0.06); api.add(sea);
          const iceMat = api.FX.Materials.ice(0xcdeffb);
          const peaks = []; for (let i = 0; i < 6; i++) { const pk = new THREE.Mesh(new THREE.ConeGeometry(0.6 + (i % 3) * 0.2, 1.6 + (i % 2) * 1.2, 5), iceMat); const a = i * 1.05 + 0.3; pk.position.set(Math.cos(a) * 3.3, 0.7 + (i % 2) * 0.5, Math.sin(a) * 3.3); api.add(pk); peaks.push(pk); }
          // Setpiece: the calving face — tap it and a chunk splits off, drops and bobs; the berg tilts.
          const face = new THREE.Mesh(new THREE.BoxGeometry(2.6, 2.2, 0.8), iceMat); face.position.set(0, 1.1, -2.6); api.add(P.shadowed(face));
          const chunk = new THREE.Mesh(new THREE.DodecahedronGeometry(0.4, 0), iceMat); chunk.position.set(0.6, 1.4, -2.0); chunk.visible = false; api.add(chunk);
          const fres = api.own(api.FX.createFresnelMaterial(0xbdf3ff, 1.0));
          const halo = new THREE.Mesh(new THREE.SphereGeometry(0.5, 16, 16), fres); halo.position.copy(chunk.position); halo.visible = false; api.add(halo);
          const snow = api.particles(api.FX.VFX.snow({ area: [8, 4, 8], baseY: 2.6, count: 40 }));
          let calve = 0;
          api.prop(face, 'tidewild_glaceon_face', 'the calving face', { calved: true }, () => { calve = 1.4; chunk.visible = true; halo.visible = true; chunk.position.set(0.6, 1.4, -2.0); });
          api.onUpdate((dt, t) => {
            if (calve > 0) {
              calve -= dt;
              chunk.position.y = Math.max(0.28, chunk.position.y - dt * 2.2);
              chunk.position.z += dt * 0.9;
              chunk.rotation.x += dt * 2;
              halo.position.copy(chunk.position);
              halo.material.uniforms.uIntensity.value = Math.max(0, calve);
            } else if (chunk.visible) { chunk.position.y = 0.28 + Math.sin(t * 2) * 0.04; }
            face.rotation.z = Math.sin(t * 0.4) * 0.01 + Math.max(0, calve) * 0.05;
          });
          api.onStage(stage => peaks.forEach((pk, i) => pk.scale.setScalar(1 + stage * 0.08 + i * 0.01)));
          api.add(P.backdrop(6, 7.5, i => P.mountain(0xdff3fa, 2.2 + (i % 2), 2.6)));
          const farLamp = P.orb(0xfff2a8, 0.1, api.region.get('lighthouseLit') ? 1.8 : 0.1); farLamp.position.set(-5.5, 2.4, -4.5); api.add(farLamp);
          api.onUpdate((dt, t) => { if (api.region.get('lighthouseLit')) farLamp.material.emissiveIntensity = 1 + Math.max(0, Math.sin(t * 1.4)) * 1.2; });
          api.memento('tag', 0x8be5f5, new THREE.Vector3(1.6, 0.1, 1.5), 'A bottle frozen into the berg, message half-read: "...if you find this, the cold one says hello."');
          return { spawnPoint: new THREE.Vector3(0, 0, 1.0) };
        }
      },

      sylveon: {
        name: 'Ribbonwreck Deck', mood: 'A survey ship, tipped and tide-washed, re-rigged in ribbon by someone very determined.',
        floor: { radius: 4.4, color: 0xd6b9a6 }, weather: ['petals', 'breeze', 'clear'], life: 'ribbons',
        lights: { hemiSky: 0xffe6f0, hemiGround: 0x5b4650, hemiIntensity: 0.55, keyColor: 0xffd9e8, keyIntensity: 0.85, keyPos: [4, 8, 2] },
        variants: [{ id: 'sunset', label: 'Pink Sunset' }, { id: 'lanternwatch', label: 'Lantern Watch', keyIntensity: 0.3, hemiIntensity: 0.22 }],
        stages: [{ id: 'wrecked', label: 'Wrecked' }, { id: 'rigged', label: 'Re-rigged' }, { id: 'flying', label: 'Colours Flying' }, { id: 'refloated', label: 'Refloated in Spirit' }],
        mementoLabel: 'a ship\'s bell ribbon',
        build(api) {
          const sea = P.waterDisk(9, 0x3a8fb5, -0.06); api.add(sea);
          const hull = new THREE.Mesh(new THREE.BoxGeometry(3.6, 1.2, 1.6), api.FX.Materials.wood(0x6b4a33)); hull.position.set(-0.4, 0.5, -1.6); hull.rotation.z = 0.18; hull.rotation.y = 0.3; api.add(P.shadowed(hull));
          const mast = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.08, 3.4, 7), api.FX.Materials.wood(0x8a6a44)); mast.position.set(-0.4, 2.2, -1.6); mast.rotation.z = 0.18; api.add(P.shadowed(mast));
          const ribbons = [];
          for (let i = 0; i < 8; i++) {
            const rb = new THREE.Mesh(new THREE.PlaneGeometry(0.16, 1.6, 1, 6), new THREE.MeshToonMaterial({ color: [0xffaec9, 0x9fd8ff, 0xfff1a8, 0xc9f0d8][i % 4], side: THREE.DoubleSide }));
            api.own(rb.material);
            const a = i * 0.8; rb.position.set(-0.4 + Math.cos(a) * 1.3, 2.9, -1.6 + Math.sin(a) * 1.3); rb.rotation.y = -a; api.add(rb); ribbons.push(rb);
          }
          const wheel = new THREE.Mesh(new THREE.TorusGeometry(0.34, 0.04, 8, 12), api.FX.Materials.wood(0xa0764a)); wheel.position.set(1.4, 0.9, 0.2); api.add(wheel);
          const wheelPost = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.06, 0.9, 6), api.FX.Materials.wood(0x6b4a33)); wheelPost.position.set(1.4, 0.45, 0.2); api.add(wheelPost);
          let gust = 0, stageLevel = 0;
          api.prop(wheel, 'tidewild_sylveon_wheel', 'the ship\'s wheel', { steered: true }, () => { gust = 1; });
          api.lantern(0xffb3c6, new THREE.Vector3(-2.4, 0, 1.4));
          api.lantern(0xffb3c6, new THREE.Vector3(2.4, 0, -1.4));
          const petals = api.particles(api.FX.VFX.sparkles({ area: [7, 3, 7], baseY: 0.8, count: 24 }));
          api.onUpdate((dt, t) => {
            gust = Math.max(0, gust - dt * 0.4);
            wheel.rotation.z += dt * (0.2 + gust * 4);
            ribbons.forEach((rb, i) => {
              const pos = rb.geometry.attributes.position;
              for (let v = 0; v < pos.count; v++) { const y = pos.getY(v); pos.setX(v, (v % 2 ? 0.08 : -0.08) + Math.sin(t * 3 + y * 3 + i) * (0.1 + gust * 0.3) * (0.8 - y)); }
              pos.needsUpdate = true;
              rb.rotation.z = 0.1 + stageLevel * 0.1 + gust * 0.5;
            });
            petals.points.material.opacity = 0.4 + gust * 0.5;
          });
          api.onStage(stage => { stageLevel = stage; });
          api.toy('plush', 0xffaec9, new THREE.Vector3(-1.6, 0.15, 1.6));
          api.memento('ribbon', 0xffaec9, new THREE.Vector3(0.6, 0.1, 1.9), 'The ship\'s bell has been re-hung on a ribbon. It rings softer now, but it still rings.');
          return { spawnPoint: new THREE.Vector3(0.2, 0, 1.2) };
        }
      }
    }
  });
})(window);
