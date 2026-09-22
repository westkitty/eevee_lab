# Phase 5 — Habitat Becomes a Place

Phase 5 converts the Habitat House from a set of selectable procedural rooms into a persistent spatial system while preserving the one-heavy-room lifecycle.

## Delivered capabilities

### Physical room travel

- Diegetic doors now request travel instead of calling `goTo()` directly.
- The primary CreatureActor walks to a safe interior threshold point.
- At the threshold, the portal surface briefly becomes opaque enough to cover the room swap.
- RoomManager disposes the old heavy room before building the destination.
- The actor appears at the destination's matching entry point and continues inward to a second point.
- The drawer room grid and `eeveeApp.goToRoom()` remain an instant-navigation accessibility/debug fallback.
- Door travel suppresses sleep/rare/social interruptions without suspending actor locomotion.
- Form changes and Stone Dash entry cancel an in-progress doorway transition.

### Portal previews

- Door surfaces use small cached 128×160 CanvasTexture previews instead of flat colored planes.
- Preview textures are generated once per destination/color and reused.
- Return doors explicitly preview the Conservatory.
- No destination habitat is kept loaded behind the portal.

### Explicit room topology

Every habitat now supplies semantic topology consumed by runtime systems:

- interest points
- sleep spots
- social spots
- prop sockets
- portal anchors
- doorway entry points
- continuation points

CreatureActor now mixes these interest points into autonomous exploration instead of sampling only anonymous positions inside a circle.

### Persistent narrative room states

`HabitatWorldState` owns bounded semantic room history. Each room has four named stages driven by visits, room interactions and memento discoveries.

Examples:

- Jolteon: Relay Dead → Partially Charged → Relay Restored → Controlled Overload
- Leafeon: Contained Growth → New Growth → Glasshouse Reclaimed → Self-Tending Garden
- Conservatory: Quiet Archive → House Taking Shape → Shared Habitat → Living Archive

All nine species habitats now make progression visible through room-specific changes, with a four-pip diegetic meter as the shared language.

### Physical placement

- Every habitat receives a draggable persistent furnishing.
- Eevee's ball/plush and Vaporeon's ball also have stable placement identities.
- Furniture is drag/drop placement, never projectile physics.
- Slowly placed toys can be remembered; thrown toys retain the existing chase/retrieve behavior.
- Retrieved placeable toys save their final resting location.
- Persistence stores only `objectId + roomId + {x,y,z,ry}`, never Three.js objects or scene graphs.

### Conservatory history

The Conservatory now reflects the actual save:

- each habitat's suspended evolution stone activates once that habitat has been visited;
- the central archive ring intensifies with memento/advanced-room history;
- Conservatory itself advances through four historical states;
- its study cushion is a persistent placeable object.

### Cross-room provenance

Anonymous threshold traces are replaced with bounded provenance-rich records:

- `id`
- `originRoom`
- `originEvent`
- `objectType`
- `destinationRoom`

A source-room event deterministically seeds a small trace in another habitat. At most four traces are retained per destination. Rendered trace objects carry their provenance in `userData.traceProvenance`.

Legacy string trace arrays migrate safely to explicit `legacy` provenance rather than being discarded.

## Persistence migration

Save schema advances from v1 to v2.

New semantic roots:

- `roomNarrative`
- `placedObjects`
- provenance-object `crossContamination`

The migration preserves existing form, shiny state, high score, UI settings, camera settings, discoveries, bond/resonance, atmosphere, roomMemory and album data. Nested defaults are merged without allowing a partial legacy object to erase newer default keys.

## Ownership and preservation

- RoomManager remains the sole heavy-room lifecycle owner.
- Exactly one heavy habitat group is active at a time.
- CreatureActor remains movement/pose authority.
- HabitatWorldState owns semantic persistent room history.
- DirectInteractionSystem owns drag/drop state.
- No GLB loading path was added or duplicated.
- No new runtime dependency, renderer migration or framework was introduced.
- Camera, procedural audio, photo mode and Stone Dash implementation files are unchanged.

## Validation

Passed focused contracts in the available container:

1. `tools/test_habitat_state.js`
   - v1→v2 migration
   - nested-default preservation
   - narrative progression
   - bounded placement transforms
   - provenance traces
   - Conservatory history summary

2. `tools/test_room_manager_phase5.js`
   - one-heavy-room transition
   - physical-door request handoff
   - destination entry/continuation coordinates
   - placement restoration
   - narrative state application
   - placement recapture

Additional assertions are committed in:

- `tools/test_interaction_system.js` for persistent furnishing drop semantics.
- `tools/verify_all_gameplay.js` for actual browser portal previews, physical door travel, narrative progression, placement persistence, provenance rendering and Conservatory history.

## Evidence limitation

The broad Playwright/browser path cannot be executed in the current working environment because a browser-capable repository checkout is unavailable. Phase 5 is therefore focused-test and source verified, with its visible browser journey still implemented-but-unverified.
