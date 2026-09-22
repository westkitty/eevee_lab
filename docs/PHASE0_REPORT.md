# Phase 0 — Baseline and Rig Capability Report

Baseline under protection: `661a37bc7f86e5ff2b7da28d02e8c44ad696e007`.

## Completed

- Initialized `OPERATIONAL_STATE.md` before Phase-0 implementation.
- Preserved runtime code, model binaries, dependency set, rooms, saves, camera, UI, audio, sandbox interactions, Chill Mode, and Stone Dash.
- Added deterministic GLB JSON-chunk inspection tooling with no Blender or Three.js dependency.
- Inspected eight runtime GLBs directly from their checked-in binary JSON chunks.
- Established the twelve-slot semantic animation contract without guessing opaque action meanings.
- Froze the production Three.js decision at r128 behind `docs/THREE_VERSION_GATE.md`.
- Added a schema validator for the rig manifest and animation contract.
- Kept the existing broad Playwright suite as the behavioral regression authority.

## Capability findings

- Eevee, Jolteon, Flareon, Espeon, Leafeon, Glaceon, and Sylveon each expose seven opaque full-skeleton Blender action clips in the checked-in GLBs.
- Vaporeon is separately sourced and exposes no embedded animation clips.
- The eight directly decoded GLBs expose no morph targets.
- The directly decoded materials rely on base-color textures; no normal, metallic/roughness, occlusion, or emissive texture maps were found.
- All directly decoded rigs have explicit head/neck, tail, forelimb and hindlimb chains suitable for Phase-1 semantic actor work; species-specific feeler/hair/ribbon chains are recorded in the manifest.
- Clip names are not semantic. No clip has been labeled idle/walk/sleep/etc. without visual evidence.

## Umbreon evidence limitation

`assets/models/umbreon.glb` is 2,192,044 bytes. The current GitHub contents connector does not return inline base64 for binary files above its contents limit, so this session could not decode Umbreon's JSON chunk directly.

Repository evidence still establishes:
- the active file and blob SHA;
- its source armature (`GLTF_created_0`) from `tools/export_all_species.py`;
- its normalized runtime height/orientation from the asset provenance table;
- runtime head/tail/ear/spine discovery and special ring-material handling from `index.html`.

The committed `tools/inspect_glb_manifest.py` has no such connector limitation and will fully replace this partial Umbreon entry whenever run in a normal checkout.

**Therefore the Phase-0 implementation is complete, but the evidence gate for “every raw Umbreon bone/clip name directly decoded in this session” remains explicitly unverified rather than invented.**

## Runtime validation state

This environment cannot clone the repository from GitHub or launch its existing Playwright suite against the checked-in binary assets because outbound repository transport is unavailable. The Phase-0 changes themselves do not touch runtime files.

The existing `tools/verify_all_gameplay.js` remains the required broad runtime gate. Until it is rerun in a normal checkout, baseline runtime parity is recorded as **unverified in this execution environment**, not assumed.

## Phase-1 handoff

Phase 1 may proceed against:
- the semantic animation slots in `assets/models/animation-contract.json`;
- rig/bone capability data in `assets/models/rig-manifest.json`;
- the r128 HOLD decision;
- the invariants in `OPERATIONAL_STATE.md`.

Do not assign semantic meanings to the seven opaque primary-pack clips until a visual classification pass proves them.
