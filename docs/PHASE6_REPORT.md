# Phase 6 — Transformation, Elemental Powers and Visual Unification

Phase 6 turns form switching, elemental identity and model rendering into explicit reusable systems while preserving the Phase-5 habitat lifecycle and save semantics.

## Delivered capabilities

### Physical evolution

- Eevee's evolution stones are now diegetic evolution affordances in Eevee's Den and the Conservatory.
- First activation is an offer: Eevee notices the stone and walks to a safe inspection point using CreatureActor locomotion.
- Second activation commits the transformation.
- The charge/reveal sequence temporarily suppresses autonomous/social behavior, focuses the camera, emits particles/flash, swaps the already-loaded model, then restores normal actor ownership.
- Reduced Motion uses shortened charge/reveal timing.
- The existing species strip remains an instant form-switch accessibility/debug path.
- Physical evolution only begins from Eevee and never adds a second GLB load path.

### Species environmental abilities

A reusable `AbilitySystem` defines one environmental contract for each evolved species:

- Vaporeon — Shape Water
- Jolteon — Charge Relay
- Flareon — Kindle Heat
- Espeon — Shift Matter
- Umbreon — Cast Moon Veil
- Leafeon — Accelerate Growth
- Glaceon — Crystal Freeze
- Sylveon — Ribbon Bind

Each species can affect only a compatible semantic target. Stale/off-room targets are rejected.

Every species habitat exposes one matching target through the shared room decorator. Successful ability use produces a room-specific visible mutation, a lightweight burst, and a persistent semantic record.

### Persistent ability state

Save schema advances from v2 to v3.

New semantic root:

- `abilityMutations.<roomId>.<targetId>`

Each record stores only:

- roomId
- targetId
- species
- abilityId
- targetType
- mutation

No Three.js object, material, scene node or transient VFX state is persisted.

RoomManager reapplies saved ability mutations after rebuilding a room.

### Explicit shiny profiles

The former broad one-color-per-species tint has been removed.

`EeveePhase6System.SHINY_PROFILES` maps known checked-in material names from the rig manifest to explicit shiny colors. Unknown materials are restored/preserved instead of guessed.

Umbreon remains pattern-based because its complete deep material inventory is still connector-partial; only known body/ring patterns are modified.

### Unified cel treatment

Imported GLB materials are converted once at load time to `MeshToonMaterial` while preserving:

- base color
- base-color texture
- alpha/transparency
- emissive color/intensity
- side/depth flags
- vertex colors
- skinned-mesh and morph compatibility flags where supported
- original material names for shiny mapping

No renderer migration or post-processing dependency was added.

### Cinematic habitat lighting

The Conservatory and each species habitat now receive a lightweight directional rim light keyed to room identity.

This is deliberately additive to the existing data-driven lighting profiles rather than a replacement renderer.

### Ability rendering ownership

RoomKit materials are cached/shared. Ability targets therefore clone their own room-local materials before any emissive mutation.

Those clones are disposed by the existing RoomManager lifecycle when the habitat unloads, preventing power effects from bleeding into unrelated cached props.

## Preservation

Phase 6 keeps:

- one master render loop
- one GLB load site
- one heavy habitat at a time
- CreatureActor as movement/pose authority
- CreatureManager as multi-creature roster/social authority
- RoomManager as heavy-room lifecycle authority
- HabitatWorldState as semantic persistent world authority
- the existing species strip
- direct interaction and interaction-wheel fallback
- photo mode
- procedural audio
- Stone Dash
- reduced-motion behavior
- Three.js r128 / global-script / no-bundler architecture

No model binary or vendored library changed.

## Validation

### Passed

Executed against the current GitHub `main` source fetched into an isolated temporary directory on the authorized Mac:

1. `tools/test_phase6_system.js`
   - explicit shiny material matching/restoration
   - unknown-material preservation
   - species/target ability compatibility
   - stale-room target rejection
   - semantic ability persistence handoff
   - two-step evolution offer/commit state machine
   - actor-owned approach and reduced-motion charge/reveal

2. `tools/test_habitat_state.js`
   - v1/v2 → v3 migration
   - existing nested-default preservation
   - Phase-5 narrative/placement/provenance behavior
   - semantic ability mutation storage/listing

3. `node --check` passed for:
   - `src/phase6-system.js`
   - `src/render-effects.js`
   - `src/rooms.js`
   - `src/room-manager.js`
   - `src/persistence.js`
   - `src/habitat-state.js`

### Source invariants

Repository inspection confirms:

- one `animate()`
- one `gltfLoader.load()`
- one `EvolutionController` construction and update seam
- one `AbilitySystem` construction
- one cel-conversion call at model load
- no legacy uniform shiny-color markers in `index.html`
- no scene serialization in habitat state
- ability-owned material clones have explicit disposal

### Browser acceptance path committed

`tools/verify_all_gameplay.js` now asserts:

- save v3
- GLB cel materials
- cinematic rim lighting
- evolution offer → approach → commit → completed form
- targeted shiny material changes
- ability use
- persistent ability restoration after room rebuild
- protected legacy gameplay afterward

## Evidence limitation

The local Eevee Lab checkout on the authorized Mac is still at protected baseline `661a37b`, not current GitHub main, so it was not used as a browser-test target. The broad Playwright journey remains committed but unexecuted rather than being run against a stale checkout.

Phase 6 is therefore focused-test, syntax and source-contract verified; visible browser behavior remains implemented-but-unverified.
