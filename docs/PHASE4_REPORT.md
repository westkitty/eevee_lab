# Phase 4 — Multi-Creature Habitat

Phase 4 introduces a real CreatureManager and a deliberately narrow first proving slice: Eevee + Vaporeon coexist in the Conservatory.

## Architecture

- `CreatureManager` owns the active-creature roster, selected creature ID, companion lifecycle, multi-actor updates, occupancy/separation, social opportunities and toy-interest competition.
- `CreatureActor` remains the only owner of each creature's transform and pose. A new `placeAt()` method gives managers a safe spawn primitive without direct transform mutation.
- No GLB is cloned or reloaded. The already-loaded Vaporeon wrapper can be temporarily moved beneath a dedicated companion root, then restored to the original nine-form rig with its exact local transform.
- The vertical slice is intentionally bounded to Eevee as primary + Vaporeon as companion in the Conservatory. Form switches and other rooms return to the original single-creature path.
- The manager does not create a second render loop, second input system, physics dependency, or save schema.

## Social behaviors in the manager

- greet
- approach
- follow
- inspect a shared point
- parallel wander
- play
- avoid / make space
- sit nearby
- nap together when the primary creature sleeps
- toy-interest race / contest
- separation steering when two roots overlap

## Reduced-motion and authority rules

Autonomous social movement is suppressed under Reduced Motion or while the player is actively manipulating the primary creature. Separation remains a safety behavior. Existing Phase-3 relationship memory remains primary-creature scoped in this vertical slice; no companion history is fabricated before the multi-creature model is proven.

## Validation target

Focused manager tests cover roster ownership, separation, first greeting, toy competition and nap-together scheduling. The broad browser suite will verify the Conservatory pair, room/form restoration, actor-count stability and the unchanged single-form path.
