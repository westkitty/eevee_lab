# Phase 1 — Creature Actor Core

Phase 1 adds world-space creature agency without changing the engine, save schema, model binaries, room lifecycle, camera architecture, audio engine, or arcade rules.

## Implemented

- One `CreatureActor` owns ordinary sandbox `x/z/yaw` movement for the active Eeveelution.
- The existing master animation loop remains the only frame-loop owner.
- Movement advances on a capped internal 60 Hz fixed step.
- Click/tap on empty room floor commands movement; drag remains camera orbit.
- Autonomous wandering uses bounded room floors and species-specific pacing.
- Reduced Motion disables autonomous wandering but preserves explicit movement.
- Head attention tracks explicit targets and the camera while idle.
- Procedural body bob/sway is the fallback walk presentation.
- `SemanticAnimationController` sits above `THREE.AnimationMixer`, but raw imported clips remain unmapped until visually classified.
- Petting and existing special actions suspend locomotion rather than fighting transform ownership.
- Room changes reset the actor to the room spawn and navigation bounds.

## Deliberate non-goals

No navmesh, obstacle avoidance, foot IK, multi-creature simulation, semantic clip guessing, model replacement, save migration, or Three.js upgrade is included in this phase.

## Validation contract

`tools/test_creature_actor.js` covers slot parity, room entry, manual movement, navigation clamping and suspension. The browser regression suite is extended separately to cover actor boot, movement and room synchronization.
