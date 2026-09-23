# Phase 7.5 — Browser Runtime Recovery Gate

Phase 7.5 restored a trustworthy current-browser verification path before Phase 8.

## Root cause

A clean checkout of current `main` reproduced an earlier startup failure in every GLB load callback:

- `ReferenceError: FX is not defined`
- `window.CreatureActorSystem` existed.
- `window.eeveeApp` existed.
- `window.eeveeApp.creatureActor` existed and reported valid room/navigation state.
- All nine model wrappers remained `isLoaded=false` because the callback threw before load completion.

The runtime used `FX.celifyObject(raw)` without first binding `FX` to `window.RenderEffects`. The bounded repair adds that binding and fails explicitly if RenderEffects itself is absent.

The earlier `actor unavailable` observation was therefore not the earliest meaningful failure in a clean current checkout.

## Browser harness repairs

Once model loading was restored, the broad regression exposed several stale or timing-sensitive assertions. The harness was corrected without weakening protected behavior:

- actor boot data is read entirely inside browser context;
- Eevee + Vaporeon visibility in the Conservatory matches the Phase-4 companion contract;
- post-form-switch movement and door checks synchronize on actor readiness instead of fixed sleeps;
- the Phase-5 persistence assertion now expects the current save-v3 schema;
- room-lighting distinction accounts for Phase-7 dynamic attenuation while still requiring distinct room color and intensity;
- feeding waits for its physical treat lifecycle to finish before later face-state assertions;
- the social greeting fixture clears prior behavior state before testing the first idle greeting.

## Executable validation

On the authorized Apple-silicon Mac, from a disposable checkout at current `main` plus the repair candidate:

- `tools/test_phase7_living_world.js` — PASS
- `tools/test_phase6_system.js` — PASS
- `tools/test_habitat_state.js` — PASS
- `tools/test_room_manager_phase5.js` — PASS
- `tools/test_creature_manager.js` — PASS
- `tools/test_creature_behavior.js` — PASS
- `tools/test_interaction_system.js` — PASS
- `tools/test_creature_actor.js` — PASS

The full browser journey completed:

- **86 passed, 0 failed**
- **0 browser console/page errors**
- all nine GLBs loaded
- actor boot and manual movement passed
- Phase-2 direct manipulation passed
- Phase-3 memory/sleep/bond behavior passed
- Eevee + Vaporeon multi-creature behavior passed
- Phase-5 doors, placements, narrative state and provenance passed
- Phase-6 cel rendering contracts, physical evolution, shiny mapping and persistent abilities passed
- room repeated-visit leak check passed
- photo capture, persistence, reduced motion, desktop/mobile center-clear UI and Stone Dash passed

Source invariants after the repair still show one `animate()` owner and one `gltfLoader.load()` call site. The other `requestAnimationFrame` occurrence is a one-shot evolution-flash fade callback, not another render/simulation loop. One AudioContext construction path remains.

## Manual rendered inspection

Representative controlled browser captures were inspected after load on desktop and mobile-sized viewports.

No Phase-7.5 visual blocker was found:

- native Vaporeon remained readable under room lighting;
- cel treatment remained visually intact;
- vista/background composition remained coherent;
- weather and ambient particles were visible without obscuring the creature;
- Jolteon ability VFX remained readable;
- the interaction wheel fully opened after its intended transition;
- the two-step evolution approach/ready state rendered without a blocking artifact;
- mobile controls remained usable and center-clear.

The Conservatory can frame a doorway prominently at some camera positions, but controls and interaction remain available; this is not treated as a Phase-7.5 blocker.

## Preservation

The repair does not add a dependency, renderer, frame loop, GLB load path, audio architecture or save migration. It does not alter model binaries or the one-heavy-room lifecycle.

Live GitHub Pages delivery is still a separate delivery verification item until the repaired commit is deployed and checked.
