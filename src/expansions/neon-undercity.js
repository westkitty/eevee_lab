/* ==========================================================================
   EXPANSION 03 — NEON UNDERCITY
   A rain-slick night city under a rail viaduct: arcades, rooftop gardens,
   subway platforms, a data spire, an aquarium bar. Hub: Lantern Alley Junction.
   ========================================================================== */
(function (global) {
  'use strict';
  const THREE = global.THREE;
  const K = global.ExpansionKit;
  const P = K.P;

  function neonSign(api, color, w = 1.2, h = 0.3) {
    const g = new THREE.Group();
    const back = new THREE.Mesh(new THREE.BoxGeometry(w + 0.1, h + 0.1, 0.06), api.FX.Materials.stone(0x1a1c24));
    const tube = new THREE.Mesh(new THREE.PlaneGeometry(w, h), api.FX.Materials.emissiveAccent(color, 1.3));
    tube.position.z = 0.04;
    const light = new THREE.PointLight(color, 0.5, 3.5); light.position.z = 0.4;
    g.add(back, tube, light);
    g.userData.tube = tube; g.userData.light = light;
    return g;
  }

  K.registerExpansion({
    id: 'undercity',
    displayName: 'Neon Undercity — Lantern Alley Junction',
    tagline: 'A city that only exists after dark.',
    mood: 'Rain on neon, trains overhead, and a street that smells of noodles and ozone.',
    doorColor: 0xff3fa4,

    hub: {
      radius: 6.0, floorColor: 0x1f2230,
      weather: ['rain', 'drizzle', 'mist', 'clear'], life: 'sparks',
      stages: [
        { id: 'stranger', label: 'Stranger in Town' }, { id: 'regular', label: 'Regular' },
        { id: 'local', label: 'Local' }, { id: 'legend', label: 'Alley Legend' }
      ],
      lights: { hemiSky: 0x5a4a8a, hemiGround: 0x0a0a14, hemiIntensity: 0.32, keyColor: 0xff9ad0, keyIntensity: 0.55, keyPos: [3, 8, 2], fillColor: 0x3fd6ff, fillIntensity: 0.3, fillPos: [-5, 4, -3] },
      variants: [{ id: 'midnight', label: 'Midnight' }, { id: 'lastcall', label: 'Last Call', keyColor: 0xffc36a, hemiIntensity: 0.22 }],
      build(api) {
        // Wet asphalt sheen, a viaduct overhead, stalls and a ramen cart centrepiece.
        const sheen = new THREE.Mesh(new THREE.CircleGeometry(5.9, 48), new THREE.MeshStandardMaterial({ color: 0x14161f, metalness: 0.6, roughness: 0.25 })); api.own(sheen.material); sheen.rotation.x = -Math.PI / 2; sheen.position.y = 0.01; api.add(sheen);
        const via = api.FX.Materials.stone(0x2a2d38);
        for (let i = 0; i < 5; i++) { const col = new THREE.Mesh(new THREE.BoxGeometry(0.5, 4.2, 0.5), via); col.position.set(-4 + i * 2, 2.1, -4.6); api.add(P.shadowed(col)); }
        const deck = new THREE.Mesh(new THREE.BoxGeometry(11, 0.4, 1.6), via); deck.position.set(0, 4.4, -4.6); api.add(P.shadowed(deck));
        const train = new THREE.Mesh(new THREE.BoxGeometry(3.2, 0.9, 0.9), api.FX.Materials.metal(0x9aa7b8)); train.position.set(-8, 5.1, -4.6); api.add(train);
        const trainWin = api.FX.Materials.emissiveAccent(0xfff0b3, 0.9); for (let i = 0; i < 6; i++) { const w = new THREE.Mesh(new THREE.PlaneGeometry(0.35, 0.3), trainWin); w.position.set(-1.3 + i * 0.5, 0.1, 0.46); train.add(w); }
        const signs = []; const cols = [0xff3fa4, 0x3fd6ff, 0xfff066, 0x9b5de5, 0x00f5a0];
        for (let i = 0; i < 7; i++) { const s = neonSign(api, cols[i % cols.length], 0.9 + (i % 3) * 0.3, 0.25); const a = i * 0.9 + 0.4; s.position.set(Math.cos(a) * 5.4, 1.8 + (i % 3) * 0.5, Math.sin(a) * 5.4); s.lookAt(0, s.position.y, 0); api.add(s); signs.push(s); }
        const cart = new THREE.Group();
        const body = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.9, 0.7), api.FX.Materials.wood(0x6b4a33)); body.position.y = 0.55; cart.add(P.shadowed(body));
        const awning = new THREE.Mesh(new THREE.BoxGeometry(1.7, 0.05, 1.0), api.FX.Materials.cloth(0xd83c3c)); awning.position.y = 1.5; cart.add(awning);
        const lanternA = P.lantern(0xffc66b); lanternA.position.set(-0.9, 0, 0); lanternA.scale.setScalar(0.8); cart.add(lanternA);
        const pot = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.18, 0.2, 10), api.FX.Materials.metal(0x8a8f99)); pot.position.set(0.3, 1.1, 0); cart.add(pot);
        cart.position.set(0, 0, -2.2); 
        const steam = api.particles(api.FX.VFX.dust({ area: [0.5, 1.2, 0.5], baseY: 1.2, count: 12, color: 0xffffff })); steam.points.position.set(0.3, 0, -2.2);
        let slurp = 0;
        api.curio(cart, 'undercity_ramen_cart', 'the ramen cart', 'undercity_ramen_bowl', 'Ordered at the ramen cart. The cook did not ask what an Eevee eats; the cook already knew.', () => { slurp = 1; });
        const rain = api.particles(api.FX.VFX.droplets({ area: [12, 5, 12], baseY: 4.5, count: 40 }));
        api.add(P.backdrop(9, 9.5, i => P.tower(0x171923, 5 + (i % 4) * 1.5, 1.1 + (i % 2) * 0.4, cols[i % cols.length])));
        api.onUpdate((dt, t) => {
          slurp = Math.max(0, slurp - dt * 0.3); steam.points.material.opacity = 0.25 + slurp * 0.5;
          train.position.x += dt * 3.2; if (train.position.x > 9) train.position.x = -9;
          signs.forEach((s, i) => { const flick = Math.sin(t * (7 + i)) > 0.92 ? 0.3 : 1; s.userData.tube.material.emissiveIntensity = 1.3 * flick; s.userData.light.intensity = 0.5 * flick; });
        });
        return { applyStage(stage) { signs.forEach(s => { s.userData.light.distance = 3.5 + stage * 0.8; }); } };
      }
    },

    rooms: {
      eevee: {
        name: 'Capsule Arcade', mood: 'A back-alley arcade with nine crane machines. Eevee has not won yet. Eevee is not discouraged.',
        floor: { radius: 4.0, color: 0x2b2438 }, weather: ['clear', 'static'], life: 'sparks',
        lights: { hemiSky: 0x7c5fa8, hemiGround: 0x120c1c, hemiIntensity: 0.4, keyColor: 0xff9ad0, keyIntensity: 0.6, keyPos: [2, 6, 3], fillColor: 0x3fd6ff, fillIntensity: 0.35, fillPos: [-4, 4, -2] },
        variants: [{ id: 'openhours', label: 'Open Hours' }, { id: 'afterhours', label: 'After Hours', keyIntensity: 0.2, hemiIntensity: 0.18 }],
        stages: [{ id: 'coin-in', label: 'Coin In' }, { id: 'nearly', label: 'Nearly Had It' }, { id: 'won', label: 'One Prize Won' }, { id: 'highscore', label: 'High Score' }],
        mementoLabel: 'a capsule toy',
        build(api) {
          const cranes = [];
          K.SPECIES.forEach((sp, i) => {
            const g = new THREE.Group();
            const cab = new THREE.Mesh(new THREE.BoxGeometry(0.7, 1.6, 0.7), api.FX.Materials.stone(0x1c1826)); cab.position.y = 0.8; g.add(P.shadowed(cab));
            const glass = new THREE.Mesh(new THREE.BoxGeometry(0.62, 0.8, 0.62), api.FX.Materials.glass(0xbfe6ff, 0.25)); glass.position.y = 1.1; g.add(glass);
            const strip = new THREE.Mesh(new THREE.BoxGeometry(0.72, 0.08, 0.72), api.FX.Materials.emissiveAccent(K.SPECIES_COLOR[sp], 0.9)); strip.position.y = 1.62; g.add(strip);
            const prize = new THREE.Mesh(new THREE.SphereGeometry(0.14, 10, 8), api.FX.Materials.cloth(K.SPECIES_COLOR[sp])); prize.position.y = 0.85; g.add(prize);
            const a = (i / 9) * Math.PI * 2 + 0.35; g.position.set(Math.cos(a) * 3.2, 0, Math.sin(a) * 3.2); g.lookAt(0, 0, 0);
            g.userData.strip = strip; g.userData.prize = prize; api.add(g); cranes.push(g);
          });
          // Setpiece: the claw machine in the middle — the claw drops, grabs, and (sometimes) wins.
          const claw = new THREE.Group();
          const frame = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.1, 1.4), api.FX.Materials.metal(0xc9d1e0)); frame.position.y = 2.0; claw.add(frame);
          const cable = new THREE.Mesh(new THREE.CylinderGeometry(0.01, 0.01, 1, 4), api.FX.Materials.metal(0xc9d1e0)); cable.position.y = 1.5; claw.add(cable);
          const hand = new THREE.Group(); for (let k = 0; k < 3; k++) { const finger = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.3, 0.04), api.FX.Materials.metal(0xc9d1e0)); finger.position.y = -0.15; finger.rotation.z = 0.5; const pivot = new THREE.Group(); pivot.rotation.y = k * 2.09; pivot.add(finger); hand.add(pivot); } hand.position.y = 1.0; claw.add(hand);
          const pile = []; for (let i = 0; i < 6; i++) { const ball = new THREE.Mesh(new THREE.SphereGeometry(0.13, 10, 8), api.FX.Materials.cloth([0xff6b6b, 0x8ecae6, 0xffd166][i % 3])); ball.position.set(Math.cos(i) * 0.35, 0.13, Math.sin(i) * 0.35); claw.add(ball); pile.push(ball); }
          claw.position.set(0, 0, -1.2);
          let phase = 0, win = false;
          api.prop(claw, 'undercity_eevee_claw', 'the claw machine', { clawDropped: true }, () => { phase = 0.001; win = Math.random() < 0.4; });
          api.onUpdate((dt, t) => {
            if (phase > 0) { phase += dt; const d = phase < 1 ? phase : phase < 2 ? 1 : phase < 3 ? 3 - phase : 0; hand.position.y = 1.0 - d * 0.75; cable.scale.y = 1 + d * 0.75; cable.position.y = 2.0 - cable.scale.y / 2; hand.children.forEach(p => { p.children[0].rotation.z = phase > 1 && phase < 3 ? 0.1 : 0.5; }); if (win && phase > 2 && phase < 3) pile[0].position.y = hand.position.y - 0.25; if (phase > 3) { phase = 0; pile[0].position.y = 0.13; } }
            cranes.forEach((c, i) => { c.userData.strip.material.emissiveIntensity = 0.7 + Math.sin(t * 3 + i) * 0.3; c.userData.prize.position.y = 0.85 + Math.sin(t * 2 + i) * 0.02; });
          });
          api.onStage(stage => cranes.forEach((c, i) => { c.userData.prize.visible = i >= stage * 2; }));
          api.particles(api.FX.VFX.sparkles({ area: [6, 3, 6], baseY: 0.6, count: 18, color: 0xff9ad0 }));
          api.toy('ball', 0xff6b6b, new THREE.Vector3(1.4, 0.22, 1.4));
          api.memento('notebook', 0xe0b47a, new THREE.Vector3(-1.5, 0.1, 1.5), 'A capsule toy, still in its capsule. Inside: a tiny plastic Eevee. Meta.');
          return { spawnPoint: new THREE.Vector3(0, 0, 1.0) };
        }
      },

      vaporeon: {
        name: 'Aquarium Bar', mood: 'A bar built inside an aquarium, or an aquarium with a bar in it. Vaporeon is on the wrong side of the glass and delighted.',
        floor: { radius: 4.4, color: 0x102a3a }, weather: ['mist', 'clear'], life: 'droplets',
        lights: { hemiSky: 0x3fa9d6, hemiGround: 0x061420, hemiIntensity: 0.45, keyColor: 0x6fd7ff, keyIntensity: 0.7, keyPos: [1, 7, 3] },
        variants: [{ id: 'blue-hour', label: 'Blue Hour' }, { id: 'jelly-night', label: 'Jelly Night', keyColor: 0xc48cff, hemiIntensity: 0.3 }],
        stages: [{ id: 'seated', label: 'Seated' }, { id: 'fed', label: 'Fish Fed' }, { id: 'in-tank', label: 'In the Tank' }, { id: 'regular', label: 'Regular' }],
        mementoLabel: 'a bar coaster',
        build(api) {
          const tank = new THREE.Mesh(new THREE.CylinderGeometry(4.3, 4.3, 3.2, 40, 1, true), api.FX.Materials.glass(0x6fd7ff, 0.18)); tank.position.y = 1.6; api.add(tank);
          const water = P.waterDisk(4.3, 0x1f6f9a, 3.2); water.rotation.x = Math.PI / 2; api.add(water);
          const bar = new THREE.Mesh(new THREE.BoxGeometry(2.6, 0.9, 0.6), api.FX.Materials.wood(0x3a2a22)); bar.position.set(0, 0.45, -1.8); api.add(P.shadowed(bar));
          const barTop = new THREE.Mesh(new THREE.BoxGeometry(2.8, 0.06, 0.7), api.FX.Materials.emissiveAccent(0x3fd6ff, 0.5)); barTop.position.set(0, 0.93, -1.8); api.add(barTop);
          const stools = []; for (let i = 0; i < 4; i++) { const s = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.15, 0.5, 10), api.FX.Materials.cloth(0xd83c6c)); s.position.set(-1.2 + i * 0.8, 0.25, -1.0); api.add(P.shadowed(s)); stools.push(s); }
          const fish = []; for (let i = 0; i < 12; i++) { const f = new THREE.Mesh(new THREE.ConeGeometry(0.06, 0.22, 5), api.FX.Materials.emissiveAccent([0xffb347, 0x3fd6ff, 0xff6b9d][i % 3], 0.6)); f.rotation.z = -Math.PI / 2; f.userData.seed = i; api.add(f); fish.push(f); }
          const jellies = []; for (let i = 0; i < 5; i++) { const j = new THREE.Mesh(new THREE.SphereGeometry(0.16, 10, 8, 0, Math.PI * 2, 0, Math.PI / 2), api.FX.Materials.emissiveAccent(0xc48cff, 0.7)); j.userData.seed = i; api.add(j); jellies.push(j); }
          const feeder = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.3, 0.2), api.FX.Materials.metal(0x9aa7b8)); feeder.position.set(1.6, 0.15, 1.2);
          const flakes = api.particles(api.FX.VFX.pollen({ area: [4, 2.6, 4], baseY: 0.6, count: 20, color: 0xffd9a0 }));
          let feed = 0, stageLevel = 0;
          api.prop(feeder, 'undercity_vaporeon_feeder', 'the fish feeder', { fishFed: true }, () => { feed = 1; });
          api.onUpdate((dt, t) => {
            feed = Math.max(0, feed - dt * 0.2);
            fish.forEach(f => { const s = f.userData.seed; const a = t * (0.4 + feed * 0.8) + s * 0.52; const r = 2.6 + Math.sin(s) * 0.8 - feed * 0.8; f.position.set(Math.cos(a) * r, 1.2 + Math.sin(t + s) * 0.4 + (s % 3) * 0.4, Math.sin(a) * r); f.rotation.y = -a; });
            jellies.forEach(j => { const s = j.userData.seed; j.position.set(Math.cos(s * 1.3) * 3.2, 1.0 + ((t * 0.15 + s * 0.3) % 1.8), Math.sin(s * 1.3) * 3.2); j.scale.y = 1 + Math.sin(t * 2 + s) * 0.25; });
            flakes.points.material.opacity = feed * 0.8;
            barTop.material.emissiveIntensity = 0.5 + stageLevel * 0.2 + Math.sin(t) * 0.1;
          });
          api.onStage(stage => { stageLevel = stage; });
          api.memento('shell', 0x49b2e8, new THREE.Vector3(-1.7, 0.1, 1.4), 'A coaster: "Aquarium Bar — one free drink to anyone who gets in the tank." Torn at the corner where it was redeemed.');
          return { spawnPoint: new THREE.Vector3(0, 0, 0.8) };
        }
      },

      jolteon: {
        name: 'Substation Rooftop', mood: 'The city\'s power comes through here. On a good night Jolteon can taste every streetlight.',
        floor: { radius: 4.0, color: 0x32363f }, weather: ['static', 'storm', 'rain'], life: 'sparks',
        lights: { hemiSky: 0x6a7fa8, hemiGround: 0x0c0e14, hemiIntensity: 0.36, keyColor: 0xfff5b0, keyIntensity: 0.6, keyPos: [-3, 8, 2], fillColor: 0xff3fa4, fillIntensity: 0.25, fillPos: [4, 3, -3] },
        variants: [{ id: 'load', label: 'Full Load' }, { id: 'brownout', label: 'Brownout', keyIntensity: 0.18, hemiIntensity: 0.14 }],
        stages: [{ id: 'idle', label: 'Grid Idle' }, { id: 'humming', label: 'Humming' }, { id: 'peak', label: 'Peak Load' }, { id: 'lit-city', label: 'City Lit' }],
        mementoLabel: 'a fuse',
        build(api) {
          const transformers = []; for (let i = 0; i < 4; i++) { const g = new THREE.Group(); const box = new THREE.Mesh(new THREE.BoxGeometry(0.8, 1.1, 0.6), api.FX.Materials.metal(0x5d636e)); box.position.y = 0.55; g.add(P.shadowed(box)); for (let k = 0; k < 3; k++) { const ins = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.07, 0.4, 6), api.FX.Materials.cloth(0xd9d2c6)); ins.position.set(-0.25 + k * 0.25, 1.3, 0); g.add(ins); } const a = i * 1.57 + 0.78; g.position.set(Math.cos(a) * 2.6, 0, Math.sin(a) * 2.6); api.add(g); transformers.push(g); }
          const wires = []; for (let i = 0; i < 4; i++) { const w = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 3.6, 4), api.FX.Materials.emissiveAccent(0xfff066, 0.1)); const a = i * 1.57 + 0.78; w.position.set(Math.cos(a) * 1.3, 1.5, Math.sin(a) * 1.3); w.rotation.z = Math.PI / 2; w.rotation.y = -a; api.add(w); wires.push(w); }
          const breaker = new THREE.Mesh(new THREE.BoxGeometry(0.5, 1.4, 0.3), api.FX.Materials.metal(0x8a2b2b)); breaker.position.set(0, 0.7, -1.8);
          const lever = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.5, 0.08), api.FX.Materials.metal(0xd9d2c6)); lever.position.set(0, 1.0, -1.6); lever.rotation.x = 0.6; api.add(lever);
          const skyline = P.backdrop(10, 7.5, i => P.tower(0x11131b, 3 + (i % 4) * 1.4, 0.9, 0x3fd6ff)); api.add(skyline);
          const windows = []; skyline.traverse(o => { if (o.isMesh && o.material && o.material.emissive) windows.push(o); });
          const railing = P.ring(3.9, 0.03, 0x9aa7b8, 0); railing.position.y = 0.9; api.add(railing);
          let surge = 0, stageLevel = 0;
          api.prop(breaker, 'undercity_jolteon_breaker', 'the main breaker', { breakerThrown: true }, () => { surge = 1; lever.rotation.x = -0.6; });
          api.onUpdate((dt, t) => {
            surge = Math.max(0, surge - dt * 0.35); if (surge <= 0) lever.rotation.x += (0.6 - lever.rotation.x) * dt * 2;
            const level = stageLevel * 0.3 + surge;
            wires.forEach((w, i) => { w.material.emissiveIntensity = 0.1 + level * (0.6 + Math.sin(t * 20 + i * 3) * 0.4); });
            windows.forEach((w, i) => { w.visible = Math.sin(t * 0.3 + i * 1.7) > -level; });
          });
          api.onStage(stage => { stageLevel = stage; });
          api.particles(api.FX.VFX.sparks({ area: [6, 3, 6], baseY: 0.6, count: 22 }));
          api.particles(api.FX.VFX.droplets({ area: [8, 4, 8], baseY: 3.4, count: 24 }));
          api.memento('tag', 0xfee033, new THREE.Vector3(1.5, 0.1, 1.3), 'A blown fuse the size of a paw. Labelled, in marker: "NOT MY FAULT — J."');
          return { spawnPoint: new THREE.Vector3(0, 0, 1.2) };
        }
      },

      flareon: {
        name: 'Night Market Grill', mood: 'Charcoal smoke, skewers, paper lanterns. Flareon is technically staff.',
        floor: { radius: 4.2, color: 0x3a2e28 }, weather: ['clear', 'embers', 'drizzle'], life: 'embers',
        lights: { hemiSky: 0xffb070, hemiGround: 0x1a0d08, hemiIntensity: 0.4, keyColor: 0xff9a5c, keyIntensity: 0.7, keyPos: [2, 6, 3] },
        variants: [{ id: 'rush', label: 'Dinner Rush' }, { id: 'closing', label: 'Closing Time', keyIntensity: 0.3, hemiIntensity: 0.2 }],
        stages: [{ id: 'cold-grill', label: 'Grill Cold' }, { id: 'lit', label: 'Grill Lit' }, { id: 'sizzling', label: 'Sizzling' }, { id: 'head-chef', label: 'Head Chef' }],
        mementoLabel: 'a lucky cat',
        build(api) {
          const stall = new THREE.Group();
          const counter = new THREE.Mesh(new THREE.BoxGeometry(2.8, 0.9, 0.8), api.FX.Materials.wood(0x5a3a28)); counter.position.y = 0.45; stall.add(P.shadowed(counter));
          const roof = new THREE.Mesh(new THREE.BoxGeometry(3.2, 0.06, 1.6), api.FX.Materials.cloth(0xd83c3c)); roof.position.y = 2.0; stall.add(roof);
          for (let i = 0; i < 2; i++) { const post = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 2, 6), api.FX.Materials.wood(0x5a3a28)); post.position.set(-1.4 + i * 2.8, 1, 0.6); stall.add(post); }
          const grill = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.2, 0.5), api.FX.Materials.metal(0x33363c)); grill.position.set(0, 1.0, 0); stall.add(grill);
          const coals = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.06, 0.4), api.FX.Materials.emissiveAccent(0xff5a1f, 0.3)); coals.position.set(0, 1.12, 0); stall.add(coals);
          const skewers = []; for (let i = 0; i < 5; i++) { const s = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.5, 4), api.FX.Materials.wood(0xc9a56a)); s.rotation.z = Math.PI / 2; s.position.set(-0.4 + i * 0.2, 1.18, 0); stall.add(s); skewers.push(s); }
          stall.position.set(0, 0, -1.8); 
          const lanterns = []; for (let i = 0; i < 8; i++) { const l = new THREE.Mesh(new THREE.SphereGeometry(0.14, 8, 8), api.FX.Materials.emissiveAccent(0xff7a3a, 0.9)); const a = i * 0.785; l.position.set(Math.cos(a) * 3.2, 2.2 + (i % 2) * 0.3, Math.sin(a) * 3.2); api.add(l); lanterns.push(l); }
          const grillLight = new THREE.PointLight(0xff6a2f, 0.3, 5); grillLight.position.set(0, 1.4, -1.8); api.add(grillLight);
          const smoke = api.particles(api.FX.VFX.dust({ area: [1.2, 2, 0.6], baseY: 1.2, count: 20, color: 0xbbbbbb, size: 0.08 })); smoke.points.position.set(0, 0, -1.8);
          const embers = api.particles(api.FX.VFX.embers({ area: [1.4, 1.4, 0.8], baseY: 1.1, count: 18 })); embers.points.position.set(0, 0, -1.8);
          const cat = new THREE.Group(); const cb = new THREE.Mesh(new THREE.SphereGeometry(0.14, 10, 8), api.FX.Materials.cloth(0xfff4e0)); cb.position.y = 0.14; const paw = new THREE.Mesh(new THREE.SphereGeometry(0.05, 6, 6), api.FX.Materials.cloth(0xfff4e0)); paw.position.set(0.1, 0.3, 0.05); cat.add(cb, paw); cat.position.set(1.2, 0.95, -1.6); cat.userData.paw = paw; api.add(cat);
          let sizzle = 0, stageLevel = 0;
          api.prop(stall, 'undercity_flareon_grill', 'the charcoal grill', { grillLit: true }, () => { sizzle = 1; });
          api.onUpdate((dt, t) => {
            sizzle = Math.max(0, sizzle - dt * 0.25);
            const level = stageLevel * 0.25 + sizzle; const flick = 1 + Math.sin(t * 13) * 0.08;
            coals.material.emissiveIntensity = (0.3 + level * 1.2) * flick; grillLight.intensity = (0.3 + level * 1.3) * flick;
            smoke.points.material.opacity = 0.15 + level * 0.4; embers.points.material.opacity = level * 0.7;
            skewers.forEach((s, i) => { s.rotation.x += dt * sizzle * (1 + i * 0.2); });
            cat.userData.paw.position.y = 0.3 + Math.sin(t * 4) * 0.03;
          });
          api.onStage(stage => { stageLevel = stage; lanterns.forEach((l, i) => { l.material.emissiveIntensity = 0.5 + stage * 0.2; }); });
          api.add(P.backdrop(8, 7, i => P.tower(0x1a1418, 3 + (i % 3), 1.0, 0xff7a3a)));
          api.toy('plush', 0xf76835, new THREE.Vector3(-1.6, 0.15, 1.3));
          api.memento('frame', 0xf76835, new THREE.Vector3(1.8, 0.12, 1.2), 'A lucky cat with one paw scorched. It still waves. Business is, reportedly, great.');
          return { spawnPoint: new THREE.Vector3(0, 0, 1.0), topology: { sleepSpots: [new THREE.Vector3(1.2, 0, -0.4)] } };
        }
      },

      espeon: {
        name: 'Data Spire Observatory', mood: 'The top of the tallest tower, where the city\'s signals converge. Espeon listens to all of them at once.',
        floor: { radius: 4.0, color: 0x1e1a2e }, weather: ['clear', 'aurora', 'static'], life: 'wisps',
        lights: { hemiSky: 0x7c5fa8, hemiGround: 0x0c0a16, hemiIntensity: 0.4, keyColor: 0xd48cff, keyIntensity: 0.7, keyPos: [0, 9, 2], fillColor: 0x3fd6ff, fillIntensity: 0.3, fillPos: [-4, 3, -3] },
        variants: [{ id: 'uplink', label: 'Uplink' }, { id: 'blackout', label: 'Signal Blackout', keyIntensity: 0.2, hemiIntensity: 0.15 }],
        stages: [{ id: 'listening', label: 'Listening' }, { id: 'tuned', label: 'Tuned In' }, { id: 'broadcasting', label: 'Broadcasting' }, { id: 'oracle', label: 'City Oracle' }],
        mementoLabel: 'a signal chip',
        build(api) {
          const psy = api.own(api.FX.createPsychicMaterial(0xd48cff));
          const dish = new THREE.Mesh(new THREE.SphereGeometry(1.2, 20, 10, 0, Math.PI * 2, 0, Math.PI / 3), api.FX.Materials.metal(0xb9c2cc)); dish.rotation.x = Math.PI; dish.position.set(0, 2.2, -2.0); api.add(dish);
          const mast = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.1, 2.2, 6), api.FX.Materials.metal(0x6d7480)); mast.position.set(0, 1.1, -2.0); api.add(mast);
          const feed = P.orb(0xd48cff, 0.12, 1.2); feed.position.set(0, 1.5, -2.0); api.add(feed);
          const rings = []; for (let i = 0; i < 4; i++) { const r = new THREE.Mesh(new THREE.TorusGeometry(0.4 + i * 0.35, 0.02, 8, 40), psy); r.position.set(0, 1.5, -2.0); r.rotation.x = Math.PI / 2; api.add(r); rings.push(r); }
          const holos = []; for (let i = 0; i < 6; i++) { const h = new THREE.Mesh(new THREE.PlaneGeometry(0.5, 0.32), new THREE.MeshBasicMaterial({ color: [0x3fd6ff, 0xd48cff, 0xff3fa4][i % 3], transparent: true, opacity: 0.3, side: THREE.DoubleSide, depthWrite: false })); api.own(h.material); const a = i * 1.05; h.position.set(Math.cos(a) * 2.4, 1.4 + (i % 3) * 0.4, Math.sin(a) * 2.4); h.lookAt(0, h.position.y, 0); api.add(h); holos.push(h); }
          const console_ = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.7, 0.5), api.FX.Materials.stone(0x2a2540)); console_.position.set(0, 0.35, 0.2);
          const screen = new THREE.Mesh(new THREE.PlaneGeometry(1.2, 0.35), api.FX.Materials.emissiveAccent(0x3fd6ff, 0.7)); screen.position.set(0, 0.72, 0.2); screen.rotation.x = -0.9; api.add(screen);
          let ping = 0, stageLevel = 0;
          api.prop(console_, 'undercity_espeon_console', 'the uplink console', { tuned: true }, () => { ping = 1; });
          api.onUpdate((dt, t) => {
            psy.uniforms.uTime.value = t; ping = Math.max(0, ping - dt * 0.3);
            rings.forEach((r, i) => { const k = 1 + ((t * 0.6 + i * 0.25) % 1) * (0.6 + ping * 2); r.scale.setScalar(k); r.rotation.z += dt * 0.2; });
            holos.forEach((h, i) => { h.material.opacity = 0.2 + stageLevel * 0.08 + ping * 0.5 * Math.max(0, Math.sin(t * 5 + i)); h.position.y += Math.sin(t + i) * dt * 0.03; });
            dish.rotation.y += dt * (0.1 + ping * 0.8); feed.material.emissiveIntensity = 1.2 + ping * 2;
          });
          api.onStage(stage => { stageLevel = stage; screen.material.emissiveIntensity = 0.7 + stage * 0.3; });
          api.particles(api.FX.VFX.motes({ area: [7, 3, 7], baseY: 0.5, count: 24, color: 0xd48cff }));
          api.add(P.backdrop(10, 8, i => P.tower(0x11101c, 1 + (i % 4) * 1.2, 1.0, 0xff3fa4)));
          api.memento('tag', 0xc68fed, new THREE.Vector3(1.7, 0.1, 1.4), 'A signal chip. Whatever was on it, Espeon read it without plugging it in, then put it back exactly where it was.');
          return { spawnPoint: new THREE.Vector3(0, 0, 1.4) };
        }
      },

      umbreon: {
        name: 'Last Train Platform', mood: 'An abandoned subway platform. The last train never came, so Umbreon waits for it out of principle.',
        floor: { radius: 4.4, color: 0x24262e }, weather: ['clear', 'moon-haze', 'drizzle'], life: 'fireflies',
        lights: { hemiSky: 0x4a5270, hemiGround: 0x08090e, hemiIntensity: 0.3, keyColor: 0xb9c6ff, keyIntensity: 0.4, keyPos: [0, 6, 3], fillColor: 0xfff066, fillIntensity: 0.15, fillPos: [-4, 3, -3] },
        variants: [{ id: 'flicker', label: 'Flicker' }, { id: 'ghost-train', label: 'Ghost Train', keyColor: 0x8899ff, hemiIntensity: 0.18 }],
        stages: [{ id: 'waiting', label: 'Waiting' }, { id: 'announced', label: 'Announced' }, { id: 'lights-on', label: 'Track Lit' }, { id: 'arrived', label: 'It Arrived' }],
        mementoLabel: 'a ticket stub',
        build(api) {
          const track = new THREE.Mesh(new THREE.BoxGeometry(9, 0.3, 1.6), api.FX.Materials.stone(0x141519)); track.position.set(0, -0.15, -2.8); api.add(track);
          for (let s = -1; s <= 1; s += 2) { const rail = new THREE.Mesh(new THREE.BoxGeometry(9, 0.06, 0.06), api.FX.Materials.metal(0x8a8f99)); rail.position.set(0, 0.02, -2.8 + s * 0.4); api.add(rail); }
          const tiles = api.FX.Materials.stone(0x3a4050); for (let i = 0; i < 9; i++) { const t = new THREE.Mesh(new THREE.BoxGeometry(0.9, 2.6, 0.1), tiles); t.position.set(-4 + i, 1.3, -4.0); api.add(t); }
          const stripe = new THREE.Mesh(new THREE.BoxGeometry(9, 0.2, 0.02), api.FX.Materials.emissiveAccent(0xfff066, 0.3)); stripe.position.set(0, 1.4, -3.94); api.add(stripe);
          const tubes = []; for (let i = 0; i < 4; i++) { const tube = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.06, 0.12), api.FX.Materials.emissiveAccent(0xdfe8ff, 0.6)); tube.position.set(-3 + i * 2, 3.0, -1.4); api.add(tube); tubes.push(tube); }
          const bench = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.1, 0.45), api.FX.Materials.wood(0x5a4a3a)); bench.position.set(1.2, 0.45, -0.4); api.add(P.shadowed(bench)); for (let i = 0; i < 2; i++) { const leg = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.45, 0.4), api.FX.Materials.metal(0x3a3f47)); leg.position.set(0.6 + i * 1.2, 0.22, -0.4); api.add(leg); }
          const board = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.5, 0.1), api.FX.Materials.stone(0x111318)); board.position.set(-1.6, 2.2, -1.2);
          const boardText = new THREE.Mesh(new THREE.PlaneGeometry(1.4, 0.3), api.FX.Materials.emissiveAccent(0xffa640, 0.2)); boardText.position.set(-1.6, 2.2, -1.14); api.add(boardText);
          const headlight = new THREE.PointLight(0xfff4c8, 0, 14); headlight.position.set(-9, 1.0, -2.8); api.add(headlight);
          const train = new THREE.Mesh(new THREE.BoxGeometry(3.6, 1.6, 1.2), api.FX.Materials.metal(0x3a3f4b)); train.position.set(-12, 0.8, -2.8); api.add(train);
          let arrive = 0, stageLevel = 0;
          api.prop(board, 'undercity_umbreon_board', 'the departure board', { announced: true }, () => { arrive = 6; train.position.x = -12; });
          api.onUpdate((dt, t) => {
            tubes.forEach((tube, i) => { tube.material.emissiveIntensity = Math.sin(t * (9 + i * 2)) > 0.85 ? 0.05 : 0.6 + stageLevel * 0.1; });
            boardText.material.emissiveIntensity = arrive > 0 ? 0.9 + Math.sin(t * 8) * 0.4 : 0.2 + stageLevel * 0.15;
            if (arrive > 0) { arrive -= dt; const x = -12 + (6 - arrive) * 2.2; train.position.x = Math.min(0, x); headlight.position.x = train.position.x - 1.8; headlight.intensity = arrive > 0.5 ? 2.2 : 0; if (arrive <= 0) { train.position.x = -12; headlight.intensity = 0; } }
          });
          api.onStage(stage => { stageLevel = stage; stripe.material.emissiveIntensity = 0.3 + stage * 0.3; });
          api.particles(api.FX.VFX.dust({ area: [8, 3, 6], baseY: 0.3, count: 24, color: 0x9aa7b8 }));
          api.memento('tag', 0x8899ff, new THREE.Vector3(2.0, 0.1, 1.2), 'A ticket stub for the last train. Unpunched. Umbreon is keeping it, in case.');
          return { spawnPoint: new THREE.Vector3(0, 0, 1.0), topology: { sleepSpots: [new THREE.Vector3(1.2, 0, -0.1)] } };
        }
      },

      leafeon: {
        name: 'Rooftop Farm', mood: 'Planters, solar panels and a beehive on top of a parking garage. Leafeon runs the place, quietly.',
        floor: { radius: 4.4, color: 0x4a5a48 }, weather: ['clear', 'pollen', 'rain'], life: 'butterflies',
        lights: { hemiSky: 0xbfd6ff, hemiGround: 0x1e2a1e, hemiIntensity: 0.45, keyColor: 0xffe7c9, keyIntensity: 0.65, keyPos: [3, 8, 3], fillColor: 0xff3fa4, fillIntensity: 0.2, fillPos: [-4, 3, -4] },
        variants: [{ id: 'night-shift', label: 'Night Shift' }, { id: 'growlamp', label: 'Grow Lamps', keyColor: 0xff8ad0, hemiIntensity: 0.32 }],
        stages: [{ id: 'planted', label: 'Planted' }, { id: 'watered', label: 'Watered' }, { id: 'harvest', label: 'First Harvest' }, { id: 'oasis', label: 'Rooftop Oasis' }],
        mementoLabel: 'a seed packet',
        build(api) {
          const planters = []; for (let i = 0; i < 6; i++) { const g = new THREE.Group(); const box = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.4, 0.5), api.FX.Materials.wood(0x6b4a33)); box.position.y = 0.2; g.add(P.shadowed(box)); const soil = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.06, 0.42), api.FX.Materials.stone(0x3a2a20)); soil.position.y = 0.4; g.add(soil); const crops = []; for (let k = 0; k < 5; k++) { const c = new THREE.Mesh(new THREE.SphereGeometry(0.09, 7, 6), api.FX.Materials.foliage([0x74c15c, 0xff6b6b, 0xffd166][i % 3])); c.position.set(-0.4 + k * 0.2, 0.5, 0); g.add(c); crops.push(c); } g.userData.crops = crops; const a = i * 1.05 + 0.3; g.position.set(Math.cos(a) * 2.6, 0, Math.sin(a) * 2.6); g.lookAt(0, 0, 0); api.add(g); planters.push(g); }
          for (let i = 0; i < 3; i++) { const panel = new THREE.Mesh(new THREE.BoxGeometry(1.0, 0.04, 0.7), api.FX.Materials.metal(0x1f2a44)); panel.position.set(-1.4 + i * 1.4, 1.3, -3.2); panel.rotation.x = -0.5; api.add(panel); const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 1.2, 5), api.FX.Materials.metal(0x6d7480)); leg.position.set(-1.4 + i * 1.4, 0.6, -3.2); api.add(leg); }
          const hive = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.7, 0.5), api.FX.Materials.cloth(0xf3e7c8)); hive.position.set(2.4, 0.35, -1.2); api.add(P.shadowed(hive));
          const bees = api.particles(api.FX.VFX.fireflies({ area: [2, 1.5, 2], baseY: 0.6, count: 10, color: 0xffd166 })); bees.points.position.set(2.4, 0, -1.2);
          const tank = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.4, 1.0, 12), api.FX.Materials.metal(0x8a8f99)); tank.position.set(-2.4, 0.5, -1.2);
          const spray = api.particles(api.FX.VFX.droplets({ area: [5, 1.5, 5], baseY: 1.4, count: 26 }));
          const growlamps = []; for (let i = 0; i < 4; i++) { const l = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.05, 0.1), api.FX.Materials.emissiveAccent(0xff8ad0, 0.3)); const a = i * 1.57; l.position.set(Math.cos(a) * 2.6, 1.4, Math.sin(a) * 2.6); api.add(l); growlamps.push(l); }
          let water = 0, stageLevel = 0;
          api.prop(tank, 'undercity_leafeon_tank', 'the rain tank', { watered: true }, () => { water = 1; });
          api.onUpdate((dt, t) => {
            water = Math.max(0, water - dt * 0.3); spray.points.material.opacity = water * 0.8;
            planters.forEach((p, i) => p.userData.crops.forEach((c, k) => { const s = 1 + stageLevel * 0.25 + water * 0.4 + Math.sin(t * 1.4 + k + i) * 0.04; c.scale.setScalar(s); c.position.y = 0.44 + 0.06 * s; }));
            growlamps.forEach((l, i) => { l.material.emissiveIntensity = 0.3 + stageLevel * 0.2 + Math.sin(t * 2 + i) * 0.1; });
          });
          api.onStage(stage => { stageLevel = stage; });
          api.add(P.backdrop(9, 7.5, i => P.tower(0x171923, 2 + (i % 4) * 1.4, 1.0, 0x00f5a0)));
          api.toy('ball', 0x76b852, new THREE.Vector3(1.4, 0.22, 1.4));
          api.memento('notebook', 0x76b852, new THREE.Vector3(-1.6, 0.1, 1.5), 'A seed packet, empty. On the back, a crop plan in pawprint that is, honestly, better than most.');
          return { spawnPoint: new THREE.Vector3(0, 0, 1.0) };
        }
      },

      glaceon: {
        name: 'Cold Storage Rink', mood: 'A freezer warehouse someone flooded and froze. Now it\'s a rink, and Glaceon is the Zamboni.',
        floor: { radius: 4.2, color: 0xd9eef5 }, weather: ['clear', 'diamond-dust', 'snow'], life: 'crystals',
        lights: { hemiSky: 0xcfe9ff, hemiGround: 0x1a2a3a, hemiIntensity: 0.5, keyColor: 0xdff4ff, keyIntensity: 0.75, keyPos: [0, 8, 2], fillColor: 0xff3fa4, fillIntensity: 0.25, fillPos: [-4, 3, -3] },
        variants: [{ id: 'floodlit', label: 'Floodlit' }, { id: 'disco-ice', label: 'Disco Ice', keyColor: 0xff8ad0, hemiIntensity: 0.3 }],
        stages: [{ id: 'rough', label: 'Rough Ice' }, { id: 'resurfaced', label: 'Resurfaced' }, { id: 'mirror', label: 'Mirror Ice' }, { id: 'rink-king', label: 'Rink Royalty' }],
        mementoLabel: 'a skate lace',
        build(api) {
          const ice = new THREE.Mesh(new THREE.CircleGeometry(3.6, 40), new THREE.MeshStandardMaterial({ color: 0xdff4ff, metalness: 0.3, roughness: 0.15 })); api.own(ice.material); ice.rotation.x = -Math.PI / 2; ice.position.y = 0.02; api.add(ice);
          const boards = new THREE.Mesh(new THREE.CylinderGeometry(3.8, 3.8, 0.7, 40, 1, true), api.FX.Materials.cloth(0xf4f4f4)); boards.material.side = THREE.DoubleSide; boards.position.y = 0.35; api.add(boards);
          const shelving = api.FX.Materials.metal(0x6d7480); for (let i = 0; i < 6; i++) { const s = new THREE.Mesh(new THREE.BoxGeometry(1.2, 2.6, 0.4), shelving); const a = i * 1.05 + 0.5; s.position.set(Math.cos(a) * 4.9, 1.3, Math.sin(a) * 4.9); s.lookAt(0, 1.3, 0); api.add(s); const crate = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.5, 0.3), api.FX.Materials.wood(0x8a6a44)); crate.position.set(Math.cos(a) * 4.9, 2.0, Math.sin(a) * 4.9); api.add(crate); }
          const flood = []; for (let i = 0; i < 4; i++) { const f = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.15, 0.4), api.FX.Materials.emissiveAccent(0xffffff, 0.6)); const a = i * 1.57 + 0.78; f.position.set(Math.cos(a) * 2.6, 3.6, Math.sin(a) * 2.6); api.add(f); flood.push(f); }
          const ball = new THREE.Mesh(new THREE.SphereGeometry(0.28, 12, 10), api.FX.Materials.metal(0xd9dde3)); ball.position.set(0, 3.4, 0); api.add(ball);
          const ballLight = new THREE.PointLight(0xff8ad0, 0, 8); ballLight.position.set(0, 3.0, 0); api.add(ballLight);
          const zam = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.4, 0.5), api.FX.Materials.metal(0x3fa9d6)); zam.position.set(1.4, 0.2, 1.0); zam.visible = false; api.add(zam);
          const trail = new THREE.Mesh(new THREE.RingGeometry(2.4, 2.9, 40), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0, side: THREE.DoubleSide, depthWrite: false })); api.own(trail.material); trail.rotation.x = -Math.PI / 2; trail.position.y = 0.03; api.add(trail);
          const dust = api.particles(api.FX.VFX.snow({ area: [7, 3, 7], baseY: 2.4, count: 24 }));
          let lap = 0, stageLevel = 0;
          api.prop(ball, 'undercity_glaceon_ball', 'the mirror ball', { resurfaced: true }, () => { lap = 4; zam.visible = true; });
          api.onUpdate((dt, t) => {
            ball.rotation.y += dt * (0.4 + (lap > 0 ? 3 : 0)); ballLight.intensity = lap > 0 ? 1.4 : stageLevel * 0.2;
            if (lap > 0) { lap -= dt; const a = (4 - lap) * 3.2; zam.position.set(Math.cos(a) * 2.65, 0.2, Math.sin(a) * 2.65); zam.rotation.y = -a; trail.material.opacity = Math.min(0.35, (4 - lap) * 0.1); if (lap <= 0) zam.visible = false; } else trail.material.opacity = Math.max(0, trail.material.opacity - dt * 0.05);
            ice.material.roughness = Math.max(0.03, 0.15 - stageLevel * 0.035 - trail.material.opacity * 0.1);
          });
          api.onStage(stage => { stageLevel = stage; flood.forEach(f => { f.material.emissiveIntensity = 0.6 + stage * 0.25; }); });
          api.memento('tag', 0x8be5f5, new THREE.Vector3(2.4, 0.1, 1.6), 'A skate lace, frozen into a perfect figure-eight. Nobody here has feet the right shape for skates.');
          return { spawnPoint: new THREE.Vector3(0, 0, 1.0) };
        }
      },

      sylveon: {
        name: 'Karaoke Lantern Loft', mood: 'A tiny karaoke room above a laundromat. Sylveon holds the mic with a ribbon and takes requests.',
        floor: { radius: 3.8, color: 0x3a2434 }, weather: ['clear', 'petals', 'drizzle'], life: 'ribbons',
        lights: { hemiSky: 0xff9ad0, hemiGround: 0x1a0c18, hemiIntensity: 0.4, keyColor: 0xffb3d9, keyIntensity: 0.7, keyPos: [2, 6, 3], fillColor: 0x3fd6ff, fillIntensity: 0.3, fillPos: [-3, 3, -2] },
        variants: [{ id: 'ballad', label: 'Ballad' }, { id: 'encore', label: 'Encore', keyColor: 0xfff066, hemiIntensity: 0.5 }],
        stages: [{ id: 'mic-check', label: 'Mic Check' }, { id: 'first-song', label: 'First Song' }, { id: 'duet', label: 'Duet' }, { id: 'headliner', label: 'Headliner' }],
        mementoLabel: 'a song slip',
        build(api) {
          const walls = api.FX.Materials.cloth(0x4a2a44); for (let i = 0; i < 10; i++) { const a = (i / 10) * Math.PI * 2; if (a > 4.4 && a < 5.2) continue; const w = new THREE.Mesh(new THREE.BoxGeometry(0.9, 2.4, 0.1), walls); w.position.set(Math.cos(a) * 3.5, 1.2, Math.sin(a) * 3.5); w.lookAt(0, 1.2, 0); api.add(w); }
          const couch = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.5, 0.8), api.FX.Materials.cloth(0xd83c6c)); couch.position.set(0, 0.25, 1.8); api.add(P.shadowed(couch)); const back = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.6, 0.2), api.FX.Materials.cloth(0xd83c6c)); back.position.set(0, 0.75, 2.15); api.add(back);
          const screen = new THREE.Mesh(new THREE.PlaneGeometry(2.0, 1.2), api.FX.Materials.emissiveAccent(0x3fd6ff, 0.5)); screen.position.set(0, 1.6, -2.9); api.add(screen);
          const lyric = new THREE.Mesh(new THREE.PlaneGeometry(1.4, 0.1), api.FX.Materials.emissiveAccent(0xfff066, 1.0)); lyric.position.set(0, 1.4, -2.85); api.add(lyric);
          const stage_ = new THREE.Mesh(new THREE.CylinderGeometry(1.2, 1.2, 0.2, 20), api.FX.Materials.wood(0x3a2a22)); stage_.position.set(0, 0.1, -1.4); api.add(stage_);
          const mic = new THREE.Group(); const stand = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.03, 1.1, 6), api.FX.Materials.metal(0xc9d1e0)); stand.position.y = 0.55; const head = new THREE.Mesh(new THREE.SphereGeometry(0.08, 8, 8), api.FX.Materials.metal(0x33363c)); head.position.y = 1.15; const ribbon = new THREE.Mesh(new THREE.PlaneGeometry(0.06, 0.5), new THREE.MeshToonMaterial({ color: 0xffaec9, side: THREE.DoubleSide })); api.own(ribbon.material); ribbon.position.set(0.08, 0.9, 0); mic.add(stand, head, ribbon); mic.position.set(0, 0.2, -1.4); api.add(mic);
          const lanterns = []; for (let i = 0; i < 9; i++) { const l = new THREE.Mesh(new THREE.SphereGeometry(0.12, 8, 8), api.FX.Materials.emissiveAccent(K.SPECIES_COLOR[K.SPECIES[i]], 0.6)); const a = (i / 9) * Math.PI * 2; l.position.set(Math.cos(a) * 2.4, 2.3, Math.sin(a) * 2.4); api.add(l); lanterns.push(l); }
          const discoLight = new THREE.PointLight(0xff8ad0, 0.2, 7); discoLight.position.set(0, 2.6, 0); api.add(discoLight);
          const sparkles = api.particles(api.FX.VFX.sparkles({ area: [6, 3, 6], baseY: 0.6, count: 26 }));
          let song = 0, stageLevel = 0;
          api.prop(mic, 'undercity_sylveon_mic', 'the microphone', { sang: true }, () => { song = 8; });
          api.onUpdate((dt, t) => {
            song = Math.max(0, song - dt); const beat = song > 0 ? Math.max(0, Math.sin(t * 7)) : 0;
            lyric.scale.x = 0.2 + (song > 0 ? ((t * 0.5) % 1) : 0); lyric.material.emissiveIntensity = 0.6 + beat;
            lanterns.forEach((l, i) => { l.material.emissiveIntensity = 0.5 + stageLevel * 0.15 + (song > 0 ? Math.max(0, Math.sin(t * 7 + i * 0.7)) : Math.sin(t + i) * 0.1); });
            discoLight.intensity = 0.2 + beat * 1.2; discoLight.color.setHSL((t * 0.2) % 1, 0.8, 0.65);
            sparkles.points.material.opacity = 0.3 + beat * 0.6; ribbon.rotation.z = Math.sin(t * 4) * (0.1 + beat * 0.3);
          });
          api.onStage(stage => { stageLevel = stage; screen.material.emissiveIntensity = 0.5 + stage * 0.2; });
          api.toy('plush', 0xffaec9, new THREE.Vector3(1.4, 0.15, 0.6));
          api.memento('ribbon', 0xffaec9, new THREE.Vector3(-1.6, 0.1, 0.8), 'A song request slip. Song: "anything". Requested by: a pawprint. Performed: enthusiastically.');
          return { spawnPoint: new THREE.Vector3(0, 0, 0.6), topology: { sleepSpots: [new THREE.Vector3(0.6, 0, 1.4)] } };
        }
      }
    }
  });
})(window);
