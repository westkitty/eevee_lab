/* ============================================================================
   PROCEDURAL HABITAT ART — owned, room-local decals and landmark accents.
   No external art dependencies; generated textures are disposed with their room.
   ============================================================================ */
(function (global) {
  'use strict';
  const THREE = global.THREE;

  const PALETTES = {
    conservatory: [0x9bbde0, 0xe9c784], eevee: [0xc49a66, 0xf4dfa9], vaporeon: [0x4fc3eb, 0xb7f2ff],
    jolteon: [0xffdd4b, 0xfff2a6], flareon: [0xf46c39, 0xffbf70], espeon: [0xc59ae8, 0xf1d3ff],
    umbreon: [0x6d7be2, 0xb9c5ff], leafeon: [0x63b45b, 0xc8e890], glaceon: [0x72cbe7, 0xd8f7ff],
    sylveon: [0xef92bf, 0xffd6e8], tidewild: [0x3bbac1, 0xffd184], emberpeak: [0xed754b, 0xffd27e],
    undercity: [0x67d5fa, 0xef78d7], dreamway: [0xa889e6, 0x8de4d0]
  };

  function colorFor(roomId) {
    const id = String(roomId || 'conservatory').toLowerCase();
    const key = Object.keys(PALETTES).find(k => id.indexOf(k) >= 0) || 'conservatory';
    return PALETTES[key];
  }

  function markerTexture(primary, secondary, glyph) {
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = 128;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, 128, 128);
    const g = ctx.createRadialGradient(64, 64, 4, 64, 64, 60);
    g.addColorStop(0, `rgba(255,255,255,.48)`);
    g.addColorStop(.48, `#${secondary.toString(16).padStart(6, '0')}88`);
    g.addColorStop(1, `#${primary.toString(16).padStart(6, '0')}00`);
    ctx.fillStyle = g; ctx.fillRect(0, 0, 128, 128);
    ctx.strokeStyle = `#${primary.toString(16).padStart(6, '0')}`;
    ctx.lineWidth = 5; ctx.globalAlpha = .76;
    ctx.beginPath(); ctx.arc(64, 64, 46, 0, Math.PI * 2); ctx.stroke();
    ctx.beginPath(); ctx.arc(64, 64, 28, .2, Math.PI * 1.8); ctx.stroke();
    ctx.globalAlpha = .9; ctx.fillStyle = `#${secondary.toString(16).padStart(6, '0')}`;
    ctx.font = 'bold 34px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(glyph || '✦', 64, 64);
    const texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;
    return texture;
  }

  function softSpriteTexture(color) {
    const canvas = document.createElement('canvas'); canvas.width = canvas.height = 32;
    const ctx = canvas.getContext('2d');
    const g = ctx.createRadialGradient(16, 16, 1, 16, 16, 16);
    g.addColorStop(0, `#${color.toString(16).padStart(6, '0')}dd`);
    g.addColorStop(.35, `#${color.toString(16).padStart(6, '0')}88`);
    g.addColorStop(1, `#${color.toString(16).padStart(6, '0')}00`);
    ctx.fillStyle = g; ctx.fillRect(0, 0, 32, 32);
    const texture = new THREE.CanvasTexture(canvas); texture.needsUpdate = true; return texture;
  }

  function decorateRoom(roomId, built) {
    if (!built || !built.group || !THREE) return;
    const colors = colorFor(roomId);
    const floor = (built.group.children || []).find(obj => obj && obj.isMesh && obj.userData && obj.userData.walkable);
    const radius = floor && floor.userData ? Number(floor.userData.walkRadius) || 3 : 3;
    const root = new THREE.Group(); root.name = `procedural_art_${roomId}`;
    const ownedMaterials = []; const ownedTextures = [];
    const decalMap = markerTexture(colors[0], colors[1], '✦'); ownedTextures.push(decalMap);
    const decalMat = new THREE.MeshBasicMaterial({ map: decalMap, transparent: true, opacity: .48, depthWrite: false, side: THREE.DoubleSide });
    ownedMaterials.push(decalMat);
    const decal = new THREE.Mesh(new THREE.CircleGeometry(.62, 32), decalMat);
    decal.rotation.x = -Math.PI / 2; decal.position.set(0, .012, -Math.max(1.15, radius * .48));
    decal.renderOrder = 1; root.add(decal);

    // A few unique-looking clustered set-dressing details stay on the floor rim,
    // leaving the creature's approach, prop sockets and central composition open.
    const accentMat = new THREE.MeshToonMaterial({ color: colors[0] });
    const lightMat = new THREE.MeshToonMaterial({ color: colors[1], emissive: colors[1], emissiveIntensity: .08 });
    ownedMaterials.push(accentMat, lightMat);
    const seed = Array.from(String(roomId || ''), ch => ch.charCodeAt(0)).reduce((a, b) => a + b, 0) || 17;
    const shapes = [
      new THREE.DodecahedronGeometry(.16, 0),
      new THREE.IcosahedronGeometry(.14, 0),
      new THREE.SphereGeometry(.12, 8, 6)
    ];
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2 + seed * .013;
      const r = radius * (.71 + (i % 2) * .07);
      const mesh = new THREE.Mesh(shapes[i % shapes.length], i % 2 ? lightMat : accentMat);
      mesh.position.set(Math.cos(a) * r, .13, Math.sin(a) * r);
      mesh.rotation.set(i * .19, a, i * .13);
      mesh.scale.set(1 + (i % 3) * .25, .55 + (i % 2) * .35, 1);
      mesh.userData.proceduralDressing = true;
      root.add(mesh);
    }

    // Tiny emissive wayfinding pips create a readable route toward existing doors.
    const pipGeo = new THREE.SphereGeometry(.055, 8, 6);
    const pipMat = new THREE.MeshBasicMaterial({ color: colors[1], transparent: true, opacity: .72 });
    ownedMaterials.push(pipMat);
    for (let i = 0; i < 4; i++) {
      const a = -Math.PI / 2 + (i - 1.5) * .18;
      const pip = new THREE.Mesh(pipGeo, pipMat);
      pip.position.set(Math.sin(a) * radius * .54, .035, Math.cos(a) * radius * .54);
      root.add(pip);
    }

    // Two dozen batched glow points add a species/region-coloured ambient accent.
    const sprite = softSpriteTexture(colors[1]); ownedTextures.push(sprite);
    const pointsGeometry = new THREE.BufferGeometry();
    const positions = new Float32Array(18 * 3);
    const phases = new Float32Array(18);
    for (let i = 0; i < 18; i++) {
      const a = (i / 18) * Math.PI * 2 + seed;
      const r = radius * (.45 + ((i * 17) % 37) / 100);
      positions[i * 3] = Math.cos(a) * r;
      positions[i * 3 + 1] = .35 + ((i * 29) % 100) / 100 * 1.55;
      positions[i * 3 + 2] = Math.sin(a) * r;
      phases[i] = i * .61;
    }
    pointsGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const pointsMat = new THREE.PointsMaterial({ color: 0xffffff, size: .17, map: sprite, transparent: true, opacity: .42, depthWrite: false, sizeAttenuation: true });
    ownedMaterials.push(pointsMat);
    const motes = new THREE.Points(pointsGeometry, pointsMat); root.add(motes);
    built.group.add(root);

    const priorUpdate = built.update;
    built.update = function (dt, elapsed) {
      if (priorUpdate) priorUpdate.call(built, dt, elapsed);
      const position = pointsGeometry.attributes.position;
      for (let i = 0; i < phases.length; i++) {
        const base = .35 + ((i * 29) % 100) / 100 * 1.55;
        position.array[i * 3 + 1] = base + Math.sin((elapsed || 0) * .7 + phases[i]) * .12;
      }
      position.needsUpdate = true;
      decal.rotation.z = Math.sin((elapsed || 0) * .13) * .04;
    };

    const priorDispose = built.disposeExtra;
    built.disposeExtra = function () {
      if (priorDispose) priorDispose.call(built);
      ownedMaterials.forEach(m => m && m.dispose && m.dispose());
      ownedTextures.forEach(t => t && t.dispose && t.dispose());
      pointsGeometry.dispose();
    };
    return root;
  }

  global.HabitatArt = { decorateRoom, colorFor, markerTexture, softSpriteTexture };
})(window);
