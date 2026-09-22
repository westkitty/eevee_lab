# Phase 2 — Physical Interaction Layer

This phase turns interaction from button-triggered reactions into world-space gestures while preserving the existing interaction wheel as a fallback.

## Core substrate

- `StrokeTracker` measures continuous strokes by duration, distance, speed and dominant tactile region.
- `classifyTactileRegion` recognizes ears, tail, special anatomy, cheek, neck, head, back and flank using mesh/bone names first and bounded geometry second.
- Species tactile preference weights are data, not hard-coded branches in pointer handlers.
- `DirectInteractionSystem` owns room-prop drag/release physics and a visible brush tool.
- Haptics are optional progressive enhancement and are suppressed with Reduced Motion.
- Direct props remain lightweight Three.js objects; no physics dependency is added.

## Preserved boundaries

- The interaction wheel remains available.
- The existing CreatureActor remains movement authority.
- The master animation loop remains the only frame loop.
- No save-schema change is introduced.
- No model binaries or vendored libraries are changed.
- Imported animation clips remain unclassified.

## Runtime integration target

The runtime wiring will:
1. register room toys as manipulable objects,
2. promote petting to continuous stroke semantics,
3. make brushing a visible drag tool,
4. allow direct toy pickup/throw with creature attention/chase,
5. allow food to exist as a placed/manipulable world object while retaining the old direct-feed API,
6. add long-press context access without removing keyboard/menu alternatives,
7. keep root grounding conservative rather than inventing unsupported IK.


## Runtime wiring implemented

- Existing Eevee/Vaporeon toy meshes are registered as direct-manipulation props.
- Pointer drag moves toys over the active walkable floor; release velocity produces bounded lightweight throw/roll physics.
- Ball/plush releases trigger creature chase, pickup and a simple return-to-throw-origin retrieve loop.
- The Brush action now toggles a visible world-space brush; brushing is measured as a stroke rather than a one-shot button reaction.
- Petting now records continuous stroke speed, length and dominant tactile region.
- Long-press on the creature opens the existing interaction wheel as contextual fallback.
- Feed buttons now place physical draggable food; the old `feedTreat()` ballistic API remains intact for regression/accessibility paths.
- Optional device vibration gives tiny pickup/stroke/release cues and is disabled by Reduced Motion.
- Creature root height is explicitly projected to the room's declared ground Y. Full foot IK remains prohibited until per-rig limb evidence is strong enough.

## Evidence state

Source ownership and regression assertions are present. Clean checkout/browser execution is unavailable in the current environment because outbound GitHub DNS resolution is blocked; runtime behavior therefore remains implemented-but-unverified until the committed Node and Playwright checks run in a browser-capable checkout.
