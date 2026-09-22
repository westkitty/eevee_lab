/* ==========================================================================
   PHASE 7 — LIVING WORLD, ATMOSPHERE AND SOUND
   One deterministic habitat clock drives micro-weather, room ambience, vistas,
   ambient life and a single reused Web Audio ambience bus.
   ========================================================================== */
(function (global) {
  'use strict';

  const THREE = global.THREE;

  const ROOM_WEATHER = Object.freeze({
    conservatory: ['clear', 'mist', 'rain'],
    eevee: ['clear', 'pollen', 'breeze'],
    vaporeon: ['mist', 'rain', 'drizzle'],
    jolteon: ['clear', 'static', 'storm'],
    flareon: ['clear', 'embers', 'heat-haze'],
    espeon: ['clear', 'aurora', 'mist'],
    umbreon: ['clear', 'moon-haze', 'fireflies'],
    leafeon: ['clear', 'pollen', 'rain'],
    glaceon: ['clear', 'snow', 'diamond-dust'],
    sylveon: ['clear', 'petals', 'lantern-breeze']
  });

  const LIFE_BY_ROOM = Object.freeze({
    conservatory: 'motes', eevee: 'motes', vaporeon: 'droplets',
    jolteon: 'sparks', flareon: 'embers', espeon: 'wisps',
    umbreon: 'fireflies', leafeon: 'butterflies',
    glaceon: 'crystals', sylveon: 'ribbons'
  });

  const PHASE_STYLE = Object.freeze({
    dawn:  { sky: 0xf3b996, fog: 0xd5a99c, hemi: 0.58, key: 0xffc79c, keyIntensity: 0.62 },
    day:   { sky: 0xaed9ef, fog: 0xc8dfdf, hemi: 0.72, key: 0xfff2cd, keyIntensity: 0.82 },
    dusk:  { sky: 0x8f739e, fog: 0x735f78, hemi: 0.42, key: 0xff9f6b, keyIntensity: 0.5 },
    night: { sky: 0x202b46, fog: 0x27314b, hemi: 0.22, key: 0x7f9bd8, keyIntensity: 0.28 }
  });

  function hashString(value) {
    let h = 2166136261 >>> 0;
    const s = String(value || '');
    for (let i = 0; i < s.length; i++) {
      h ^= s.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    return h >>> 0;
  }

  function phaseForHour(hour) {
    if (hour >= 5 && hour < 8) return 'dawn';
    if (hour >= 8 && hour < 17) return 'day';
    if (hour >= 17 && hour < 20) return 'dusk';
    return 'night';
  }

  class WorldClock {
    constructor(options) {
      options = options || {};
      this.dayLengthMs = Math.max(60000, Number(options.dayLengthMs) || 24 * 60 * 1000);
      this.now = options.now || (() => Date.now());
      this.offsetMs = Number(options.offsetMs) || 0;
    }

    sample(nowMs) {
      const now = (nowMs == null ? this.now() : nowMs) + this.offsetMs;
      const cycle = ((now % this.dayLengthMs) + this.dayLengthMs) % this.dayLengthMs;
      const fraction = cycle / this.dayLengthMs;
      const habitatHour = fraction * 24;
      const hour = Math.floor(habitatHour);
      const minute = Math.floor((habitatHour - hour) * 60);
      const dayIndex = Math.floor(now / this.dayLengthMs);
      return {
        fraction,
        habitatHour,
        hour,
        minute,
        dayIndex,
        phase: phaseForHour(habitatHour),
        label: String(hour).padStart(2, '0') + ':' + String(minute).padStart(2, '0')
      };
    }
  }

  function weatherFor(roomId, clockState) {
    const options = ROOM_WEATHER[roomId] || ROOM_WEATHER.conservatory;
    const segment = Math.floor(clockState.habitatHour / 4);
    const h = hashString(roomId + ':' + clockState.dayIndex + ':' + segment);
    return options[h % options.length];
  }

  function weatherModifier(weather) {
    if (weather === 'rain' || weather === 'storm' || weather === 'drizzle') return { fog: 0.038, light: 0.78, particles: 28 };
    if (weather === 'mist' || weather === 'moon-haze' || weather === 'heat-haze') return { fog: 0.026, light: 0.88, particles: 14 };
    if (weather === 'snow' || weather === 'diamond-dust') return { fog: 0.018, light: 0.92, particles: 24 };
    if (weather === 'static' || weather === 'embers' || weather === 'fireflies' || weather === 'aurora' || weather === 'petals' || weather === 'pollen' || weather === 'lantern-breeze' || weather === 'breeze') return { fog: 0.012, light: 0.96, particles: 18 };
    return { fog: 0.008, light: 1, particles: 8 };
  }

  class AudioDirector {
    constructor(options) {
      options = options || {};
      this.audio = options.audioEngine || null;
      this.save = options.save || null;
      this.master = null;
      this.tone = null;
      this.toneGain = null;
      this.noise = null;
      this.noiseGain = null;
      this.filter = null;
      this.lastKey = null;
      this.level = this.save ? Number(this.save.get('ui.ambienceLevel', 0.8)) : 0.8;
    }

    setLevel(value) {
      this.level = Math.max(0, Math.min(1, Number(value) || 0));
      if (this.master && this.audio && this.audio.ctx) {
        const t = this.audio.ctx.currentTime;
        this.master.gain.cancelScheduledValues(t);
        this.master.gain.setTargetAtTime(this.level * 0.22, t, 0.12);
      }
    }

    _ensure() {
      if (!this.audio || !this.audio.ctx || this.master) return !!this.master;
      const ctx = this.audio.ctx;
      this.master = ctx.createGain();
      this.master.gain.value = this.level * 0.22;
      this.master.connect(ctx.destination);

      this.tone = ctx.createOscillator();
      this.tone.type = 'sine';
      this.toneGain = ctx.createGain();
      this.toneGain.gain.value = 0.018;
      this.tone.connect(this.toneGain).connect(this.master);
      this.tone.start();

      const length = Math.max(1, Math.floor(ctx.sampleRate * 2));
      const buffer = ctx.createBuffer(1, length, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < length; i++) data[i] = Math.random() * 2 - 1;
      this.noise = ctx.createBufferSource();
      this.noise.buffer = buffer;
      this.noise.loop = true;
      this.filter = ctx.createBiquadFilter();
      this.filter.type = 'lowpass';
      this.noiseGain = ctx.createGain();
      this.noiseGain.gain.value = 0.012;
      this.noise.connect(this.filter).connect(this.noiseGain).connect(this.master);
      this.noise.start();
      return true;
    }

    apply(state) {
      if (!state || !this._ensure()) return false;
      const key = state.roomId + ':' + state.phase + ':' + state.weather;
      if (key === this.lastKey) return true;
      this.lastKey = key;
      const ctx = this.audio.ctx;
      const t = ctx.currentTime;
      const base = 70 + (hashString(state.roomId) % 70);
      const phaseScale = state.phase === 'night' ? 0.72 : state.phase === 'dawn' ? 0.88 : state.phase === 'dusk' ? 0.82 : 1;
      const weatherNoise = /rain|storm|drizzle|mist|haze|snow/.test(state.weather) ? 0.04 : 0.018;

      this.tone.frequency.cancelScheduledValues(t);
      this.tone.frequency.setTargetAtTime(base * phaseScale, t, 0.8);
      this.toneGain.gain.cancelScheduledValues(t);
      this.toneGain.gain.setTargetAtTime(state.phase === 'night' ? 0.012 : 0.02, t, 0.6);
      this.filter.frequency.cancelScheduledValues(t);
      this.filter.frequency.setTargetAtTime(/storm|static/.test(state.weather) ? 2200 : /rain|drizzle/.test(state.weather) ? 1100 : 650, t, 0.8);
      this.noiseGain.gain.cancelScheduledValues(t);
      this.noiseGain.gain.setTargetAtTime(weatherNoise, t, 0.8);
      this.setLevel(this.level);
      return true;
    }

    dispose() {
      try { if (this.tone) this.tone.stop(); } catch (_) {}
      try { if (this.noise) this.noise.stop(); } catch (_) {}
      [this.tone, this.toneGain, this.noise, this.noiseGain, this.filter, this.master].forEach(n => { try { if (n && n.disconnect) n.disconnect(); } catch (_) {} });
      this.master = this.tone = this.toneGain = this.noise = this.noiseGain = this.filter = null;
      this.lastKey = null;
    }
  }

  class LivingWorldDirector {
    constructor(options) {
      options = options || {};
      this.scene = options.scene || null;
      this.save = options.save || null;
      this.clock = options.clock || new WorldClock();
      this.audioDirector = options.audioDirector || null;
      this.onState = options.onState || function () {};
      this.reducedMotion = options.reducedMotion || (() => false);
      this.roomId = null;
      this.built = null;
      this.state = null;
      this.elapsedSinceState = Infinity;
      this.suspended = false;
    }

    enterRoom(roomId, built) {
      this.roomId = roomId;
      this.built = built;
      this._ensureLivingLayer();
      this.elapsedSinceState = Infinity;
      this.update(0, 0, true);
    }

    setSuspended(value) {
      this.suspended = !!value;
      if (this.suspended && this.scene) this.scene.fog = null;
      else if (!this.suspended && this.state) this._applyState(this.state);
    }

    _ensureLivingLayer() {
      if (!THREE || !this.built || this.built.phase7Living) return;
      const root = new THREE.Group();
      root.name = 'phase7_living_world';

      const vistaMat = new THREE.MeshBasicMaterial({ color: 0x9ac8e2, side: THREE.DoubleSide, transparent: true, opacity: 0.82, depthWrite: false });
      const vista = new THREE.Mesh(new THREE.PlaneGeometry(8, 4.6), vistaMat);
      vista.position.set(0, 2.4, -5.2);
      root.add(vista);

      const lifeMat = new THREE.MeshBasicMaterial({ color: 0xffefaa, transparent: true, opacity: 0.72 });
      const lifeGeo = new THREE.SphereGeometry(0.045, 6, 6);
      const life = new THREE.Group();
      for (let i = 0; i < 12; i++) {
        const m = new THREE.Mesh(lifeGeo, lifeMat);
        const a = i * 2.399963;
        const r = 0.8 + (i % 4) * 0.55;
        m.position.set(Math.cos(a) * r, 0.65 + (i % 5) * 0.32, Math.sin(a) * r);
        m.userData.seed = i * 0.77;
        life.add(m);
      }
      root.add(life);

      const weatherMat = new THREE.MeshBasicMaterial({ color: 0xbfe8ff, transparent: true, opacity: 0.46 });
      const weatherGeo = new THREE.SphereGeometry(0.025, 5, 5);
      const weather = new THREE.Group();
      for (let i = 0; i < 30; i++) {
        const p = new THREE.Mesh(weatherGeo, weatherMat);
        p.position.set(((i * 37) % 100) / 14 - 3.5, 0.4 + ((i * 53) % 100) / 20, ((i * 71) % 100) / 16 - 3.1);
        p.userData.seed = i * 1.13;
        weather.add(p);
      }
      root.add(weather);
      this.built.group.add(root);
      this.built.phase7Living = { root, vista, life, weather, materials: [vistaMat, lifeMat, weatherMat], geometries: [lifeGeo, weatherGeo] };

      const priorDispose = this.built.disposeExtra ? this.built.disposeExtra.bind(this.built) : null;
      this.built.disposeExtra = () => {
        this.built.phase7Living.materials.forEach(m => m.dispose());
        this.built.phase7Living.geometries.forEach(g => g.dispose());
        if (vista.geometry) vista.geometry.dispose();
        if (priorDispose) priorDispose();
      };
    }

    _sampleState() {
      const clock = this.clock.sample();
      const weather = weatherFor(this.roomId || 'conservatory', clock);
      return Object.assign({}, clock, {
        roomId: this.roomId || 'conservatory',
        weather,
        life: LIFE_BY_ROOM[this.roomId] || 'motes'
      });
    }

    _applyState(state) {
      if (!this.built || this.suspended) return;
      const style = PHASE_STYLE[state.phase] || PHASE_STYLE.day;
      const mod = weatherModifier(state.weather);
      const living = this.built.phase7Living;

      if (living) {
        living.vista.material.color.setHex(style.sky);
        living.vista.material.opacity = state.phase === 'night' ? 0.64 : 0.84;
        living.life.material = living.life.material || undefined;
        const lifeColor = state.phase === 'night' ? 0xb9e8ff : 0xffe7a2;
        living.life.children.forEach(m => { m.material.color.setHex(lifeColor); });
        const visibleCount = this.reducedMotion() ? 4 : 8 + (hashString(state.life) % 5);
        living.life.children.forEach((m, i) => { m.visible = i < visibleCount; });
        const particleCount = this.reducedMotion() ? Math.min(6, mod.particles) : mod.particles;
        living.weather.children.forEach((m, i) => { m.visible = i < particleCount && state.weather !== 'clear'; });
        const weatherColor = /snow|diamond/.test(state.weather) ? 0xe9fbff :
          /embers|heat/.test(state.weather) ? 0xff8a45 :
          /pollen|petals|lantern/.test(state.weather) ? 0xffd98c :
          /static|storm/.test(state.weather) ? 0xd9e6ff : 0xbfe8ff;
        living.weather.children.forEach(m => m.material.color.setHex(weatherColor));
      }

      const lights = this.built.lights || [];
      if (lights[0]) lights[0].intensity = style.hemi * mod.light;
      if (lights[1]) {
        lights[1].color.setHex(style.key);
        lights[1].intensity = style.keyIntensity * mod.light;
      }
      if (this.scene && THREE.FogExp2) this.scene.fog = new THREE.FogExp2(style.fog, mod.fog);
      if (this.audioDirector) this.audioDirector.apply(state);
      this.onState(state);
    }

    update(dt, elapsed, force) {
      if (!this.roomId || !this.built) return;
      this.elapsedSinceState += Math.max(0, Number(dt) || 0);
      if (force || this.elapsedSinceState >= 1) {
        this.elapsedSinceState = 0;
        const next = this._sampleState();
        const key = next.phase + ':' + next.weather + ':' + next.label.slice(0, 4);
        const priorKey = this.state ? this.state.phase + ':' + this.state.weather + ':' + this.state.label.slice(0, 4) : null;
        this.state = next;
        if (key !== priorKey || force) this._applyState(next);
      }

      const living = this.built.phase7Living;
      if (!living || this.suspended || this.reducedMotion()) return;
      living.life.children.forEach((m, i) => {
        const s = m.userData.seed || i;
        m.position.y += Math.sin(elapsed * 0.9 + s) * dt * 0.035;
        m.rotation.y += dt * 0.7;
      });
      const rainLike = this.state && /rain|storm|drizzle|snow|diamond/.test(this.state.weather);
      living.weather.children.forEach((m, i) => {
        const speed = /rain|storm|drizzle/.test(this.state ? this.state.weather : '') ? 2.4 : 0.35;
        m.position.y -= dt * speed;
        m.position.x += Math.sin(elapsed * 0.7 + i) * dt * 0.08;
        if (m.position.y < 0.2) m.position.y = rainLike ? 4.7 : 3.4;
      });
    }

    getDebugState() {
      return this.state ? Object.assign({}, this.state, { suspended: this.suspended }) : null;
    }
  }

  global.EeveeLivingWorld = {
    ROOM_WEATHER,
    LIFE_BY_ROOM,
    PHASE_STYLE,
    hashString,
    phaseForHour,
    weatherFor,
    weatherModifier,
    WorldClock,
    AudioDirector,
    LivingWorldDirector
  };
})(window);
