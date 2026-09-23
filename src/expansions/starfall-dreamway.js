/* ==========================================================================
   EXPANSION 04 — STARFALL DREAMWAY
   A region that exists only while an Eevee is asleep: floating islands,
   a tilted clocktower, a library of unwritten books, a sea of glass, a
   comet garden. Hub: The Pillow Nebula.
   ========================================================================== */
(function (global) {
  'use strict';
  const THREE = global.THREE;
  const K = global.ExpansionKit;
  const P = K.P;

  function island(api, r, color, y) {
    const g = new THREE.Group();
    const top = new THREE.Mesh(new THREE.CylinderGeometry(r, r * 0.9, 0.25, 12), api.FX.Materials.foliage(color));
    const under = new THREE.Mesh(new THREE.ConeGeometry(r * 0.9, r * 1.4, 8), api.FX.Materials.stone(0x5d5470));
    under.rotation.x = Math.PI; under.position.y = -r * 0.7 - 0.12;
    g.add(P.shadowed(top), P.shadowed(under));
    g.position.y = y;
    g.userData.baseY = y;
    return g;
  }

  K.registerExpansion({
    id: 'dreamway',
    displayName: 'Starfall Dreamway — The Pillow Nebula',
    tagline: 'A place you can only get to by falling asleep somewhere comfortable.',
    mood: 'Soft gravity, slow stars, and the distinct sense of being somewhere that will not be here tomorrow.',
    doorColor: 0x9b7bff,

    hub: {
      radius: 6.0, floorColor: 0x2a2450,
      weather: ['clear', 'aurora', 'mist'], life: 'wisps',
      stages: [
        { id: 'drowsy', label: 'Drowsy' }, { id: 'dreaming', label: 'Dreaming' },
        { id: 'lucid', label: 'Lucid' }, { id: 'dreamkeeper', label: 'Dreamkeeper' }
      ],
      lights: { hemiSky: 0x7c6fd0, hemiGround: 0x0c0a22, hemiIntensity: 0.45, keyColor: 0xd8c8ff, keyIntensity: 0.65, keyPos: [3, 9, -2], fillColor: 0xff9ad0, fillIntensity: 0.25, fillPos: [-5, 4, 4] },
      variants: [{ id: 'deep-sleep', label: 'Deep Sleep' }, { id: 'rem', label: 'REM Colours', keyColor: 0xff9ad0, hemiIntensity: 0.6 }],
      build(api) {
        // Cushions the size of hills, drifting islands, a slow star-wheel overhead.
        const cushions = []; for (let i = 0; i < 7; i++) { const c = api.RoomKit.cushion([0xc9b8ff, 0xffc4e1, 0xb8e8ff][i % 3], 0.9 + (i % 3) * 0.3); const a = i * 0.9 + 0.3; c.position.set(Math.cos(a) * 4.3, 0.2, Math.sin(a) * 4.3); api.add(c); cushions.push(c); }
        const islands = []; for (let i = 0; i < 5; i++) { const isl = island(api, 0.6 + (i % 2) * 0.3, 0x6fb3a0, 2.6 + (i % 3) * 0.6); const a = i * 1.25; isl.position.x = Math.cos(a) * 3.6; isl.position.z = Math.sin(a) * 3.6; isl.userData.seed = i; api.add(isl); islands.push(isl); }
        const wheel = new THREE.Group(); for (let i = 0; i < 24; i++) { const s = P.orb(0xfff6c8, 0.04 + (i % 3) * 0.02, 1.2); const a = (i / 24) * Math.PI * 2; const r = 5 + (i % 4) * 0.4; s.position.set(Math.cos(a) * r, 5.5 + Math.sin(i) * 0.6, Math.sin(a) * r); wheel.add(s); } api.add(wheel);
        const moon = P.orb(0xf6f0ff, 0.6, 0.8); moon.position.set(0, 7, -6); api.add(moon);
        const pillow = api.RoomKit.cushion(0xffffff, 0.8); pillow.position.set(0, 0.15, -2.2); pillow.scale.y = 1.4;
        let plump = 0;
        api.curio(pillow, 'dreamway_great_pillow', 'the Great Pillow', 'dreamway_pillow_plumped', 'Plumped the Great Pillow. Somewhere, every sleeping Eevee sighed at once.', () => { plump = 1; });
        api.particles(api.FX.VFX.motes({ area: [12, 6, 12], baseY: 0.5, count: 40, color: 0xc9b8ff }));
        api.onUpdate((dt, t) => {
          plump = Math.max(0, plump - dt * 0.6); pillow.scale.set(1 + plump * 0.2, 1.4 + plump * 0.4, 1 + plump * 0.2);
          wheel.rotation.y += dt * 0.02; islands.forEach(isl => { isl.position.y = isl.userData.baseY + Math.sin(t * 0.4 + isl.userData.seed) * 0.2; isl.rotation.y += dt * 0.03; });
          cushions.forEach((c, i) => { c.position.y = 0.2 + Math.sin(t * 0.6 + i) * 0.03; });
        });
        return { applyStage(stage) { moon.material.emissiveIntensity = 0.8 + stage * 0.3; } };
      }
    },

    rooms: {
      eevee: {
        name: 'Nursery of Maybes', mood: 'Eight cribs, each holding a future. Eevee peeks in all of them and climbs into none.',
        floor: { radius: 4.0, color: 0x3a3060 }, weather: ['clear', 'mist'], life: 'motes',
        lights: { hemiSky: 0xb8a8ff, hemiGround: 0x150f30, hemiIntensity: 0.45, keyColor: 0xffe1f0, keyIntensity: 0.6, keyPos: [2, 7, 3] },
        variants: [{ id: 'lullaby', label: 'Lullaby' }, { id: 'nightlight', label: 'Nightlight', keyIntensity: 0.25, hemiIntensity: 0.25 }],
        stages: [{ id: 'peeking', label: 'Peeking' }, { id: 'rocked', label: 'Cribs Rocked' }, { id: 'hummed', label: 'Hummed To' }, { id: 'unchosen-still', label: 'Still Unchosen, Happily' }],
        mementoLabel: 'a baby blanket',
        build(api) {
          const cribs = []; K.SPECIES.slice(1).forEach((sp, i) => { const g = new THREE.Group(); const base = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.35, 0.45), api.FX.Materials.wood(0xd9c6ee)); base.position.y = 0.4; g.add(P.shadowed(base)); for (let k = 0; k < 6; k++) { const bar = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.5, 4), api.FX.Materials.wood(0xd9c6ee)); bar.position.set(-0.3 + k * 0.12, 0.7, 0.22); g.add(bar); } const glow = P.orb(K.SPECIES_COLOR[sp], 0.12, 0.5); glow.position.y = 0.62; g.add(glow); const rocker = new THREE.Mesh(new THREE.TorusGeometry(0.35, 0.02, 6, 12, Math.PI), api.FX.Materials.wood(0xd9c6ee)); rocker.rotation.z = Math.PI; rocker.rotation.y = Math.PI / 2; rocker.position.y = 0.36; g.add(rocker); const a = (i / 8) * Math.PI * 2; g.position.set(Math.cos(a) * 2.6, 0, Math.sin(a) * 2.6); g.lookAt(0, 0, 0); g.userData.glow = glow; g.userData.seed = i; api.add(g); cribs.push(g); });
          const mobile = new THREE.Group(); const arm = new THREE.Mesh(new THREE.CylinderGeometry(0.01, 0.01, 1.6, 4), api.FX.Materials.metal(0xd9d2c6)); arm.rotation.z = Math.PI / 2; mobile.add(arm); for (let i = 0; i < 4; i++) { const star = P.orb([0xfff6c8, 0xffc4e1, 0xb8e8ff, 0xc9b8ff][i], 0.08, 1); star.position.set(-0.6 + i * 0.4, -0.3 - (i % 2) * 0.2, 0); mobile.add(star); } mobile.position.set(0, 2.6, 0); api.add(mobile);
          const rug = new THREE.Mesh(new THREE.CircleGeometry(1.3, 24), api.FX.Materials.cloth(0xf3e8ff)); rug.rotation.x = -Math.PI / 2; rug.position.y = 0.01; api.add(rug);
          let rock = 0, stageLevel = 0;
          api.prop(mobile, 'dreamway_eevee_mobile', 'the star mobile', { rocked: true }, () => { rock = 1; });
          api.onUpdate((dt, t) => {
            rock = Math.max(0, rock - dt * 0.2); mobile.rotation.y += dt * (0.15 + rock * 1.2);
            cribs.forEach(c => { c.rotation.z = Math.sin(t * 2 + c.userData.seed) * 0.08 * (0.2 + rock + stageLevel * 0.1); c.userData.glow.material.emissiveIntensity = 0.5 + stageLevel * 0.2 + Math.max(0, Math.sin(t + c.userData.seed)) * rock; });
          });
          api.onStage(stage => { stageLevel = stage; });
          api.particles(api.FX.VFX.motes({ area: [6, 3, 6], baseY: 0.5, count: 20, color: 0xffc4e1 }));
          api.toy('plush', 0xe0b47a, new THREE.Vector3(0.6, 0.15, 0.9));
          api.memento('notebook', 0xe0b47a, new THREE.Vector3(-0.8, 0.1, 1.0), 'A baby blanket embroidered with eight small symbols. The ninth corner is left blank, on purpose.');
          return { spawnPoint: new THREE.Vector3(0, 0, 0.6), topology: { sleepSpots: [new THREE.Vector3(0, 0, 0)] } };
        }
      },

      vaporeon: {
        name: 'Sea of Glass', mood: 'An ocean that froze mid-wave without getting cold. You can walk on it. Vaporeon swims under it.',
        floor: { radius: 4.6, color: 0x1e3a6a }, weather: ['clear', 'mist', 'aurora'], life: 'droplets',
        lights: { hemiSky: 0x8fb8ff, hemiGround: 0x081a3a, hemiIntensity: 0.45, keyColor: 0xbfe0ff, keyIntensity: 0.7, keyPos: [-2, 8, 3] },
        variants: [{ id: 'still-sea', label: 'Still Sea' }, { id: 'under-lit', label: 'Lit From Below', keyIntensity: 0.25, hemiIntensity: 0.6 }],
        stages: [{ id: 'surface', label: 'On the Surface' }, { id: 'tapped', label: 'Glass Tapped' }, { id: 'rippled', label: 'Rippled' }, { id: 'beneath', label: 'Beneath the Glass' }],
        mementoLabel: 'a glass pearl',
        build(api) {
          const glass = new THREE.Mesh(new THREE.CircleGeometry(4.5, 48), api.FX.Materials.glass(0x9fd0ff, 0.35)); glass.rotation.x = -Math.PI / 2; glass.position.y = 0.05; api.add(glass);
          const rippleMat = api.own(api.FX.createWaterMaterial(0x6fb8ff)); const ripple = new THREE.Mesh(new THREE.CircleGeometry(4.5, 48), rippleMat); ripple.rotation.x = -Math.PI / 2; ripple.position.y = 0.06; api.add(ripple);
          const waves = []; for (let i = 0; i < 8; i++) { const w = new THREE.Mesh(new THREE.TorusGeometry(0.5 + (i % 3) * 0.2, 0.12, 8, 20, Math.PI), api.FX.Materials.glass(0xbfe6ff, 0.5)); const a = i * 0.78; w.position.set(Math.cos(a) * 3.2, 0.1, Math.sin(a) * 3.2); w.rotation.y = -a + Math.PI / 2; api.add(w); waves.push(w); }
          const below = []; for (let i = 0; i < 10; i++) { const f = P.orb([0x3fd6ff, 0xffc4e1, 0xfff6c8][i % 3], 0.07, 0.9); f.userData.seed = i; api.add(f); below.push(f); }
          const underLight = new THREE.PointLight(0x3fd6ff, 0.3, 8); underLight.position.set(0, -1.2, 0); api.add(underLight);
          const buoy = P.orb(0xffffff, 0.22, 0.4); buoy.position.set(0, 0.3, -1.4);
          let ring = 0, stageLevel = 0;
          api.prop(buoy, 'dreamway_vaporeon_buoy', 'the glass buoy', { tapped: true }, () => { ring = 1; });
          api.onUpdate((dt, t) => {
            ring = Math.max(0, ring - dt * 0.3);
            below.forEach(f => { const s = f.userData.seed; const a = t * 0.3 + s; f.position.set(Math.cos(a) * (1 + (s % 4) * 0.6), -0.6 - (s % 3) * 0.4 + ring * 0.5, Math.sin(a) * (1 + (s % 4) * 0.6)); });
            underLight.intensity = 0.3 + stageLevel * 0.3 + ring * 1.5; rippleMat.opacity = 0.2 + ring * 0.6; buoy.material.emissiveIntensity = 0.4 + ring;
            waves.forEach((w, i) => { w.position.y = 0.1 + Math.sin(t * 0.8 + i) * 0.02; });
          });
          api.onStage(stage => { stageLevel = stage; });
          api.particles(api.FX.VFX.droplets({ area: [8, 3, 8], baseY: 2.2, count: 14, color: 0xbfe6ff }));
          api.memento('shell', 0x49b2e8, new THREE.Vector3(1.8, 0.14, 1.5), 'A pearl made of glass, or glass made of pearl. Vaporeon says the difference matters and will not say why.');
          return { spawnPoint: new THREE.Vector3(0, 0, 1.2) };
        }
      },

      jolteon: {
        name: 'Static Field', mood: 'A meadow where the grass is made of standing charge. Every step is a tiny thunderclap, and Jolteon loves it.',
        floor: { radius: 4.2, color: 0x2a2a40 }, weather: ['static', 'clear', 'storm'], life: 'sparks',
        lights: { hemiSky: 0xd9dcff, hemiGround: 0x101020, hemiIntensity: 0.4, keyColor: 0xfff6b0, keyIntensity: 0.6, keyPos: [2, 8, 2] },
        variants: [{ id: 'hum', label: 'Low Hum' }, { id: 'discharge', label: 'Discharge', keyIntensity: 0.3, hemiIntensity: 0.6 }],
        stages: [{ id: 'crackling', label: 'Crackling' }, { id: 'grounded', label: 'Grounded' }, { id: 'arcing', label: 'Arcing' }, { id: 'thunder-meadow', label: 'Thunder Meadow' }],
        mementoLabel: 'a static feather',
        build(api) {
          const blades = []; const bladeMat = api.FX.Materials.emissiveAccent(0xfff066, 0.3); for (let i = 0; i < 90; i++) { const b = new THREE.Mesh(new THREE.ConeGeometry(0.02, 0.35 + (i % 4) * 0.12, 3), bladeMat); const a = i * 2.399, r = 0.4 + Math.sqrt(i) * 0.4; b.position.set(Math.cos(a) * r, 0.2, Math.sin(a) * r); b.userData.seed = i; api.add(b); blades.push(b); }
          const orbs = []; for (let i = 0; i < 5; i++) { const o = P.orb(0xffffff, 0.14, 1.0); o.userData.seed = i; api.add(o); orbs.push(o); }
          const rod = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.06, 1.6, 6), api.FX.Materials.metal(0xd9dde3)); rod.position.set(0, 0.8, -1.6);
          const arcs = []; for (let i = 0; i < 4; i++) { const arc = new THREE.Mesh(new THREE.TorusGeometry(0.6 + i * 0.25, 0.012, 4, 24, Math.PI * 0.6), new THREE.MeshBasicMaterial({ color: 0xfff6b0, transparent: true, opacity: 0 })); api.own(arc.material); arc.position.set(0, 1.6, -1.6); arc.rotation.z = i * 1.3; api.add(arc); arcs.push(arc); }
          const flash = new THREE.PointLight(0xfff6b0, 0, 8); flash.position.set(0, 1.8, -1.6); api.add(flash);
          let zap = 0, stageLevel = 0;
          api.prop(rod, 'dreamway_jolteon_rod', 'the grounding rod', { grounded: true }, () => { zap = 1; });
          api.onUpdate((dt, t) => {
            zap = Math.max(0, zap - dt * 0.5);
            blades.forEach(b => { b.rotation.z = Math.sin(t * 3 + b.userData.seed) * 0.1 + Math.sin(t * 30 + b.userData.seed) * 0.05 * zap; });
            bladeMat.emissiveIntensity = 0.3 + stageLevel * 0.2 + zap * 0.8;
            orbs.forEach(o => { const s = o.userData.seed; o.position.set(Math.cos(t * 0.5 + s * 1.3) * 2.6, 0.5 + Math.abs(Math.sin(t * 2 + s)) * 0.6, Math.sin(t * 0.5 + s * 1.3) * 2.6); });
            arcs.forEach((a, i) => { a.material.opacity = zap > 0 && Math.sin(t * 25 + i * 2) > 0.3 ? zap : 0; a.rotation.y += dt * 2; });
            flash.intensity = zap * (Math.sin(t * 25) > 0.3 ? 2 : 0.4);
          });
          api.onStage(stage => { stageLevel = stage; });
          api.particles(api.FX.VFX.sparks({ area: [7, 3, 7], baseY: 0.4, count: 24 }));
          api.memento('tag', 0xfee033, new THREE.Vector3(1.8, 0.1, 1.5), 'A feather that stands straight up no matter how you set it down. Jolteon relates.');
          return { spawnPoint: new THREE.Vector3(0, 0, 1.4) };
        }
      },

      flareon: {
        name: 'Comet Garden', mood: 'Comets come here to rest between orbits. They\'re warm, and Flareon has claimed the biggest one as a bed.',
        floor: { radius: 4.4, color: 0x3a2040 }, weather: ['embers', 'clear', 'aurora'], life: 'embers',
        lights: { hemiSky: 0xff9a8a, hemiGround: 0x1a0a20, hemiIntensity: 0.4, keyColor: 0xffb070, keyIntensity: 0.7, keyPos: [-3, 8, 2] },
        variants: [{ id: 'perihelion', label: 'Perihelion' }, { id: 'aphelion', label: 'Aphelion', keyColor: 0x9b7bff, hemiIntensity: 0.25 }],
        stages: [{ id: 'dormant', label: 'Comets Dormant' }, { id: 'warmed', label: 'One Warmed' }, { id: 'tails-lit', label: 'Tails Lit' }, { id: 'orbit-home', label: 'Orbit Home' }],
        mementoLabel: 'a comet fragment',
        build(api) {
          const comets = []; for (let i = 0; i < 6; i++) { const g = new THREE.Group(); const head = new THREE.Mesh(new THREE.DodecahedronGeometry(0.28 + (i % 3) * 0.1, 0), api.FX.Materials.emissiveAccent(0xffb070, 0.3)); g.add(head); const tail = new THREE.Mesh(new THREE.ConeGeometry(0.2, 1.4, 8, 1, true), new THREE.MeshBasicMaterial({ color: 0xff8a45, transparent: true, opacity: 0.15, side: THREE.DoubleSide, depthWrite: false })); api.own(tail.material); tail.rotation.z = Math.PI / 2; tail.position.x = -0.8; g.add(tail); const a = i * 1.05, r = 1.6 + (i % 2) * 1.2; g.position.set(Math.cos(a) * r, 0.5 + (i % 3) * 0.4, Math.sin(a) * r); g.rotation.y = -a; g.userData.head = head; g.userData.tail = tail; g.userData.seed = i; api.add(g); comets.push(g); }
          const big = new THREE.Group(); const bigHead = new THREE.Mesh(new THREE.DodecahedronGeometry(0.7, 1), api.FX.Materials.emissiveAccent(0xff7a2f, 0.5)); big.add(bigHead); const bigTail = new THREE.Mesh(new THREE.ConeGeometry(0.5, 3, 10, 1, true), new THREE.MeshBasicMaterial({ color: 0xff8a45, transparent: true, opacity: 0.2, side: THREE.DoubleSide, depthWrite: false })); api.own(bigTail.material); bigTail.rotation.z = Math.PI / 2; bigTail.position.x = -1.7; big.add(bigTail); big.position.set(0, 0.7, -1.8); big.rotation.y = 0.4;
          const light = new THREE.PointLight(0xff8a45, 0.5, 8); light.position.set(0, 1.4, -1.8); api.add(light);
          const beds = []; for (let i = 0; i < 4; i++) { const b = api.RoomKit.cushion(0xffc4a0, 0.4); const a = i * 1.57 + 0.4; b.position.set(Math.cos(a) * 3.2, 0.1, Math.sin(a) * 3.2); api.add(b); beds.push(b); }
          const embers = api.particles(api.FX.VFX.embers({ area: [8, 4, 8], baseY: 0.5, count: 32 }));
          let warm = 0, stageLevel = 0;
          api.prop(big, 'dreamway_flareon_comet', 'the great comet', { cometWarmed: true }, () => { warm = 1; });
          api.onUpdate((dt, t) => {
            warm = Math.max(0, warm - dt * 0.25); const level = stageLevel * 0.25 + warm;
            bigHead.material.emissiveIntensity = 0.5 + level * 1.2; bigTail.material.opacity = 0.2 + level * 0.5; bigTail.scale.setScalar(1 + level * 0.4); light.intensity = 0.5 + level * 1.6;
            big.rotation.x += dt * 0.1; big.position.y = 0.7 + Math.sin(t * 0.7) * 0.06;
            comets.forEach(c => { const s = c.userData.seed; c.position.y = 0.5 + (s % 3) * 0.4 + Math.sin(t * 0.5 + s) * 0.1; c.userData.head.rotation.y += dt * 0.5; c.userData.head.material.emissiveIntensity = 0.3 + level * 0.8; c.userData.tail.material.opacity = 0.15 + level * 0.4; });
            embers.points.material.opacity = 0.4 + level * 0.4;
          });
          api.onStage(stage => { stageLevel = stage; });
          api.memento('frame', 0xf76835, new THREE.Vector3(1.6, 0.12, 1.4), 'A comet fragment, warm as a held paw. It smells faintly of toast.');
          return { spawnPoint: new THREE.Vector3(0.4, 0, 1.2), topology: { sleepSpots: [new THREE.Vector3(0, 0, -0.6)] } };
        }
      },

      espeon: {
        name: 'Tilted Clocktower', mood: 'A clocktower leaning at an angle that shouldn\'t hold. Time runs sideways here, which Espeon finds restful.',
        floor: { radius: 4.0, color: 0x3a3258 }, weather: ['clear', 'aurora', 'mist'], life: 'wisps',
        lights: { hemiSky: 0xc8b8ff, hemiGround: 0x140f2e, hemiIntensity: 0.45, keyColor: 0xf3dcff, keyIntensity: 0.65, keyPos: [3, 9, -1] },
        variants: [{ id: 'quarter-past', label: 'Quarter Past' }, { id: 'midnight-sideways', label: 'Midnight, Sideways', keyColor: 0x9b7bff, hemiIntensity: 0.3 }],
        stages: [{ id: 'stopped', label: 'Clock Stopped' }, { id: 'wound', label: 'Wound' }, { id: 'ticking', label: 'Ticking Sideways' }, { id: 'timekeeper', label: 'Timekeeper' }],
        mementoLabel: 'a loose cog',
        build(api) {
          const psy = api.own(api.FX.createPsychicMaterial(0xd09cf5));
          const tower = new THREE.Group(); const body = new THREE.Mesh(new THREE.BoxGeometry(1.4, 4.2, 1.4), api.FX.Materials.stone(0x6b5f8a)); body.position.y = 2.1; tower.add(P.shadowed(body)); const roof = new THREE.Mesh(new THREE.ConeGeometry(1.2, 1.2, 4), api.FX.Materials.stone(0x4a3f6e)); roof.position.y = 4.8; roof.rotation.y = Math.PI / 4; tower.add(P.shadowed(roof));
          const face = new THREE.Mesh(new THREE.CircleGeometry(0.55, 24), api.FX.Materials.emissiveAccent(0xfff4d6, 0.5)); face.position.set(0, 3.2, 0.71); tower.add(face);
          const hourHand = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.3, 0.02), api.FX.Materials.stone(0x2a2340)); hourHand.position.set(0, 3.35, 0.73); tower.add(hourHand);
          const minHand = new THREE.Mesh(new THREE.BoxGeometry(0.035, 0.45, 0.02), api.FX.Materials.stone(0x2a2340)); minHand.position.set(0, 3.4, 0.74); tower.add(minHand);
          tower.rotation.z = 0.32; tower.position.set(0.6, 0, -2.0); api.add(tower);
          const cogs = []; for (let i = 0; i < 7; i++) { const c = new THREE.Mesh(new THREE.CylinderGeometry(0.25 + (i % 3) * 0.1, 0.25 + (i % 3) * 0.1, 0.08, 8), api.FX.Materials.metal(0xc9a24a)); const a = i * 0.9, r = 1.6 + (i % 3) * 0.7; c.position.set(Math.cos(a) * r, 1.0 + (i % 4) * 0.5, Math.sin(a) * r); c.rotation.x = Math.PI / 2 - 0.4; c.userData.seed = i; c.userData.baseY = c.position.y; api.add(c); cogs.push(c); }
          const halo = new THREE.Mesh(new THREE.RingGeometry(0.9, 1.3, 32), psy); halo.rotation.x = -Math.PI / 2; halo.position.set(0, 0.04, 0.4); api.add(halo);
          const key = new THREE.Mesh(new THREE.TorusGeometry(0.2, 0.05, 8, 12), api.FX.Materials.metal(0xc9a24a)); key.position.set(-1.6, 0.4, 0.4);
          let wind = 0, stageLevel = 0, handTime = 0;
          api.prop(key, 'dreamway_espeon_key', 'the winding key', { wound: true }, () => { wind = 1; });
          api.onUpdate((dt, t) => {
            psy.uniforms.uTime.value = t; wind = Math.max(0, wind - dt * 0.15);
            const rate = stageLevel * 0.3 + wind * 2; handTime += dt * rate;
            hourHand.rotation.z = -handTime * 0.1; minHand.rotation.z = -handTime * 1.2;
            hourHand.position.set(Math.sin(handTime * 0.1) * 0.12, 3.2 + Math.cos(handTime * 0.1) * 0.12, 0.73); minHand.position.set(Math.sin(handTime * 1.2) * 0.2, 3.2 + Math.cos(handTime * 1.2) * 0.2, 0.74);
            cogs.forEach(c => { c.rotation.y += dt * rate * (c.userData.seed % 2 ? 1 : -1); c.position.y = c.userData.baseY + Math.sin(t * 0.6 + c.userData.seed) * 0.1; });
            key.rotation.y += dt * wind * 4; halo.rotation.z += dt * (0.1 + rate * 0.2);
            face.material.emissiveIntensity = 0.5 + rate * 0.3;
          });
          api.onStage(stage => { stageLevel = stage; });
          api.particles(api.FX.VFX.motes({ area: [7, 4, 7], baseY: 0.6, count: 24 }));
          api.memento('tag', 0xc68fed, new THREE.Vector3(1.8, 0.1, 1.5), 'A loose cog. The clock runs fine without it. Espeon suspects it was always decorative and is quietly offended on its behalf.');
          return { spawnPoint: new THREE.Vector3(0, 0, 1.2) };
        }
      },

      umbreon: {
        name: 'Library of Unwritten Books', mood: 'Shelves of books nobody has written yet. Umbreon reads them by the light of its own rings.',
        floor: { radius: 4.2, color: 0x1e1a2e }, weather: ['clear', 'moon-haze'], life: 'fireflies',
        lights: { hemiSky: 0x4a4a8a, hemiGround: 0x07060f, hemiIntensity: 0.28, keyColor: 0x8899ff, keyIntensity: 0.4, keyPos: [1, 7, 2] },
        variants: [{ id: 'closed-stacks', label: 'Closed Stacks' }, { id: 'ring-light', label: 'Ring Light', keyColor: 0xfff066, hemiIntensity: 0.22 }],
        stages: [{ id: 'unread', label: 'Unread' }, { id: 'opened', label: 'One Opened' }, { id: 'annotated', label: 'Annotated' }, { id: 'librarian', label: 'Night Librarian' }],
        mementoLabel: 'a blank bookmark',
        build(api) {
          const shelves = []; for (let i = 0; i < 8; i++) { const g = new THREE.Group(); const frame = new THREE.Mesh(new THREE.BoxGeometry(1.4, 3.0, 0.4), api.FX.Materials.wood(0x2a1f3a)); frame.position.y = 1.5; g.add(P.shadowed(frame)); for (let row = 0; row < 4; row++) for (let k = 0; k < 6; k++) { const book = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.42, 0.28), api.FX.Materials.cloth([0x3a3060, 0x5a3a70, 0x2a4a6a, 0x6a2a4a][(row + k) % 4])); book.position.set(-0.55 + k * 0.2, 0.5 + row * 0.7, 0.08); g.add(book); } const a = i * 0.785; g.position.set(Math.cos(a) * 3.6, 0, Math.sin(a) * 3.6); g.lookAt(0, 0, 0); api.add(g); shelves.push(g); }
          const lectern = new THREE.Mesh(new THREE.BoxGeometry(0.6, 1.0, 0.4), api.FX.Materials.wood(0x3a2a4a)); lectern.position.set(0, 0.5, -1.4); api.add(P.shadowed(lectern));
          const book = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.06, 0.36), api.FX.Materials.cloth(0xf3ecff)); book.position.set(0, 1.03, -1.4); book.rotation.x = -0.3; api.add(book);
          const glyphs = new THREE.Mesh(new THREE.PlaneGeometry(0.4, 0.28), api.FX.Materials.emissiveAccent(0x8899ff, 0.0)); glyphs.position.set(0, 1.08, -1.38); glyphs.rotation.x = -0.3 - Math.PI / 2; api.add(glyphs);
          const floaters = []; for (let i = 0; i < 8; i++) { const f = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.04, 0.16), api.FX.Materials.cloth(0x5a4a80)); f.userData.seed = i; api.add(f); floaters.push(f); }
          const rings = []; for (let i = 0; i < 3; i++) { const r = P.ring(0.9 + i * 0.6, 0.02, 0xfff066, 0.05); r.position.y = 0.04; api.add(r); rings.push(r); }
          let read = 0, stageLevel = 0;
          api.prop(lectern, 'dreamway_umbreon_lectern', 'the lectern', { opened: true }, () => { read = 1; });
          api.onUpdate((dt, t) => {
            read = Math.max(0, read - dt * 0.2);
            glyphs.material.emissiveIntensity = stageLevel * 0.25 + read * 1.4 * (0.7 + Math.sin(t * 3) * 0.3);
            floaters.forEach(f => { const s = f.userData.seed; const a = t * (0.2 + read * 0.4) + s * 0.8; f.position.set(Math.cos(a) * (1.4 + (s % 3) * 0.5), 1.4 + Math.sin(t + s) * 0.3 + read * 0.6, Math.sin(a) * (1.4 + (s % 3) * 0.5)); f.rotation.y = -a; f.rotation.z = Math.sin(t * 2 + s) * 0.3 * read; });
            rings.forEach((r, i) => { r.material.emissiveIntensity = 0.05 + stageLevel * 0.2 + Math.max(0, Math.sin(t * 2 - i)) * read; });
          });
          api.onStage(stage => { stageLevel = stage; });
          api.particles(api.FX.VFX.fireflies({ area: [7, 3, 7], baseY: 0.4, count: 14, color: 0xfff066 }));
          api.memento('tag', 0x8899ff, new THREE.Vector3(1.8, 0.1, 1.4), 'A bookmark with nothing on it, marking a page with nothing on it, in a book that will be very good one day.');
          return { spawnPoint: new THREE.Vector3(0, 0, 1.2), topology: { sleepSpots: [new THREE.Vector3(-1.6, 0, 0.8)] } };
        }
      },

      leafeon: {
        name: 'Seedling Sky-Isles', mood: 'Islands that grew from seeds dropped by other islands. Leafeon planted the newest one and is waiting.',
        floor: { radius: 4.4, color: 0x4f8a60 }, weather: ['pollen', 'clear', 'breeze'], life: 'butterflies',
        lights: { hemiSky: 0xd6f2ff, hemiGround: 0x2a3a50, hemiIntensity: 0.55, keyColor: 0xf6ffe0, keyIntensity: 0.8, keyPos: [3, 9, 3] },
        variants: [{ id: 'high-noon', label: 'High Noon' }, { id: 'cloud-shadow', label: 'Cloud Shadow', keyIntensity: 0.4, hemiIntensity: 0.4 }],
        stages: [{ id: 'planted', label: 'Seed Planted' }, { id: 'sprouted', label: 'Sprouted' }, { id: 'lifted', label: 'Lifted Off' }, { id: 'archipelago', label: 'Archipelago' }],
        mementoLabel: 'a sky-seed',
        build(api) {
          const islands = []; for (let i = 0; i < 6; i++) { const isl = island(api, 0.5 + (i % 3) * 0.25, [0x6fb86a, 0x8fd66a, 0x5fa86a][i % 3], 1.4 + (i % 3) * 0.7); const a = i * 1.05 + 0.5; isl.position.x = Math.cos(a) * 3.2; isl.position.z = Math.sin(a) * 3.2; isl.userData.seed = i; const tr = P.tree(0x6b4a2b, 0x74c15c, 1.2 + (i % 2) * 0.4); tr.position.y = 0.12; isl.add(tr); api.add(isl); islands.push(isl); }
          const clouds = []; for (let i = 0; i < 8; i++) { const c = new THREE.Mesh(new THREE.SphereGeometry(0.5 + (i % 3) * 0.2, 8, 6), api.FX.Materials.cloth(0xffffff)); const a = i * 0.78, r = 4.8 + (i % 2) * 0.6; c.position.set(Math.cos(a) * r, -0.6 + (i % 3) * 0.3, Math.sin(a) * r); c.scale.y = 0.45; api.add(c); clouds.push(c); }
          const seedIsle = island(api, 0.7, 0x5a4632, 0.0); seedIsle.position.set(0, 0.0, -1.4); seedIsle.children[0].material = api.FX.Materials.stone(0x6b4a2b);
          const sprout = new THREE.Group(); const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.05, 0.6, 6), api.FX.Materials.foliage(0x8fd66a)); stem.position.y = 0.3; sprout.add(stem); for (let k = 0; k < 2; k++) { const leaf = new THREE.Mesh(new THREE.SphereGeometry(0.16, 8, 6), api.FX.Materials.foliage(0x74c15c)); leaf.scale.set(1, 0.3, 0.6); leaf.position.set(k ? 0.15 : -0.15, 0.6, 0); sprout.add(leaf); } sprout.position.y = 0.12; sprout.scale.setScalar(0.3); seedIsle.add(sprout); api.add(seedIsle);
          const pollen = api.particles(api.FX.VFX.pollen({ area: [8, 4, 8], baseY: 2.2, count: 30 }));
          let grow = 0, stageLevel = 0;
          api.prop(seedIsle, 'dreamway_leafeon_seedisle', 'the seedling isle', { sprouted: true }, () => { grow = 1; });
          api.onUpdate((dt, t) => {
            grow = Math.max(0, grow - dt * 0.2); const size = 0.3 + stageLevel * 0.35 + grow * 0.6;
            sprout.scale.setScalar(size); sprout.rotation.y += dt * 0.2;
            seedIsle.position.y = stageLevel * 0.25 + grow * 0.6 + Math.sin(t * 0.5) * 0.05 * (stageLevel + grow);
            islands.forEach(isl => { isl.position.y = isl.userData.baseY + Math.sin(t * 0.4 + isl.userData.seed) * 0.15; });
            clouds.forEach((c, i) => { c.position.x += Math.cos(i) * dt * 0.05; c.position.z += Math.sin(i) * dt * 0.05; if (c.position.length() > 6) c.position.multiplyScalar(0.75); });
            pollen.points.material.opacity = 0.4 + grow * 0.5;
          });
          api.onStage(stage => { stageLevel = stage; });
          api.memento('notebook', 0x76b852, new THREE.Vector3(1.7, 0.1, 1.5), 'A seed with a tiny root already reaching up instead of down. It knows where it\'s going.');
          return { spawnPoint: new THREE.Vector3(0, 0, 1.2) };
        }
      },

      glaceon: {
        name: 'Aurora Cathedral', mood: 'Pillars of ice under a sky that is entirely aurora. It is very quiet, and Glaceon has decided that is the point.',
        floor: { radius: 4.4, color: 0xd6ecf7 }, weather: ['aurora', 'diamond-dust', 'clear'], life: 'crystals',
        lights: { hemiSky: 0xbfffe8, hemiGround: 0x1e2a4a, hemiIntensity: 0.55, keyColor: 0xc8ffea, keyIntensity: 0.7, keyPos: [0, 10, 0] },
        variants: [{ id: 'green-veil', label: 'Green Veil' }, { id: 'rose-veil', label: 'Rose Veil', keyColor: 0xffb3d9, hemiIntensity: 0.45 }],
        stages: [{ id: 'hushed', label: 'Hushed' }, { id: 'resonant', label: 'Pillar Rung' }, { id: 'veil-drawn', label: 'Veil Drawn' }, { id: 'cathedral-kept', label: 'Cathedral Kept' }],
        mementoLabel: 'a shard of sky',
        build(api) {
          const iceMat = api.FX.Materials.ice(0xcdeffb);
          const pillars = []; for (let i = 0; i < 10; i++) { const h = 3 + (i % 3); const p = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.26, h, 8), iceMat); const a = (i / 10) * Math.PI * 2; p.position.set(Math.cos(a) * 3.6, h / 2, Math.sin(a) * 3.6); p.userData.seed = i; api.add(P.shadowed(p)); pillars.push(p); }
          const curtains = []; for (let i = 0; i < 5; i++) { const c = new THREE.Mesh(new THREE.PlaneGeometry(4, 2.4, 16, 1), new THREE.MeshBasicMaterial({ color: [0x5fffb0, 0x9b7bff, 0xff9ad0, 0x5fffb0, 0x3fd6ff][i], transparent: true, opacity: 0.18, side: THREE.DoubleSide, depthWrite: false, blending: THREE.AdditiveBlending })); api.own(c.material); c.position.set(0, 4.2 + i * 0.3, -2 + i * 0.8); c.rotation.y = i * 0.6; c.userData.seed = i; api.add(c); curtains.push(c); }
          const altar = new THREE.Mesh(new THREE.OctahedronGeometry(0.5, 0), iceMat); altar.position.set(0, 0.7, -1.4);
          const fres = api.own(api.FX.createFresnelMaterial(0xbfffe8, 0.8)); const halo = new THREE.Mesh(new THREE.SphereGeometry(0.62, 16, 16), fres); halo.position.copy(altar.position); api.add(halo);
          const dust = api.particles(api.FX.VFX.snow({ area: [8, 5, 8], baseY: 3, count: 30, speed: 0.1 }));
          let ring = 0, stageLevel = 0;
          api.prop(altar, 'dreamway_glaceon_altar', 'the ice altar', { pillarRung: true }, () => { ring = 1; });
          api.onUpdate((dt, t) => {
            ring = Math.max(0, ring - dt * 0.2);
            curtains.forEach(c => { const pos = c.geometry.attributes.position; for (let v = 0; v < pos.count; v++) { const x = pos.getX(v); pos.setZ(v, Math.sin(t * 0.8 + x * 1.5 + c.userData.seed) * (0.2 + ring * 0.6)); } pos.needsUpdate = true; c.material.opacity = 0.14 + stageLevel * 0.05 + ring * 0.3; });
            pillars.forEach(p => { p.scale.x = p.scale.z = 1 + Math.max(0, Math.sin(t * 4 - p.userData.seed * 0.5)) * 0.05 * ring; });
            halo.material.uniforms.uIntensity.value = 0.6 + stageLevel * 0.2 + ring; altar.rotation.y += dt * (0.2 + ring);
          });
          api.onStage(stage => { stageLevel = stage; });
          api.memento('tag', 0x8be5f5, new THREE.Vector3(1.8, 0.1, 1.5), 'A shard of frozen aurora. It is green from one side and rose from the other, and cold from neither.');
          return { spawnPoint: new THREE.Vector3(0, 0, 1.2) };
        }
      },

      sylveon: {
        name: 'Ribbon Bridge to Morning', mood: 'A bridge of ribbon over nothing, leading toward the sunrise. Sylveon is tying the last knot.',
        floor: { radius: 4.0, color: 0x4a3860 }, weather: ['petals', 'clear', 'aurora'], life: 'ribbons',
        lights: { hemiSky: 0xffd6ec, hemiGround: 0x2a1a3a, hemiIntensity: 0.55, keyColor: 0xffc48a, keyIntensity: 0.85, keyPos: [0, 6, -8] },
        variants: [{ id: 'before-dawn', label: 'Before Dawn' }, { id: 'first-light', label: 'First Light', keyIntensity: 1.2, hemiIntensity: 0.7 }],
        stages: [{ id: 'fraying', label: 'Fraying' }, { id: 'knotted', label: 'Knotted' }, { id: 'crossing', label: 'Crossing' }, { id: 'morning', label: 'Morning' }],
        mementoLabel: 'the last ribbon',
        build(api) {
          const sun = P.orb(0xffc48a, 1.2, 1.4); sun.position.set(0, 1.4, -9); api.add(sun);
          const sunGlow = new THREE.Mesh(new THREE.CircleGeometry(2.6, 32), new THREE.MeshBasicMaterial({ color: 0xffb070, transparent: true, opacity: 0.25, depthWrite: false, blending: THREE.AdditiveBlending })); api.own(sunGlow.material); sunGlow.position.set(0, 1.4, -8.9); api.add(sunGlow);
          const ribbons = []; const cols = [0xffaec9, 0x9fd8ff, 0xfff1a8, 0xc9f0d8];
          for (let i = 0; i < 6; i++) { const r = new THREE.Mesh(new THREE.PlaneGeometry(0.22, 7, 1, 14), new THREE.MeshToonMaterial({ color: cols[i % 4], side: THREE.DoubleSide })); api.own(r.material); r.rotation.x = -Math.PI / 2; r.position.set(-0.75 + i * 0.3, 0.08 + (i % 2) * 0.02, -4.4); r.userData.seed = i; api.add(r); ribbons.push(r); }
          const posts = []; for (let i = 0; i < 4; i++) { for (let s = -1; s <= 1; s += 2) { const p = P.pillar(0xe6d3dc, 1.0, 0.05); p.position.set(s * 1.0, 0, -1.4 - i * 1.6); api.add(p); posts.push(p); const bow = new THREE.Mesh(new THREE.TorusGeometry(0.1, 0.03, 6, 12), api.FX.Materials.cloth(cols[i % 4])); bow.position.set(s * 1.0, 1.05, -1.4 - i * 1.6); api.add(bow); } }
          const knot = new THREE.Mesh(new THREE.TorusKnotGeometry(0.22, 0.07, 60, 8), api.FX.Materials.cloth(0xffaec9)); knot.position.set(0, 0.5, -0.8);
          const petals = api.particles(api.FX.VFX.sparkles({ area: [5, 3, 9], baseY: 0.5, count: 30 })); petals.points.position.z = -3;
          let tie = 0, stageLevel = 0;
          api.prop(knot, 'dreamway_sylveon_knot', 'the last knot', { knotted: true }, () => { tie = 1; });
          api.onUpdate((dt, t) => {
            tie = Math.max(0, tie - dt * 0.2);
            ribbons.forEach(r => { const pos = r.geometry.attributes.position; for (let v = 0; v < pos.count; v++) { const y = pos.getY(v); pos.setZ(v, Math.sin(t * 1.5 + y * 0.8 + r.userData.seed) * (0.12 - stageLevel * 0.02 + tie * 0.2)); } pos.needsUpdate = true; });
            knot.rotation.y += dt * (0.3 + tie * 3); knot.scale.setScalar(1 + tie * 0.2);
            sun.material.emissiveIntensity = 1.4 + stageLevel * 0.3 + tie * 0.8; sunGlow.material.opacity = 0.25 + stageLevel * 0.08 + tie * 0.3; sun.position.y = 1.4 + stageLevel * 0.5 + tie * 0.4; sunGlow.position.y = sun.position.y;
            petals.points.material.opacity = 0.4 + tie * 0.5;
          });
          api.onStage(stage => { stageLevel = stage; });
          api.toy('plush', 0xffaec9, new THREE.Vector3(1.4, 0.15, 1.0));
          api.memento('ribbon', 0xffaec9, new THREE.Vector3(-1.5, 0.1, 1.2), 'The last ribbon. It has not been tied yet, because once it is, it will be morning, and this will all be a dream.');
          return { spawnPoint: new THREE.Vector3(0, 0, 0.8) };
        }
      }
    }
  });
})(window);
