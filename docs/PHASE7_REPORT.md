# Phase 7 — Living World, Atmosphere and Sound

Phase 7 makes the Habitat House feel temporally alive without adding remote services, downloaded media, a second render loop, or a second audio engine.

## Delivered capabilities

### Habitat clock

- A deterministic accelerated `WorldClock` exposes habitat hour, minute, day index and four day phases: dawn, day, dusk and night.
- The clock is session-derived rather than persisted as authoritative wall time, so saves do not become dependent on device clock history.
- The HUD breadcrumb surfaces habitat time and current micro-weather without adding a dashboard.

### Room-specific micro-weather

- Each habitat has a bounded weather vocabulary appropriate to its identity.
- Weather changes deterministically in four-hour habitat segments using room ID + habitat day + segment.
- Weather modifies fog density, light attenuation and the visible weather-particle budget.
- Reduced Motion keeps state changes but sharply reduces moving ambient particles.

### Vistas and ambient life

- Each heavy room receives one lightweight living-world layer owned by that room.
- The layer contains a time-tinted vista plane plus room-specific ambient-life and weather populations.
- Ambient life and weather are batched as two `THREE.Points` draws rather than dozens of individual meshes.
- The room captures and disposes its own Phase-7 materials/geometries through the existing heavy-room lifecycle.

### AudioDirector

- Phase 7 reuses the existing `RetroAudioEngine` Web Audio context; it does not create another `AudioContext`.
- One continuous oscillator and one looped procedural-noise source are routed through a bounded ambience gain bus.
- Room/time/weather state changes retune and crossfade the existing graph rather than rebuilding it.
- The existing Ambience Level setting now controls the ambience bus.
- Audio remains gesture-gated by the existing audio enable/music path.
- Stone Dash suspends the ambience bus and habitat fog; returning to sandbox resumes them.

### Atmosphere ownership

- Existing unlocked atmosphere variants remain user-controlled.
- Selecting a non-default atmosphere protects its lighting values from automatic day/night lighting while Phase 7 still owns vista, fog, weather, ambient life and sound.
- Returning to the default atmosphere returns lighting control to the living-world clock.

## Architecture

Phase 7 adds one runtime module:

- `src/phase7-living-world.js`
  - `WorldClock`
  - `AudioDirector`
  - `LivingWorldDirector`
  - deterministic room weather/life tables

`RoomManager` remains the heavy-room lifecycle owner. It calls `LivingWorldDirector.enterRoom/update/leaveRoom`; the director never creates another animation loop.

## Preservation

Phase 7 does not:

- change any Pokémon model binary;
- change Three.js r128 or add a dependency;
- change save schema v3;
- create another GLB load path;
- replace Phase-6 cel/shiny material ownership;
- serialize scene objects;
- replace the existing music/SFX engine;
- change Stone Dash gameplay rules;
- remove manual atmosphere selection.

## Validation

Focused executable validation on an authorized disposable Mac checkout:

- `node --check src/phase7-living-world.js` — PASS
- `node --check src/room-manager.js` — PASS
- `node tools/test_phase7_living_world.js` — PASS
- `node tools/test_phase6_system.js` — PASS
- `node tools/test_habitat_state.js` — PASS
- `node tools/test_room_manager_phase5.js` — PASS
- `node tools/test_creature_manager.js` — PASS
- `node tools/test_creature_behavior.js` — PASS
- `node tools/test_interaction_system.js` — PASS
- `node tools/test_creature_actor.js` — PASS

The broad Playwright harness can now fall back to an installed Chrome/Brave/Chromium when the exact Playwright browser cache is absent. A current browser attempt reached the application but did not complete the protected journey: `actor-boot` reported the actor unavailable and the suite later crashed when the Phase-1 movement assertion dereferenced that missing state. This is not promoted to a Phase-7 runtime pass. The browser path remains a blocking unknown/repair item before later phases rely on full end-to-end proof.

## Phase-7 evidence state

- Source scope: verified.
- Focused living-world contract: verified.
- Prior pure-system regressions: verified on the same disposable checkout.
- Full browser journey: failed/unresolved.
- Live GitHub Pages delivery: unverified.
