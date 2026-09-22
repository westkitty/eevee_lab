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


## Runtime wiring implemented

- Vaporeon's already-loaded wrapper is temporarily reparented beneath `vaporeon-companion_root` only when Eevee is active in the Conservatory.
- Activation stores the wrapper's original parent, local transform and visibility; restoration occurs before form switching or arcade entry.
- `CreatureManager.update()` is the single normal multi-actor update seam. The Phase-3 scheduler still governs primary relationship state, while each `CreatureActor` exclusively owns its own pose and movement.
- Vaporeon receives its own CreatureActor with the same room walkable bounds and independently navigates the active Conservatory.
- Social coordination now requests greeting, approach, follow, shared inspection, parallel wandering, play, avoidance, nearby sitting, synchronized rest and toy competition.
- Clicking Vaporeon selects/focuses the companion. Petting, brushing and feeding intentionally remain primary-targeted in this proving slice.
- Leaving the Conservatory, switching away from Eevee or entering Stone Dash restores the original single-form rig. Returning to Eevee + Conservatory reuses the already-loaded Vaporeon without another GLB request.
- Reduced Motion suppresses optional autonomous social motion; overlap separation remains a safety behavior.

## Evidence state

The focused manager contract passes for roster ownership, separation, first greeting, toy competition and nap scheduling. The focused test also covers companion reparent/restore lifecycle. The broad Playwright assertions are committed but cannot be executed in the current environment, so visible browser behavior remains implemented-but-unverified.
