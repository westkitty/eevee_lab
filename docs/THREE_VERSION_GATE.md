# Three.js Version Gate — Phase 0

## Decision

**HOLD the production runtime on vendored Three.js r128 for Phase 1.**

This is a deliberate freeze, not a claim that r128 is the permanent endpoint.

## Current verified repository facts

- `libs/three.min.js` reports `THREE.REVISION === "128"`.
- The application uses global scripts, `THREE.GLTFLoader`, and `THREE.OrbitControls`; there is no bundler or framework.
- Phase 1 needs per-creature animation playback, skeletal transforms, raycasting, camera controls, and lightweight grounding.
- `AnimationMixer` is already present in the r128 engine family and is sufficient as playback infrastructure for independently animated creature roots.
- The runtime GLBs already expose usable skeletons; most primary-pack species also contain embedded clips.

## Why not migrate now

A modern Three migration would be a separate architectural change:
- the legacy `three.js` / `three.min.js` build path was deprecated after r149 and removed after r160;
- modern addon usage implies ES-module/addon conversion;
- the official migration guide recommends upgrading old projects in increments of about ten revisions so deprecations can be handled progressively.

None of that is required to begin CreatureActor, AnimationController, locomotion, attention, or the Phase-1 Eevee vertical slice.

Combining engine migration with creature behavior would make regressions ambiguous and greatly enlarge the rollback surface.

## Trigger for a migration experiment

Open a separate migration-only branch only when at least one of these becomes true:

1. A required feature is unavailable or impractical on r128.
2. Browser compatibility/security makes the old runtime untenable.
3. A modern addon is proven to remove more complexity than the migration adds.
4. Maintenance cost from the pinned runtime becomes material.

## Required migration experiment

When triggered:

1. Freeze a known-green baseline.
2. Create a migration-only branch.
3. Upgrade Three in increments of no more than roughly ten revisions.
4. Keep application behavior unchanged during the experiment.
5. Convert global example scripts/loaders/controls only when the target revision requires it.
6. Run the full Eevee Lab regression suite after every meaningful jump.
7. Compare screenshots and runtime state for all nine models, habitats, camera, photo mode, persistence, accessibility, and Stone Dash.
8. Stop and roll back if parity cannot be established without unrelated rewrites.
9. Only after parity is proven may a later project phase adopt the migrated runtime.

## Rollback

The production reference remains the checked-in r128 libraries until a separately accepted migration passes parity. Reverting the migration branch must restore the exact vendored library files and leave feature branches independent.

## Sources

- Three.js AnimationMixer docs: https://threejs.org/docs/#api/en/animation/AnimationMixer
- Three.js Migration Guide: https://github.com/mrdoob/three.js/wiki/Migration-Guide
