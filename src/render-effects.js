/* ==========================================================================
   RENDER EFFECTS — reusable material library, pooled particle VFX,
   lightweight shader accents, and ground-contact helpers.
   Everything here is built from primitives; nothing is downloaded.
   ========================================================================== */
(function (global) {
  'use strict';
  const THREE = global.THREE;

  /* ---- Toon material library (roles, not ad hoc materials) ---- */
  const Materials = {
    _cache: new Map(),
    _get(key, factory) {
      if (!this._cache.has(key)) this._cache.set(key, factory());
      return this._cache.get(key);
    },
    stone(color = 0xd8d2c6) {
      return this._get('stone:' + color, () => new THREE.MeshToonMaterial({ color }));
    },
    wood(color = 0x8a5a35) {
      return this._get('wood:' + color, () => new THREE.MeshToonMaterial({ color }));
    },
    cloth(color = 0xffffff) {
      return this._get('cloth:' + color, () => new THREE.MeshToonMaterial({ color }));
    },
    foliage(color = 0x5fae3d) {
      return this._get('foliage:' + color, () => new THREE.MeshToonMaterial({ color, side: THREE.DoubleSide }));
    },
    metal(color = 0xb9c2cc) {
      return this._get('metal:' + color, () => new THREE.MeshStandardMaterial({ color, metalness: 0.75, roughness: 0.3 }));
    },
    glass(color = 0xbfe6ff, opacity = 0.45) {
      return this._get('glass:' + color + ':' + opacity, () => new THREE.MeshPhysicalMaterial({
        color, transparent: true, opacity, roughness: 0.05, metalness: 0, transmission: 0.4
      }));
    },
    emissiveAccent(color = 0xffe082, intensity = 1.2) {
      return this._get('emissive:' + color, () => new THREE.MeshStandardMaterial({
        color, emissive: color, emissiveIntensity: intensity, roughness: 0.4
      }));
    },
    water(color = 0x3fa7d6) {
      return this._get('water:' + color, () => new THREE.MeshPhysicalMaterial({
        color, transparent: true, opacity: 0.82, roughness: 0.1, metalness: 0,
        transmission: 0.25, clearcoat: 0.6
      }));
    },
    ice(color = 0xcdeffb) {
      return this._get('ice:' + color, () => new THREE.MeshPhysicalMaterial({
        color, transparent: true, opacity: 0.75, roughness: 0.08, transmission: 0.35, clearcoat: 0.8
      }));
    }
  };

  /* ---- Cheap shader accents (kept to a handful, not per-surface) ---- */
  const RIPPLE_VERT = `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }`;
  const RIPPLE_FRAG = `
    uniform float uTime;
    uniform vec3 uColor;
    varying vec2 vUv;
    void main() {
      vec2 c = vUv - 0.5;
      float d = length(c) * 18.0;
      float ring = sin(d - uTime * 2.2) * 0.5 + 0.5;
      float fade = smoothstep(1.0, 0.0, length(c) * 1.6);
      float caustic = pow(ring, 3.0) * fade;
      gl_FragColor = vec4(uColor, caustic * 0.55 + 0.12 * fade);
    }`;

  function createWaterMaterial(color = 0x3fa7d6) {
    return new THREE.ShaderMaterial({
      uniforms: { uTime: { value: 0 }, uColor: { value: new THREE.Color(color) } },
      vertexShader: RIPPLE_VERT,
      fragmentShader: RIPPLE_FRAG,
      transparent: true,
      depthWrite: false
    });
  }

  const FRESNEL_VERT = `
    varying vec3 vNormal;
    varying vec3 vViewDir;
    void main() {
      vNormal = normalize(normalMatrix * normal);
      vec4 mv = modelViewMatrix * vec4(position, 1.0);
      vViewDir = normalize(-mv.xyz);
      gl_Position = projectionMatrix * mv;
    }`;
  const FRESNEL_FRAG = `
    uniform vec3 uColor;
    uniform float uIntensity;
    varying vec3 vNormal;
    varying vec3 vViewDir;
    void main() {
      float rim = 1.0 - max(dot(normalize(vNormal), normalize(vViewDir)), 0.0);
      float fresnel = pow(rim, 2.2) * uIntensity;
      gl_FragColor = vec4(uColor, fresnel);
    }`;

  function createFresnelMaterial(color = 0x9be7ff, intensity = 1.0) {
    return new THREE.ShaderMaterial({
      uniforms: { uColor: { value: new THREE.Color(color) }, uIntensity: { value: intensity } },
      vertexShader: FRESNEL_VERT,
      fragmentShader: FRESNEL_FRAG,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      side: THREE.FrontSide
    });
  }

  const PSYCHIC_VERT = `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }`;
  const PSYCHIC_FRAG = `
    uniform float uTime;
    uniform vec3 uColor;
    varying vec2 vUv;
    void main() {
      float pulse = sin(uTime * 1.6 + vUv.x * 6.0) * 0.5 + 0.5;
      float band = smoothstep(0.45, 0.5, abs(fract(vUv.y * 3.0 - uTime * 0.15) - 0.5));
      gl_FragColor = vec4(uColor, (0.25 + pulse * 0.35) * (1.0 - band) * 0.6);
    }`;

  function createPsychicMaterial(color = 0xd09cf5) {
    return new THREE.ShaderMaterial({
      uniforms: { uTime: { value: 0 }, uColor: { value: new THREE.Color(color) } },
      vertexShader: PSYCHIC_VERT,
      fragmentShader: PSYCHIC_FRAG,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending
    });
  }

  /* ---- Pooled particle systems ---- */
  class ParticleField {
    constructor(opts) {
      const {
        count = 40, area = [6, 4, 6], baseY = 0.5, color = 0xffffff,
        size = 0.08, opacity = 0.6, speed = 0.15, drift = 0.02,
        blending = THREE.AdditiveBlending, fall = false
      } = opts;
      this.count = count;
      this.speed = speed;
      this.drift = drift;
      this.fall = fall;
      this.area = area;
      this.baseY = baseY;

      const geo = new THREE.BufferGeometry();
      const positions = new Float32Array(count * 3);
      for (let i = 0; i < count; i++) {
        positions[i * 3] = (Math.random() - 0.5) * area[0];
        positions[i * 3 + 1] = baseY + Math.random() * area[1];
        positions[i * 3 + 2] = (Math.random() - 0.5) * area[2];
      }
      geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      const mat = new THREE.PointsMaterial({
        color, size, transparent: true, opacity, blending, depthWrite: false
      });
      this.points = new THREE.Points(geo, mat);
      this.points.frustumCulled = false;
    }

    update(dt, elapsed) {
      const pos = this.points.geometry.attributes.position.array;
      const [ax, ay, az] = this.area;
      for (let i = 0; i < this.count; i++) {
        const ix = i * 3, iy = i * 3 + 1, iz = i * 3 + 2;
        if (this.fall) {
          pos[iy] -= this.speed * dt * 4;
          if (pos[iy] < this.baseY - 0.2) pos[iy] = this.baseY + ay;
        } else {
          pos[iy] += Math.sin(elapsed * 0.6 + i) * this.drift * dt * 6;
          if (pos[iy] > this.baseY + ay) pos[iy] = this.baseY;
          if (pos[iy] < this.baseY) pos[iy] = this.baseY + ay;
        }
        pos[ix] += Math.cos(elapsed * 0.4 + i) * this.drift * dt * 3;
        pos[iz] += Math.sin(elapsed * 0.5 + i * 1.3) * this.drift * dt * 3;
        if (pos[ix] > ax / 2) pos[ix] = -ax / 2;
        if (pos[ix] < -ax / 2) pos[ix] = ax / 2;
      }
      this.points.geometry.attributes.position.needsUpdate = true;
    }

    setDensityScale(scale) {
      // Cheap quality knob: hide a fraction of the draw via opacity rather than
      // reallocating geometry every quality change.
      this.points.material.opacity = this._baseOpacity == null
        ? (this._baseOpacity = this.points.material.opacity)
        : this._baseOpacity * scale;
    }

    dispose() {
      this.points.geometry.dispose();
      this.points.material.dispose();
    }
  }

  const VFX = {
    dust: (opts) => new ParticleField(Object.assign({ color: 0xfff3c7, size: 0.05, opacity: 0.45, count: 35 }, opts)),
    droplets: (opts) => new ParticleField(Object.assign({ color: 0xcdeffb, size: 0.045, opacity: 0.55, count: 24, fall: true, speed: 0.5 }, opts)),
    sparks: (opts) => new ParticleField(Object.assign({ color: 0xfff066, size: 0.05, opacity: 0.8, count: 18, drift: 0.08 }, opts)),
    embers: (opts) => new ParticleField(Object.assign({ color: 0xff8a3d, size: 0.06, opacity: 0.65, count: 26, drift: 0.03 }, opts)),
    motes: (opts) => new ParticleField(Object.assign({ color: 0xd09cf5, size: 0.05, opacity: 0.5, count: 20, drift: 0.015 }, opts)),
    fireflies: (opts) => new ParticleField(Object.assign({ color: 0xfce029, size: 0.06, opacity: 0.75, count: 16, drift: 0.02 }, opts)),
    pollen: (opts) => new ParticleField(Object.assign({ color: 0xe8f2a0, size: 0.045, opacity: 0.5, count: 30, fall: true, speed: 0.12 }, opts)),
    snow: (opts) => new ParticleField(Object.assign({ color: 0xffffff, size: 0.055, opacity: 0.75, count: 40, fall: true, speed: 0.28 }, opts)),
    sparkles: (opts) => new ParticleField(Object.assign({ color: 0xffd6ee, size: 0.06, opacity: 0.7, count: 24, drift: 0.03 }, opts))
  };

  /* ---- Ground contact: soft blob shadow + optional mark decals (footprints, frost, ripples) ---- */
  function createContactShadow(radius = 1.1, opacity = 0.3) {
    const geo = new THREE.CircleGeometry(radius, 24);
    const mat = new THREE.MeshBasicMaterial({ color: 0x140f0a, transparent: true, opacity, depthWrite: false });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.rotation.x = -Math.PI / 2;
    mesh.position.y = 0.006;
    mesh.renderOrder = 1;
    return mesh;
  }

  function createGroundMark(kind = 'paw', color = 0xffffff, radius = 0.14) {
    let geo;
    if (kind === 'paw') {
      geo = new THREE.CircleGeometry(radius, 10);
    } else if (kind === 'frost') {
      geo = new THREE.RingGeometry(radius * 0.3, radius, 12);
    } else {
      geo = new THREE.CircleGeometry(radius, 16);
    }
    const mat = new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.45, depthWrite: false });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.rotation.x = -Math.PI / 2;
    mesh.position.y = 0.008;
    return mesh;
  }

  function createCelMaterialFrom(source, mesh) {
    if (!source) return source;
    if (source.isMeshToonMaterial && source.userData && source.userData.phase6Cel) return source;

    const mat = new THREE.MeshToonMaterial({
      color: source.color ? source.color.clone() : new THREE.Color(0xffffff),
      map: source.map || null,
      transparent: !!source.transparent,
      opacity: source.opacity == null ? 1 : source.opacity,
      alphaTest: source.alphaTest || 0,
      side: source.side == null ? THREE.FrontSide : source.side,
      depthWrite: source.depthWrite !== false,
      depthTest: source.depthTest !== false,
      vertexColors: !!source.vertexColors,
      fog: source.fog !== false
    });
    mat.name = source.name || '';
    if (source.emissive && mat.emissive) mat.emissive.copy(source.emissive);
    if ('emissiveIntensity' in source) mat.emissiveIntensity = source.emissiveIntensity || 0;
    if ('skinning' in mat) mat.skinning = !!(mesh && mesh.isSkinnedMesh);
    if ('morphTargets' in mat) mat.morphTargets = !!(mesh && mesh.morphTargetInfluences);
    if ('morphNormals' in mat) mat.morphNormals = !!source.morphNormals;
    mat.userData = Object.assign({}, source.userData || {}, {
      phase6Cel: true,
      sourceMaterialType: source.type || 'Material'
    });
    mat.needsUpdate = true;
    return mat;
  }

  function celifyObject(root) {
    const converted = new Map();
    const records = [];
    if (!root || !root.traverse) return records;

    function convert(source, mesh) {
      if (!source) return source;
      if (converted.has(source)) return converted.get(source);
      if (source.map) source.map.encoding = THREE.sRGBEncoding;
      const mat = createCelMaterialFrom(source, mesh);
      converted.set(source, mat);
      records.push({
        mat,
        name: mat.name || source.name || '',
        color: mat.color ? mat.color.clone() : new THREE.Color(0xffffff),
        emissive: mat.emissive ? mat.emissive.clone() : new THREE.Color(0x000000),
        emissiveIntensity: mat.emissiveIntensity || 0
      });
      return mat;
    }

    root.traverse(obj => {
      if (!obj || !obj.isMesh || !obj.material) return;
      obj.material = Array.isArray(obj.material)
        ? obj.material.map(source => convert(source, obj))
        : convert(obj.material, obj);
      obj.castShadow = true;
      obj.receiveShadow = true;
    });
    return records;
  }

  function createCinematicRimLight(color = 0xffffff, intensity = 0.18) {
    const light = new THREE.DirectionalLight(color, intensity);
    light.position.set(-4, 4.5, -5);
    light.userData.phase6CinematicRim = true;
    return light;
  }

  global.RenderEffects = {
    Materials,
    VFX,
    ParticleField,
    createWaterMaterial,
    createFresnelMaterial,
    createPsychicMaterial,
    createContactShadow,
    createGroundMark,
    createCelMaterialFrom,
    celifyObject,
    createCinematicRimLight
  };
})(window);
