# Operational State: Eevee Lab

<!-- operational-state:metadata
{
  "schema_version": 1,
  "project_id": "eevee-lab",
  "project_name": "Eevee Lab",
  "project_root": "/",
  "artifact_path": "index.html",
  "state_revision": 10,
  "last_updated": "2026-09-22",
  "current_baseline": {
    "identity": "30715710146880400bc1dda3a479f2b7aa1e2643",
    "state": "phase7-implemented",
    "last_verified": "phase6-focused-evolution-ability-persistence-syntax-and-source-scope"
  },
  "scope_boundaries": [
    "The vanilla Three.js Habitat House browser project in westkitty/eevee_lab."
  ],
  "linked_parent_state": null
}
-->

## 1. Project Identity and Scope

- **Project ID:** `eevee-lab`
- **Purpose:** A creature-first, quiet, explorable 3D Habitat House for Eevee and the eight Eeveelutions, preserving direct creature interaction, room exploration, observation, and the Stone Dash arcade mode.
- **Project type:** Vanilla Three.js browser game / static web experience.
- **Primary root or artifact:** repository root; entrypoint `index.html`.
- **Target environment:** Modern desktop and mobile browsers, local static server, and GitHub Pages-compatible static hosting.
- **Canonical authority:** `westkitty/eevee_lab` default branch `main`.
- **Governed scope:** Runtime HTML/JavaScript, `src/`, `assets/`, vendored `libs/`, tools, tests, saves, rooms, models, camera, audio, UI, and gameplay.
- **Explicitly not governed:** Upstream third-party model sources and licenses beyond their checked-in provenance records.

## 2. Current Baseline

- **Primary artifact:** `76401e4d84a8b554432362b152adc9a78ffb3051`
- **Protected pre-Phase-0 runtime baseline:** `661a37bc7f86e5ff2b7da28d02e8c44ad696e007`.
- **Protected pre-Phase-1 implementation baseline:** `0e31de1b392bb6cab1895818047ad45982a87a08`.
- **Protected pre-Phase-2 implementation baseline:** `0c8f9adc9f251c044f4cb290cc6c6ec2f110c8cc`.
- **Protected pre-Phase-3 implementation baseline:** `39dfb95e65f0391722f0e40ce39916b7dcb615bd`.
- **Protected pre-Phase-4 implementation baseline:** `a86c34354ce8b5745550a4b0bac950e27e4d35c6`.
- **Protected pre-Phase-5 implementation baseline:** `eb5d02152f7ed588c3ac3fc6d3d9c8613d15f44f`.
- **Protected pre-Phase-6 implementation baseline:** `8ac85ce77defac04ce0a7dace0679793dadc5c59`.
- **Protected pre-Phase-7 implementation baseline:** `6246e1ca3e453691b0ceaf474b01ef851ddca8eb`.
- **Baseline state:** Phase 7 Living World, Atmosphere and Sound is committed. Clock/weather/audio contracts and prior pure-system regressions are focused-verified on a disposable current checkout; the broad browser journey is unresolved because CreatureActor was unavailable during the current Playwright attempt.
- **Source/build/install identity:** Vanilla global-script Three.js r128; no bundler or framework.
- **Active default user route:** `index.html` → Habitat House → Conservatory / habitat rooms.
- **Delivery state:** Repository has GitHub Pages enabled; live delivery is not reverified here.
- **Last verified baseline:** Unknown in this state record.

## 3. Artifact Contract

The project remains a dependency-free static browser experience. Eevee and all eight Eeveelutions are the primary visual subjects. Existing sandbox interactions, habitat navigation, camera/photo systems, persistence, accessibility behavior, procedural audio, Chill Mode, and Stone Dash must remain available unless a later scoped task explicitly replaces them.

## 4. Active Invariants

- **INV-001:** Preserve the existing no-bundler, no-framework runtime unless a separately proven migration is explicitly accepted.
- **INV-002:** Preserve all nine runtime character models and current form switching.
- **INV-003:** Preserve petting, feeding, disco, loaf, derp, Roomba, call/brush interactions, shiny mode, photo mode, Chill Mode, and Stone Dash.
- **INV-004:** Exactly one heavy habitat room is active at a time; prior room geometry/lights/particle resources are disposed on transition.
- **INV-005:** Do not duplicate or reload the nine character GLBs on room or mode changes.
- **INV-006:** Preserve versioned save migration and existing local save data.
- **INV-007:** Preserve reduced-motion handling, keyboard access, focus visibility, mobile touch targets, and the center-clear creature-first UI.
- **INV-008:** Preserve third-party model provenance and licensing records.
- **INV-009:** Engine migration must remain isolated from creature-AI/gameplay feature work until parity is proven.

## 5. Verified Working Behavior

- **VER-001:** Phase-0 diff is additive and bounded: exactly seven new files were added relative to `661a37b`; no existing runtime, model, library, room, save, audio, camera, UI, or gameplay file was modified.
- **VER-002:** `tools/inspect_glb_manifest.py` and `tools/validate_phase0.py` compile successfully under Python.
- **VER-003:** Synthetic GLB fixtures covering all nine species pass Phase-0 schema validation.
- **VER-004:** Anchored rig-role patterns pass the targeted regression that prevents `ForeArm` from being misclassified as an ear and `Finger` as a fin.
- **VER-005:** Eight checked-in runtime GLBs were directly decoded from their glTF JSON chunks; their rig/material/animation capabilities are recorded in `assets/models/rig-manifest.json`.
- **VER-006:** The semantic animation contract contains all twelve required slots for all nine species and deliberately leaves opaque clip meanings unclassified.
- **VER-007:** Three.js production runtime is explicitly held at r128 for Phase 1; any future migration is isolated behind `docs/THREE_VERSION_GATE.md`.
- **VER-008:** Phase-1 diff from `0e31de1` to `b0692d7` is bounded to seven files: one new runtime module, one new unit-test file, one report, and focused edits to index/rooms/room-manager/browser regression.
- **VER-009:** Source inspection after integration confirms one `animate()` owner, one `creatureActor.update()` seam, one model-registration seam, one room-sync seam, and one walkable-floor metadata/query path.
- **VER-010:** No model binary, vendored library, persistence module, save schema, audio subsystem, camera controller, photo subsystem, or arcade implementation file changed in Phase 1.
- **VER-011:** Phase-2 diff from `0c8f9ad` through `3b65d19` is bounded to the physical-interaction substrate, narrow runtime wiring, focused room/actor metadata, tests, and Phase-2 documentation.
- **VER-012:** Source inspection confirms exactly one `animate()` owner, one `setupPettingInteraction()` owner, one `interactionSystem.update()` seam, and one `creatureActor.update()` seam after Phase 2.
- **VER-013:** No model binary, vendored library, persistence module, save schema, camera subsystem, photo subsystem, procedural audio engine, or Stone Dash implementation file changed in Phase 2.
- **VER-014:** Direct room props are declared only through the shared `RoomKit` toy/brush builders, preserving data-first reuse rather than per-room interaction forks.
- **VER-015:** Phase-3 diff from `39dfb95` through `f0ceaa8` is bounded to six intended files: behavior substrate, actor behavior-pose support, narrow runtime wiring, focused behavior tests, browser assertions, and Phase-3 documentation.
- **VER-016:** Source inspection confirms one master `animate()` owner, one actor update, one behavior-scheduler update, and one behavior-event handoff.
- **VER-017:** Phase 3 persists no event log and introduces no second familiarity score; bounded semantic memory lives under `creatureMemory.<species>` while existing `BondTracker` remains relationship authority.
- **VER-018:** Natural rest tracks user quiet separately from creature locomotion, so autonomous wandering does not prevent eventual sleep.
- **VER-019:** No model binary, vendored library, save version, camera subsystem, audio architecture, photo subsystem, room lifecycle, or Stone Dash implementation file changed in Phase 3.
- **VER-020:** Phase-4 diff from `a86c343` through `2526dda` is bounded to six intended files: CreatureManager, a narrow CreatureActor spawn primitive, runtime wiring, focused manager tests, browser assertions, and Phase-4 documentation.
- **VER-021:** Source inspection confirms exactly one master `animate()` owner, one `CreatureManager` construction, one normal `creatureManager.update()` seam, one fallback direct primary update, and no second requestAnimationFrame loop in the manager.
- **VER-022:** The runtime still contains exactly one `gltfLoader.load()` call site; the Phase-4 Vaporeon companion reuses the already-loaded wrapper rather than cloning or reloading a GLB.
- **VER-023:** Companion lifecycle preserves the original wrapper parent, local transform, and visibility and restores them when the companion leaves; focused manager and lifecycle contracts pass in the available container.
- **VER-024:** Optional social behavior is coordinated through CreatureManager while each CreatureActor remains the owner of its own world movement and pose.
- **VER-025:** No model binary, vendored library, save version/schema, persistence module, camera implementation, procedural-audio architecture, photo subsystem, room lifecycle implementation, or Stone Dash rules changed in Phase 4.
- **VER-026:** Phase-5 diff from `eb5d021` through `f2f8f32` is bounded to twelve intended room/world/persistence/actor/interaction/test/report surfaces; no model binary, vendored library, camera, audio, photo, or arcade implementation file changed.
- **VER-027:** Focused `tools/test_habitat_state.js` passes for v1→v2 migration, nested-default preservation, narrative progression, placement transforms, provenance traces, and Conservatory history summary.
- **VER-028:** Focused `tools/test_room_manager_phase5.js` passes for one-heavy-room transition, door request handoff, destination entry/continuation coordinates, placement restoration, narrative application, and placement recapture.
- **VER-029:** Source inspection confirms one master `animate()`, one `RoomManager.goTo()` lifecycle owner, one physical-door choreography owner, one `gltfLoader.load()` call site, and no scene-graph serialization in habitat persistence.
- **VER-030:** Save schema v2 stores semantic `roomNarrative`, `placedObjects`, and provenance-rich `crossContamination` while preserving v1 user data through migration.
- **VER-031:** All nine species habitats plus the Conservatory implement visible narrative-stage application; habitat-room decoration supplies return portals, persistent furnishings, topology metadata, and destination entry/continuation points.
- **VER-032:** Drawer/public instant room navigation remains available as an accessibility/debug fallback while diegetic doors use actor locomotion and threshold occlusion.
- **VER-033:** Phase-5 portal previews are cached lightweight textures only; no destination heavy room is loaded behind a portal.
- **VER-034:** Phase-6 diff from `8ac85ce` through `3071571` is bounded to evolution/ability/rendering/room/persistence/test/report surfaces; no model binary or vendored library changed.
- **VER-035:** `tools/test_phase6_system.js` passes against current GitHub main source on the authorized Mac for explicit shiny mapping/restoration, unknown-material preservation, ability compatibility, stale-target rejection and two-step evolution.
- **VER-036:** Updated `tools/test_habitat_state.js` passes against current GitHub main source on the authorized Mac through save-v3 migration and semantic ability mutation persistence while retaining Phase-5 state behavior.
- **VER-037:** `node --check` passes for all changed Phase-6 source modules: phase6-system, render-effects, rooms, room-manager, persistence and habitat-state.
- **VER-038:** Source inspection confirms one master render loop, one GLB load site, one EvolutionController construction/update seam, one AbilitySystem construction and one model cel-conversion seam.
- **VER-039:** The old whole-model shiny tint markers are absent from `index.html`; explicit shiny profiles cover all nine species and preserve unknown materials.
- **VER-040:** Ability persistence is semantic only under save-v3 `abilityMutations`; no scene serialization is introduced.
- **VER-041:** Ability-target material mutations use room-owned clones with explicit disposal, preventing shared RoomKit material bleed.
- **VER-042:** Physical evolution reuses already-loaded models and CreatureActor approach locomotion; no second GLB load path or renderer migration was added.
- **VER-043:** Phase-7 diff from `6246e1c` through `8757beb` is bounded to five living-world/integration/test surfaces: `index.html`, `src/phase7-living-world.js`, `src/room-manager.js`, `tools/test_phase7_living_world.js`, and the browser-harness portability fallback.
- **VER-044:** `tools/test_phase7_living_world.js` passes on a disposable current Mac checkout for accelerated clock phases, deterministic room weather, weather budgets, one reused Web Audio graph, ambience-level control and audio suspension.
- **VER-045:** On the same disposable checkout, Phase-6, habitat-state, room-manager, creature-manager, creature-behavior, interaction-system and creature-actor focused Node contracts all pass.
- **VER-046:** Phase 7 adds no second animation loop, AudioContext, GLB load path, dependency, model binary change or save-schema migration; RoomManager remains the heavy-room lifecycle owner.
- **VER-047:** Ambient life and weather use two batched `THREE.Points` populations; room-owned Phase-7 geometries/materials are disposed through the existing heavy-room lifecycle.
- **VER-048:** Existing manual atmosphere variants retain lighting authority while the default atmosphere allows the living-world clock to drive habitat lighting.

## 6. Known Not Working

No confirmed baseline failure is recorded at initialization.

## 7. Implemented but Unverified

- **UNV-001:** `tools/verify_all_gameplay.js` exists and encodes the current broad regression path, but it could not be executed in the current Phase-0 environment because the working container cannot clone/fetch the repository binary payloads and the authorized desktop device is offline.
- **UNV-002:** The README-described runtime behavior remains source-backed but is not newly browser-verified in this execution environment.
- **UNV-003:** Umbreon's 2,192,044-byte GLB exceeds the current connector's inline binary contents limit. Its repository identity, source armature, runtime normalization, and runtime bone/material lookup behavior are recorded, but its complete raw joint/clip/material inventory must be regenerated by `tools/inspect_glb_manifest.py` in a normal checkout.
- **UNV-004:** Phase-1 CreatureActor runtime integration is source-complete and its browser regression assertions are committed, but the browser suite has not run in this execution environment.
- **UNV-005:** The local fixed-step actor scenario passed against the implementation candidate during construction, but exact committed-browser behavior is not promoted to verified until `tools/test_creature_actor.js` and `tools/verify_all_gameplay.js` run from a normal checkout.
- **UNV-006:** Phase-2 direct manipulation, continuous petting, visible brushing, physical food, toy chase/retrieve, long-press context access, optional haptics, and root-ground projection are source-complete but have not run in a browser-capable checkout.
- **UNV-007:** `tools/test_interaction_system.js` is committed for tactile classification, stroke dynamics, and direct-prop drag/release logic, but cannot be executed in the current environment because the container cannot resolve github.com for a clean checkout.
- **UNV-008:** Phase-3 memory, needs, sleep/wake, rare spontaneous behavior, familiarity-sensitive calls, initiative, and species bond gestures are source-complete but have not run in a browser-capable checkout.
- **UNV-009:** `tools/test_creature_behavior.js` and the Phase-3 Playwright assertions are committed but remain unexecuted in this environment.
- **UNV-010:** The Eevee + Vaporeon Conservatory pair, visible social behaviors, companion focus, room/form restoration, toy competition, and synchronized nap browser journeys are implemented and asserted in Playwright but have not run in a browser-capable checkout.
- **UNV-011:** Current GitHub Pages delivery has not been reverified after Phase 4.
- **UNV-012:** Phase-5 portal preview rendering, physical walk-through-door choreography, destination continuation, visible room-state progression, persistent furnishing drag/drop, provenance trace rendering, and Conservatory history display are asserted in Playwright but have not run in a browser-capable checkout.
- **UNV-013:** The updated persistent-furnishing assertion in `tools/test_interaction_system.js` is committed but was not separately executed from the exact repository checkout in this environment.
- **UNV-014:** Phase-6 visible cel rendering, two-step evolution camera/flash choreography, room ability VFX, persistent mutation visuals, distinct ability controls and cinematic rim lighting are asserted in Playwright but have not run in a current browser checkout.
- **UNV-015:** The authorized Mac contains `/Users/andrew/EEvEE_Lab`, but that checkout is still at `661a37b`; it was deliberately not used as evidence for current Phase-6 browser behavior.
- **UNV-016:** A current broad Playwright attempt launched successfully using installed Google Chrome but failed the protected journey: `actor-boot` reported CreatureActor unavailable and the suite later crashed when the Phase-1 movement assertion dereferenced missing actor state. Root cause is unresolved; no Phase-1 through Phase-7 browser behavior is promoted from this run.
- **UNV-017:** Phase-7 visual quality of vistas, weather motion and ambient-life composition is not yet manually approved in a rendered browser session.
- **UNV-018:** Live GitHub Pages delivery remains unverified after Phase 7.
- **UNV-019:** Phase-7.5 source forensics found an exact symptom match for a stale-served-runtime failure mode: protected baseline `661a37b` has no `src/creature-actor.js`, no `CreatureActorSystem` reference and no `creatureActorState` API, while current `main` has all three. The broad harness accepts whichever page is already serving at `BASE_URL` and does not verify the served checkout identity. A server rooted at `661a37b` could therefore finish the nine-model wait, report `actor-boot` unavailable and then fail at the Phase-1 movement dereference exactly as observed. This is strong source evidence for a stale/static-server candidate, not browser proof of root cause.

## 8. Unknown or Evidence-Stale State

- **UNK-001:** Current live browser/GitHub Pages behavior is not reverified in this state record.
- **UNK-002:** Semantic meanings of the seven opaque primary-pack animation clips remain intentionally unclassified pending visual playback evidence.

## 9. Pending Work

- **PND-001:** In the first normal checkout, regenerate `assets/models/rig-manifest.json` so Umbreon's deep binary inventory replaces the partial evidence entry.
- **PND-002:** Run `node tools/test_creature_actor.js`.
- **PND-003:** Run `node tools/test_interaction_system.js`.
- **PND-004:** Run `tools/verify_all_gameplay.js` in a current browser-capable checkout and promote Phase-1 through Phase-6 runtime behavior only if it passes.
- **PND-005:** Visually classify any embedded animation clip before mapping it to a semantic slot.
- **PND-006:** Full limb IK remains deferred until rig-specific foot-chain behavior is visually proven; Phase 2 uses root-ground projection only.
- **PND-007:** Run `node tools/test_creature_behavior.js`.
- **PND-008:** Before expanding beyond the Eevee + Vaporeon Conservatory slice, obtain the first browser-capable multi-creature regression run when possible and keep companion history/persistence out of scope until that slice is proven.
- **PND-009:** Re-run the exact committed `tools/test_interaction_system.js` in the first normal checkout and confirm persistent furnishings cannot become projectiles.
- **PND-010:** Update or create a current disposable Eevee Lab checkout before the next full Playwright run; do not treat the stale `661a37b` local checkout as current runtime evidence.
- **PND-011:** Diagnose the current broad-browser CreatureActor boot failure before relying on end-to-end Playwright proof; preserve the passing focused contracts while isolating whether the failure predates or was exposed by Phase 7.
- **PND-012:** Manually inspect Phase-7 vista placement, micro-weather readability, reduced-motion behavior and ambient-life composition in a rendered browser session.
- **PND-013:** Re-run the full Playwright suite after the actor-boot repair and promote browser behavior only if the protected Phase-1 through Phase-7 journey passes.
- **PND-014:** Phase 8 may expand observation/media systems only after the browser actor-boot failure is repaired or explicitly isolated from that work.
- **PND-015:** On the next browser-capable run, prove the served checkout before mutation: capture static-server working directory/HEAD, failed script requests, `window.CreatureActorSystem`, `window.eeveeApp`, and `window.eeveeApp.creatureActor`. If a stale server is confirmed, restart the server from a disposable checkout at current remote `main` and rerun the full suite before changing application code.

## 10. Active Decisions, Defaults, and Prohibitions

- **DEC-001:** Phase 0 may add inspection tooling, manifests, state/governance records, and validation only; it must not add Phase-1 creature behavior.
- **DEC-002:** Do not replace or regenerate runtime character assets during Phase 0.
- **DEC-003:** Do not upgrade Three.js during Phase 0 merely for modernity.
- **DEC-004:** Unknown clip names must remain unclassified until visual/runtime evidence supports a semantic label.
- **DEC-005:** `CreatureActor` owns ordinary sandbox x/z/yaw movement; existing evolution/disco/loaf/Roomba/feeding/petting paths temporarily suspend that authority.
- **DEC-006:** Reduced Motion disables autonomous wandering but does not disable explicit tap/programmatic movement.
- **DEC-007:** Walk presentation remains conservative procedural bob/sway until a skeletal animation clip is visually classified.
- **DEC-008:** The interaction wheel remains an accessible fallback; direct world manipulation is the preferred creature/prop interaction path.
- **DEC-009:** Species tactile differences are represented as data weights and semantic body regions rather than species-specific pointer-handler forks.
- **DEC-010:** Room toys use lightweight project-owned throw/roll physics; no rigid-body dependency is added.
- **DEC-011:** Brush mode is a visible world-space tool and pet/brush responses are based on measured stroke dynamics.
- **DEC-012:** Physical food may be dragged in-world while the legacy ballistic `feedTreat()` path remains available.
- **DEC-013:** Phase-2 grounding is root-ground projection only; full per-foot IK is explicitly deferred.
- **DEC-014:** Existing `BondTracker` remains the sole familiarity authority; Phase 3 only interprets its tiers behaviorally.
- **DEC-015:** Creature memory stores bounded semantic aggregates, never a chronological interaction transcript.
- **DEC-016:** Need values are opportunity biases only and never punish absence, neglect, or low engagement.
- **DEC-017:** BehaviorScheduler may request behavior but may not mutate Three.js objects; CreatureActor remains motion/pose authority.
- **DEC-018:** Rare moments are temporary tagged events; sleep is a real scheduler state with an explicit wake path.
- **DEC-019:** Comfortable and bonded familiarity may cause voluntary approach/attention; cautious familiarity preserves attention without forced closeness.
- **DEC-020:** Phase-4 multi-creature rollout is deliberately limited to Eevee + Vaporeon in the Conservatory; other rooms/forms retain the single-creature path.
- **DEC-021:** Companion models reuse already-loaded species wrappers. No GLB reload, skeleton clone, or second asset cache is permitted for this vertical slice.
- **DEC-022:** CreatureManager owns roster, companion lifecycle, selection, separation and social coordination; CreatureActor remains the sole transform/pose authority for each creature.
- **DEC-023:** Companion activation uses a dedicated outer root and must restore the wrapper's original parent, local transform and visibility before form switching, room exit, or arcade entry.
- **DEC-024:** Phase-3 BehaviorScheduler remains primary-creature relationship authority in this slice; companion memory/history is not fabricated.
- **DEC-025:** Petting, brushing and feeding remain primary-targeted in Phase 4; companion click selection/focus is supported without widening the interaction refactor.
- **DEC-026:** Reduced Motion suppresses optional autonomous social movement; overlap separation remains enabled as a safety behavior.
- **DEC-027:** HabitatWorldState is the source of truth for room narrative, semantic placement and trace provenance; Three.js scene objects are never persisted.
- **DEC-028:** Save schema v2 is backward-compatible: legacy anonymous trace strings become explicit `legacy` provenance rather than being discarded.
- **DEC-029:** Physical door travel uses CreatureActor locomotion to a safe threshold, then RoomManager performs the same one-heavy-room dispose/build lifecycle before actor continuation from a destination entry point.
- **DEC-030:** Room-grid navigation remains instant and accessible; physical door choreography is the preferred diegetic path, not the only path.
- **DEC-031:** Portal previews are cached low-cost CanvasTextures and never justify keeping a second heavy habitat loaded.
- **DEC-032:** Placement persistence stores stable object identity plus bounded transform only; furniture is drag/drop and cannot become projectile physics.
- **DEC-033:** Slowly placed/retrieved identified toys may persist at rest, but thrown toys retain Phase-2 chase/retrieve behavior.
- **DEC-034:** Cross-room contamination is bounded to at most four provenance-rich traces per destination and is seeded deterministically from meaningful source-room events.
- **DEC-035:** Every habitat exposes semantic topology (interest, sleep, social, prop and portal positions); CreatureActor may use interest points for autonomous exploration without adding navmesh/physics dependencies.
- **DEC-036:** EvolutionController owns physical evolution sequencing; CreatureActor owns the approach; the species strip remains an instant accessibility/debug switch.
- **DEC-037:** Physical evolution is two-step: first activation offers/approaches, second activation commits; no irreversible form swap occurs on the first stone tap.
- **DEC-038:** AbilitySystem owns species-to-target compatibility; HabitatWorldState stores only semantic ability mutations and RoomManager reapplies them on rebuild.
- **DEC-039:** Species abilities may mutate only targets in the currently active room; stale target references are rejected.
- **DEC-040:** Imported GLB materials are cel-converted once at load without renderer/framework migration; original material names remain the shiny-profile key.
- **DEC-041:** Shiny mode modifies only explicitly known material names/patterns; unknown materials are preserved rather than globally recolored.
- **DEC-042:** Ability visuals must not mutate shared RoomKit cached materials; target materials are cloned per room and disposed through the existing room lifecycle.
- **DEC-043:** Cinematic lighting remains lightweight room-local directional rim lighting; no post-processing stack or new runtime dependency is introduced.

## 11. Validation and Evidence Matrix

| ID | Claim or behavior | State | Evidence | Validation method | Artifact/revision | Last checked | Recheck trigger |
|---|---|---|---|---|---|---|---|
| VAL-001 | Baseline source architecture exists as documented | observed-source | README, index.html, src/, libs/, tools/ | Repository inspection | 661a37b | 2026-09-21 | architecture change |
| VAL-002 | Broad regression harness exists | observed-source | tools/verify_all_gameplay.js | Source inspection | 661a37b | 2026-09-21 | test rewrite |
| VAL-003 | Runtime user journey passes | unverified | Not executable in current environment; no runtime file changed by Phase 0 | Browser/Playwright regression suite | 61cea67 | — | next browser-capable checkout |
| VAL-004 | Phase-0 change scope is additive only | verified | GitHub compare 661a37b...61cea67: seven files added, zero existing files modified/deleted | GitHub compare | 61cea67 | 2026-09-21 | any Phase-0 repair |
| VAL-005 | Rig manifest/contract schemas are internally valid | verified | py_compile + synthetic-fixture schema test + role-pattern regression PASS | Local container tests | 61cea67 | 2026-09-21 | tooling/schema change |
| VAL-006 | Phase-1 change scope is bounded | verified | GitHub compare 0e31de1...b0692d7 shows only seven intended files | GitHub compare | b0692d7 | 2026-09-21 | Phase-1 repair |
| VAL-007 | One master loop / one actor update seam | verified-source | Source counts: one animate owner, one actor update/register/room-sync path | Repository source inspection | b0692d7 | 2026-09-21 | runtime integration change |
| VAL-008 | Creature Actor browser user path works | unverified | Regression assertions committed but not executable in current environment | node unit test + Playwright suite | b0692d7 | — | first browser-capable checkout |
| VAL-009 | Phase-2 change scope is bounded | verified | GitHub compare from 0c8f9ad through Phase-2 implementation shows only intended interaction/runtime/test/docs surfaces | GitHub compare | 3b65d19 | 2026-09-22 | Phase-2 repair |
| VAL-010 | One master loop and one interaction owner remain | verified-source | Source counts show one animate, one setupPettingInteraction, one interaction update, one actor update | Repository source inspection | 3b65d19 | 2026-09-22 | input/loop change |
| VAL-011 | Physical interaction browser journey works | unverified | Node/Playwright tests are committed; container clean checkout blocked by github.com DNS resolution | Node + Playwright | 3b65d19 | — | first browser-capable checkout |
| VAL-012 | Phase-3 change scope is bounded | verified | GitHub compare 39dfb95...f0ceaa8 shows six intended files only | GitHub compare | f0ceaa8 | 2026-09-22 | Phase-3 repair |
| VAL-013 | Behavior ownership remains singular | verified-source | One animate owner, one actor update, one scheduler update, one event handoff | Repository source inspection | f0ceaa8 | 2026-09-22 | actor/scheduler change |
| VAL-014 | Relationship memory is bounded and non-punitive | verified-source | No persisted event log, no new bond score, capped aggregate counters only | Repository source inspection | f0ceaa8 | 2026-09-22 | memory schema change |
| VAL-015 | Phase-3 runtime user path works | unverified | Focused Node and Playwright assertions committed but unavailable to execute here | Node + Playwright | f0ceaa8 | — | first browser-capable checkout |
| VAL-016 | Phase-4 change scope is bounded | verified | GitHub compare a86c343...2526dda touches only six intended implementation/test/doc surfaces | GitHub compare | 2526dda | 2026-09-22 | Phase-4 repair |
| VAL-017 | One render loop and one normal multi-actor update seam remain | verified-source | One animate owner, one manager constructor/update call, no manager requestAnimationFrame | Repository source inspection | 2526dda | 2026-09-22 | manager/update change |
| VAL-018 | Multi-creature path does not reload character GLBs | verified-source | Exactly one gltfLoader.load call site remains; companion activation reparents an existing wrapper | Repository source inspection | 2526dda | 2026-09-22 | asset-loading change |
| VAL-019 | Companion reparent/restore contract works in focused logic | verified-focused | Manager contract + lifecycle tests pass for roster, separation, greeting, toy race, nap scheduling and original-parent/visibility restoration | Container Node contract tests | 2526dda | 2026-09-22 | manager lifecycle change |
| VAL-020 | Eevee + Vaporeon browser user journey works | unverified | Broad Playwright assertions committed; no browser-capable checkout available here | Playwright | 2526dda | — | first browser-capable checkout |
| VAL-021 | Phase-5 change scope is bounded | verified | GitHub compare eb5d021...f2f8f32 touches twelve intended world/room/persistence/actor/interaction/test/report files only | GitHub compare | f2f8f32 | 2026-09-22 | Phase-5 repair |
| VAL-022 | Save-v2 semantic world-state contract works | verified-focused | test_habitat_state PASS: migration, nested defaults, narrative, placements, provenance, history | Container Node contract | f2f8f32 | 2026-09-22 | persistence/world-state change |
| VAL-023 | Door/room lifecycle and placement restoration work | verified-focused | test_room_manager_phase5 PASS: one heavy room, handoff, entry/continue, narrative apply, restore/capture | Container Node contract | f2f8f32 | 2026-09-22 | room-manager lifecycle change |
| VAL-024 | Phase-5 ownership remains singular | verified-source | One animate, one RoomManager.goTo, one door choreography owner, one GLB load site, zero scene serialization | Repository source inspection | f2f8f32 | 2026-09-22 | runtime/lifecycle change |
| VAL-025 | Physical habitat browser journey works | unverified | Playwright assertions committed for portal, walk-through door, persistence, provenance and Conservatory history; browser unavailable here | Playwright | f2f8f32 | — | first browser-capable checkout |
| VAL-026 | Phase-6 focused species-system contract works | verified-focused | test_phase6_system PASS from current GitHub main source on authorized Mac | Node contract | 3071571 | 2026-09-22 | evolution/ability/shiny change |
| VAL-027 | Save-v3 migration and ability persistence work | verified-focused | updated test_habitat_state PASS from current GitHub main source on authorized Mac | Node contract | 3071571 | 2026-09-22 | persistence/world-state change |
| VAL-028 | Changed Phase-6 modules are syntactically valid | verified | node --check exit 0 for six changed source modules | Node syntax check | 3071571 | 2026-09-22 | source change |
| VAL-029 | Phase-6 ownership remains singular | verified-source | one animate, one GLB load, one evolution controller/tick, one ability system, one celify seam | Repository source inspection | 3071571 | 2026-09-22 | runtime architecture change |
| VAL-030 | Phase-6 visible browser journey works | unverified | Playwright assertions committed; local Eevee checkout is stale at 661a37b | Playwright | 3071571 | — | current browser checkout |

## 12. Current Change Scope and Impact Radius

- **Allowed Phase-7 changes:** deterministic habitat clock, room micro-weather, lightweight vistas, ambient-life populations, reused-context procedural ambience, room lifecycle integration, HUD state exposure, focused tests, browser harness portability, report and operational state.
- **Protected and unchanged:** nine model binaries, Three.js r128, global-script/no-bundler architecture, save schema v3, Phase-6 cel/shiny material ownership, one-heavy-room lifecycle, single GLB load path, manual atmosphere selection, camera/photo architecture, creature behavior contracts and Stone Dash rules.
- **Potentially affected behavior:** room lighting/fog, room disposal, reduced-motion ambient movement, audio initialization/volume, sandbox↔arcade transitions, room breadcrumb/mood copy and browser regression execution.
- **Mandatory checks:** no second AudioContext; no second frame loop; room-owned living resources dispose; manual atmosphere lighting survives; reduced motion lowers ambient movement/population; arcade suspends fog/ambience; prior focused pure-system contracts remain green.
- **Validated here:** Phase-7 clock/weather/audio contract, source syntax, Phase-6 and Phase-1–5 focused pure-system regressions, final Phase-7 diff.
- **Failed/unresolved proof:** full browser journey currently fails because CreatureActor is unavailable at actor-boot; Phase-7 visual composition and live Pages remain unverified.
- **Repair class:** bounded feature implementation with a newly exposed browser-regression blocker.

## 13. Compact Revision Log

### Revision 1 — 2026-09-21

- **Artifact/source identity:** `661a37bc7f86e5ff2b7da28d02e8c44ad696e007`
- **State deltas:** Initialized project-local operational state before Phase-0 implementation.
- **New evidence:** Current repository structure, vendored Three.js r128, and existing broad regression harness were inspected.
- **Validation not performed:** Runtime/browser behavior is not yet reverified in this Phase-0 environment.


### Revision 2 — 2026-09-21

- **Artifact/source identity:** `61cea6790453367526b6f19cc25d3d68662477e7`
- **State deltas:** Phase 0 implemented: rig inspection tooling, rig manifest, semantic animation contract, Three.js migration gate, and Phase-0 report added.
- **Preservation evidence:** GitHub compare from `661a37b` shows only seven additive files; no pre-existing runtime or asset file changed.
- **Validation passed:** Python syntax checks, synthetic nine-species manifest/schema validation, and targeted role-pattern regression.
- **Declared unverified:** broad browser regression in this environment and Umbreon's full raw GLB JSON inventory due connector/runtime limits.
- **Next safe phase:** Phase 1 Creature Actor Core may begin against the committed contracts while preserving all active invariants.


### Revision 3 — 2026-09-21

- **Artifact/source identity:** `b0692d79b8a3b5d2fe5679fe0f296dd21b45e8a0`
- **State deltas:** Phase 1 Creature Actor Core implemented and wired into the existing Habitat House runtime.
- **New behavior:** bounded manual movement, delayed autonomous wandering, species pacing, idle attention, semantic animation ownership shell, room spawn/navigation synchronization, and tap-to-walk input.
- **Preservation evidence:** Phase-1 compare touches only seven intended files and leaves model binaries, dependencies, saves, camera, audio, photo, and arcade implementation untouched.
- **Source validation:** exactly one master animate owner and one actor update/register/room-sync integration path.
- **Declared unverified:** committed unit test and browser Playwright path have not executed from this environment; no runtime-passing claim is made.
- **Next safe action:** run the committed node/browser regressions from a normal checkout before expanding actor complexity.


### Revision 4 — 2026-09-22

- **Artifact/source identity:** `3b65d19ce6344230df3eeaa28516b4075f75c534`
- **State deltas:** Phase 2 Physical Interaction Layer implemented and pushed.
- **New behavior:** continuous tactile strokes, species touch profiles, direct toy drag/throw, toy chase/retrieve, visible brush tooling, draggable physical food, long-press context access, optional haptics, and explicit root-ground projection.
- **Preservation evidence:** one master frame loop and one pointer interaction owner remain; no dependency, save-schema, model, camera, photo, audio-architecture, or arcade implementation changes were introduced.
- **Validation added:** focused `tools/test_interaction_system.js` plus Phase-2 assertions in `tools/verify_all_gameplay.js`.
- **Declared unverified:** runtime/browser execution remains unavailable because the current container cannot resolve github.com for a clean checkout.
- **Next safe phase:** Phase 3 Personality, Memory and Relationship can build on the actor + interaction event semantics after preserving the same runtime proof requirement.


### Revision 5 — 2026-09-22

- **Artifact/source identity:** `f0ceaa8340cae57bd4364f0dd835016f18f8997d`
- **State deltas:** Phase 3 Personality, Memory and Relationship implemented and pushed.
- **New behavior:** bounded semantic memory, need/opportunity state, actual sleep/wake, nine species rare moments, nine bonded personal gestures, familiarity-sensitive calls, voluntary initiative, favorite touch/toy/food tracking, quiet/sleep-room memory.
- **Preservation evidence:** existing BondTracker remains authoritative; no save-version bump or event log; scheduler requests behavior while CreatureActor exclusively owns pose/movement.
- **Adversarial repair:** quiet companionship is tracked independently from autonomous locomotion so natural sleep remains reachable.
- **Validation added:** focused `tools/test_creature_behavior.js` plus Phase-3 assertions in the broad Playwright suite.
- **Declared unverified:** browser/runtime execution remains unavailable in the current container.
- **Next safe phase:** Phase 4 Multi-Creature Habitat, but only with the existing single-owner actor/interaction/behavior contracts preserved.


### Revision 6 — 2026-09-22

- **Artifact/source identity:** `2526ddadcdf9f9dcde8e451b0e52e8d555d90ee2`
- **State deltas:** Phase 4 Multi-Creature Habitat vertical slice implemented and pushed.
- **New behavior:** Eevee and Vaporeon can coexist in the Conservatory as independent actors with separation, greeting, approach, follow, shared inspection, parallel wandering, play, avoidance, nearby sitting, synchronized nap and toy competition.
- **Lifecycle design:** Vaporeon's already-loaded wrapper moves temporarily beneath an independent companion root and is restored to its exact original parent/local state before room/form/arcade transitions return to single-creature operation.
- **Selection:** companion click/focus is available while petting, brushing and feeding remain primary-targeted.
- **Preservation evidence:** one render loop, one normal manager update seam, one GLB load call site, no new dependency, no save migration, and no model binary changes.
- **Focused validation:** manager coordination and companion reparent/restore contracts pass in the available Node/container harness.
- **Declared unverified:** visible multi-creature browser behavior and Pages deployment remain unverified until a browser-capable checkout is available.
- **Next safe phase:** Phase 5 Habitat Becomes a Place, preserving the one-heavy-room lifecycle and the companion restoration contract.


### Revision 7 — 2026-09-22

- **Artifact/source identity:** `f2f8f320ad15e33c268ea2eb20a10fcbc328c96e`
- **State deltas:** Phase 5 Habitat Becomes a Place implemented and pushed.
- **New behavior:** physical door travel with actor approach/threshold/continuation, cached destination previews, semantic habitat topology, four-stage persistent room narratives, placeable furnishings/toys, Conservatory save-history display, and provenance-rich cross-room traces.
- **Persistence:** save schema advanced to v2 with backward migration for old room memory and anonymous trace arrays; nested defaults are preserved.
- **Narrative visuals:** all nine species habitats and Conservatory visibly respond to their persistent state rather than exposing metadata alone.
- **Preservation evidence:** one render loop, one RoomManager heavy-room lifecycle, one GLB load site, no new dependency, no scene serialization, and unchanged model/camera/audio/photo/arcade implementation files.
- **Focused validation:** habitat-state migration/persistence and RoomManager door/placement lifecycle contracts pass in the available container.
- **Declared unverified:** the full browser journey and live GitHub Pages rendering remain unverified; exact committed persistent-furnishing unit assertion awaits a normal checkout.
- **Next safe phase:** Phase 6 Transformation, Elemental Powers and Visual Unification, preserving save-v2 semantics and Phase-5 topology/lifecycle contracts.


### Revision 8 — 2026-09-22

- **Artifact/source identity:** `30715710146880400bc1dda3a479f2b7aa1e2643`
- **State deltas:** Phase 6 Transformation, Elemental Powers and Visual Unification implemented and pushed.
- **New behavior:** two-step physical Eevee evolution, eight reusable environmental abilities, persistent room power mutations, explicit material-keyed shiny profiles, cel-converted GLB materials and lightweight cinematic rim lighting.
- **Persistence:** save schema advanced to v3 with semantic `abilityMutations`; v1/v2 data continues through the migration path.
- **Lifecycle protection:** ability target materials are room-owned clones and dispose with the habitat; one heavy room and one GLB load path remain.
- **Focused validation:** Phase-6 species-system test and updated habitat-state migration test pass from current GitHub main source on the authorized Mac; all changed source modules pass Node syntax checking.
- **Declared unverified:** the full Playwright/browser journey and live GitHub Pages rendering remain unverified because the local Eevee Lab checkout is stale at `661a37b`.
- **Next safe phase:** Phase 7 Living World, Atmosphere and Sound, preserving save-v3 semantics and Phase-6 rendering/material ownership.


### Revision 9 — 2026-09-22

- **Artifact/source identity:** `76401e4d84a8b554432362b152adc9a78ffb3051`
- **State deltas:** Phase 7 Living World, Atmosphere and Sound implemented and pushed.
- **New behavior:** accelerated habitat clock, deterministic room micro-weather, time/weather HUD state, room-owned vistas, batched ambient life/weather, and a reused-context procedural AudioDirector.
- **Performance/lifecycle:** ambient life and weather are two Points batches; room-owned Phase-7 geometry/materials dispose with the heavy room; no new dependency, frame loop, GLB load path or AudioContext was added.
- **Focused validation:** Phase-7 contract passes; Phase-6, habitat-state, room-manager, creature-manager, creature-behavior, interaction-system and creature-actor focused Node regressions also pass on a disposable current Mac checkout.
- **Browser evidence:** the Playwright harness now falls back to installed Chrome/Brave/Chromium when its exact cached browser is absent. A current Chrome run exposed an unresolved actor-boot failure and did not complete the protected journey.
- **Declared unverified:** Phase-7 visual composition and live Pages delivery.
- **Next safe action:** diagnose and repair the browser CreatureActor boot failure before Phase 8 relies on full end-to-end behavior.


### Revision 10 — 2026-09-22

- **State delta:** Phase 7.5 browser-recovery forensics recorded; no application/runtime code changed.
- **Source evidence:** `661a37b` lacks the CreatureActor script/global/debug API that the current harness expects, while current `main` includes them. Because the harness does not establish served-source identity, a stale server can reproduce the observed `actor unavailable` → movement-null-dereference chain.
- **Evidence limit:** the authorized Mac could not be re-entered in this session (DEX//REACH exposed no connected node; the alternate remote-computer connector reported the MacBook Air offline), so the stale-server candidate is not promoted to confirmed root cause and no browser repair is claimed.
- **Next safe action:** establish a current disposable checkout and server identity on the Mac, reproduce with console/page/network evidence, then either restart the stale server with no app-code mutation or repair the earliest proven runtime defect. Phase 8 remains blocked until broad Playwright completes.
