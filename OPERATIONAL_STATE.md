# Operational State: Eevee Lab

<!-- operational-state:metadata
{
  "schema_version": 1,
  "project_id": "eevee-lab",
  "project_name": "Eevee Lab",
  "project_root": "/",
  "artifact_path": "index.html",
  "state_revision": 15,
  "last_updated": "2026-09-26",
  "current_baseline": {
    "identity": "f606913a4bede2d90b9c6fb619e4f038cae29df4",
    "state": "pre-quality-uplift-source-baseline-focused-contracts-pass-browser-unverified",
    "last_verified": "12 focused Node contracts plus JavaScript/Python syntax checks; current browser binary unavailable"
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

- **Pre-uplift source baseline:** `f606913a4bede2d90b9c6fb619e4f038cae29df4` (the checked-out parent of this quality-uplift working tree).
- **Protected pre-Phase-0 runtime baseline:** `661a37bc7f86e5ff2b7da28d02e8c44ad696e007`.
- **Protected pre-Phase-1 implementation baseline:** `0e31de1b392bb6cab1895818047ad45982a87a08`.
- **Protected pre-Phase-2 implementation baseline:** `0c8f9adc9f251c044f4cb290cc6c6ec2f110c8cc`.
- **Protected pre-Phase-3 implementation baseline:** `39dfb95e65f0391722f0e40ce39916b7dcb615bd`.
- **Protected pre-Phase-4 implementation baseline:** `a86c34354ce8b5745550a4b0bac950e27e4d35c6`.
- **Protected pre-Phase-5 implementation baseline:** `eb5d02152f7ed588c3ac3fc6d3d9c8613d15f44f`.
- **Protected pre-Phase-6 implementation baseline:** `8ac85ce77defac04ce0a7dace0679793dadc5c59`.
- **Protected pre-Phase-7 implementation baseline:** `6246e1ca3e453691b0ceaf474b01ef851ddca8eb`.
- **Pre-uplift evidence:** 12 focused Node contracts, JavaScript syntax checks, Python tool compilation, and `git diff --check` passed before the uplift edits. Browser verification did not run in this environment.
- **Recorded historical evidence (not rerun here):** The prior state record attributes a 95/95 Playwright journey and five-viewport checks to `bdb4e8109fede35e0ac634be3089035cd9d40253`, and a Pages deployment to `ac53c13a15292a1ebf221060c6156804abc33c0f`. Those commits are not available in this shallow checkout; treat these as historical records, not current-session verification.
- **Source/build/install identity:** Vanilla global-script Three.js r128; no bundler or framework.
- **Active default user route:** `index.html` → Habitat House → Conservatory / habitat rooms.
- **Current branch delivery:** No live-route or Pages deployment verification has been performed for the quality-uplift revision; the earlier deployment record is historical.
- **Current visual status:** Browser rendering and manual visual composition review remain unverified.
- **Detailed current quality assessment:** [`docs/QUALITY_UPLIFT_REPORT.md`](docs/QUALITY_UPLIFT_REPORT.md).

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
- **INV-010:** Expansion regions are additive: they register through `ExpansionKit` / `EXPANSION_REGISTRY`; the original ten room ids, their order, and their save keys remain unchanged.
- **INV-011:** Responsive changes must preserve the creature-first clear center, safe-area containment, no horizontal document overflow, usable touch targets, and bounded open-drawer geometry across phone portrait, phone landscape, tablet portrait, tablet landscape, and desktop.

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
- **VER-049:** Phase 7.5 clean-checkout reproduction proved the earliest current browser failure was `ReferenceError: FX is not defined` in the GLB load callback; CreatureActor itself was present. The bounded repair binds `window.RenderEffects` before `FX.celifyObject(...)`.
- **VER-050:** After the repair and harness synchronization fixes, `tools/verify_all_gameplay.js` completes **86 passed, 0 failed** with **0 console/page errors** on the authorized Mac. Actor boot/manual movement, Phase-2 interactions, Phase-3 behavior, Phase-4 multi-creature, Phase-5 doors/world state, Phase-6 evolution/abilities, repeated room lifecycle, media/persistence, reduced motion, mobile center-clear UI and Stone Dash all pass in one journey.
- **VER-051:** The eight focused Node contracts for Phase 7, Phase 6, habitat state, room manager, creature manager, creature behavior, interaction system and creature actor all pass after the final browser-harness edits.
- **VER-052:** Manual rendered inspection of controlled desktop/mobile captures found no Phase-7.5 visual blocker: cel treatment, native Vaporeon readability, vista/weather/ambient particles, Jolteon ability VFX, interaction popover, physical-evolution ready state and mobile UI remained usable/readable.
- **VER-053:** Source inspection after the repair still shows one `animate()` owner, one `gltfLoader.load()` site and one AudioContext construction path. The second textual `requestAnimationFrame` occurrence is a one-shot evolution-flash opacity callback, not another simulation/render loop.
- **VER-054:** The expansion integration is a descendant of both the prior `main` tip and `arena/01a0cbcd-eevee-lab`; `main` was advanced by non-forced fast-forward to the tested integration commit. Main-only Phase-7.5 state/report evidence was preserved rather than overwritten by the feature branch’s stale baseline.
- **VER-055:** `tools/test_expansions.js` passes on GitHub Actions: all 50 rooms are registered and navigated through real doors/RoomManager; 36 setpieces, 36 mementos, and 4 hub curios execute; four regions persist their consequences; disposal leaves the scene empty; and a legacy pre-expansion save retains its keys.
- **VER-056:** The final integration gate passes the expansion contract plus all eight pre-existing focused Phase-1–7 Node contracts on the merged application tree.
- **VER-057:** The final GitHub Actions Playwright journey completes **86 passed, 0 failed** with **0 console/page errors**. The harness now waits for the existing loading overlay to finish intercepting input after reload and checks room-authored hemisphere colors rather than nondeterministic instantaneous intensity owned by the accelerated Phase-7 living-world clock.
- **VER-058:** The adaptive HUD pass changes only `index.html` and `tools/verify_all_gameplay.js`. No assets, model binaries, gameplay modules, save schema, dependencies, Three.js runtime, room definitions, or engine ownership paths changed.
- **VER-059:** The final responsive GitHub Actions gate passes all focused Phase-1–7 plus expansion contracts and the complete browser journey with **95 passed, 0 failed** and **0 console/page errors**.
- **VER-060:** Responsive geometry is verified at 390×844 phone portrait, 844×390 phone landscape, 800×1280 tablet portrait, 1180×820 tablet landscape/small desktop, and 1440×900 wide desktop. Each closed state preserves center-canvas hit testing and no horizontal overflow; each open control drawer settles fully within the viewport and remains vertically scrollable.

## 6. Known Not Working

No confirmed baseline failure is recorded at initialization.

## 7. Implemented but Unverified

- **UNV-003:** Umbreon's 2,192,044-byte GLB exceeds the connector's historical inline binary contents limit. Its repository identity, source armature, runtime normalization, and runtime bone/material lookup behavior are recorded, but its complete raw joint/clip/material inventory still needs regeneration by `tools/inspect_glb_manifest.py` in a normal checkout.
- **UNV-018:** Superseded — live GitHub Pages delivery is now verified for the adaptive expansion-integrated baseline.
- **UNV-019:** The 40 expansion habitats and four new hubs have strong headless construction/lifecycle coverage, but their rendered visual composition has not yet been manually inspected in a real browser.
- **UNV-020:** The adaptive HUD has browser/geometry verification across five viewport classes, but the new responsive compositions have not yet received manual rendered visual QA.

## 8. Unknown or Evidence-Stale State

- **UNK-001:** Superseded — public GitHub Pages delivery has been verified for the adaptive expansion-integrated baseline.
- **UNK-002:** Semantic meanings of the seven opaque primary-pack animation clips remain intentionally unclassified pending visual playback evidence.

## 9. Pending Work

- **PND-001:** Regenerate `assets/models/rig-manifest.json` in a normal checkout so Umbreon's deep binary inventory replaces the partial evidence entry.
- **PND-005:** Visually classify any embedded animation clip before mapping it to a semantic slot.
- **PND-006:** Full limb IK remains deferred until rig-specific foot-chain behavior is visually proven; Phase 2 uses root-ground projection only.
- **PND-016:** Completed — GitHub Pages deployment for `ac53c13a15292a1ebf221060c6156804abc33c0f` succeeded, and an external GitHub Actions probe verified the public route plus live `src/ui-controller.js` and `src/expansions/expansion-kit.js` assets.
- **PND-017:** Phase 8 Observation & Media may begin from `4d4c0ee9f08b5f612647d86e3f81490cf6e6dace`, preserving the now-green expansion/focused/browser gates and all active invariants.
- **PND-018:** Perform manual rendered inspection of representative rooms from Tidewild Coast, Emberpeak Ruins, Neon Undercity, and Starfall Dreamway before making any claim that expansion visual composition is verified.
- **PND-019:** Perform manual rendered inspection of phone portrait, phone landscape, tablet portrait, tablet landscape, and desktop adaptive HUD compositions before promoting responsive visual polish from browser-verified to visually verified.

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
| VAL-003 | Runtime user journey passes | verified-browser | Phase-7.5 broad journey completes 86/86 with zero console/page errors | Browser/Playwright regression suite | 634f4df | 2026-09-22 | runtime or harness change |
| VAL-004 | Phase-0 change scope is additive only | verified | GitHub compare 661a37b...61cea67: seven files added, zero existing files modified/deleted | GitHub compare | 61cea67 | 2026-09-21 | any Phase-0 repair |
| VAL-005 | Rig manifest/contract schemas are internally valid | verified | py_compile + synthetic-fixture schema test + role-pattern regression PASS | Local container tests | 61cea67 | 2026-09-21 | tooling/schema change |
| VAL-006 | Phase-1 change scope is bounded | verified | GitHub compare 0e31de1...b0692d7 shows only seven intended files | GitHub compare | b0692d7 | 2026-09-21 | Phase-1 repair |
| VAL-007 | One master loop / one actor update seam | verified-source | Source counts: one animate owner, one actor update/register/room-sync path | Repository source inspection | b0692d7 | 2026-09-21 | runtime integration change |
| VAL-008 | Creature Actor browser user path works | verified-browser | Actor boot and bounded manual movement pass in the 86/86 current browser journey | Node + Playwright | 634f4df | 2026-09-22 | actor/runtime change |
| VAL-009 | Phase-2 change scope is bounded | verified | GitHub compare from 0c8f9ad through Phase-2 implementation shows only intended interaction/runtime/test/docs surfaces | GitHub compare | 3b65d19 | 2026-09-22 | Phase-2 repair |
| VAL-010 | One master loop and one interaction owner remain | verified-source | Source counts show one animate, one setupPettingInteraction, one interaction update, one actor update | Repository source inspection | 3b65d19 | 2026-09-22 | input/loop change |
| VAL-011 | Physical interaction browser journey works | verified-browser | direct props, throw, brush and physical-food assertions pass in the broad journey; focused interaction contract also passes | Node + Playwright | 634f4df | 2026-09-22 | interaction change |
| VAL-012 | Phase-3 change scope is bounded | verified | GitHub compare 39dfb95...f0ceaa8 shows six intended files only | GitHub compare | f0ceaa8 | 2026-09-22 | Phase-3 repair |
| VAL-013 | Behavior ownership remains singular | verified-source | One animate owner, one actor update, one scheduler update, one event handoff | Repository source inspection | f0ceaa8 | 2026-09-22 | actor/scheduler change |
| VAL-014 | Relationship memory is bounded and non-punitive | verified-source | No persisted event log, no new bond score, capped aggregate counters only | Repository source inspection | f0ceaa8 | 2026-09-22 | memory schema change |
| VAL-015 | Phase-3 runtime user path works | verified-browser | bounded memory, bond gesture, sleep/wake pass in the broad journey; focused behavior contract passes | Node + Playwright | 634f4df | 2026-09-22 | behavior change |
| VAL-016 | Phase-4 change scope is bounded | verified | GitHub compare a86c343...2526dda touches only six intended implementation/test/doc surfaces | GitHub compare | 2526dda | 2026-09-22 | Phase-4 repair |
| VAL-017 | One render loop and one normal multi-actor update seam remain | verified-source | One animate owner, one manager constructor/update call, no manager requestAnimationFrame | Repository source inspection | 2526dda | 2026-09-22 | manager/update change |
| VAL-018 | Multi-creature path does not reload character GLBs | verified-source | Exactly one gltfLoader.load call site remains; companion activation reparents an existing wrapper | Repository source inspection | 2526dda | 2026-09-22 | asset-loading change |
| VAL-019 | Companion reparent/restore contract works in focused logic | verified-focused | Manager contract + lifecycle tests pass for roster, separation, greeting, toy race, nap scheduling and original-parent/visibility restoration | Container Node contract tests | 2526dda | 2026-09-22 | manager lifecycle change |
| VAL-020 | Eevee + Vaporeon browser user journey works | verified-browser | pair activation, separation, greeting, toy competition and restoration pass in the broad journey | Playwright | 634f4df | 2026-09-22 | multi-creature change |
| VAL-021 | Phase-5 change scope is bounded | verified | GitHub compare eb5d021...f2f8f32 touches twelve intended world/room/persistence/actor/interaction/test/report files only | GitHub compare | f2f8f32 | 2026-09-22 | Phase-5 repair |
| VAL-022 | Save-v2 semantic world-state contract works | verified-focused | test_habitat_state PASS: migration, nested defaults, narrative, placements, provenance, history | Container Node contract | f2f8f32 | 2026-09-22 | persistence/world-state change |
| VAL-023 | Door/room lifecycle and placement restoration work | verified-focused | test_room_manager_phase5 PASS: one heavy room, handoff, entry/continue, narrative apply, restore/capture | Container Node contract | f2f8f32 | 2026-09-22 | room-manager lifecycle change |
| VAL-024 | Phase-5 ownership remains singular | verified-source | One animate, one RoomManager.goTo, one door choreography owner, one GLB load site, zero scene serialization | Repository source inspection | f2f8f32 | 2026-09-22 | runtime/lifecycle change |
| VAL-025 | Physical habitat browser journey works | verified-browser | portal preview, door approach/swap, placement restoration, provenance trace and Conservatory history pass in the broad journey | Playwright | 634f4df | 2026-09-22 | room/world change |
| VAL-026 | Phase-6 focused species-system contract works | verified-focused | test_phase6_system PASS from current GitHub main source on authorized Mac | Node contract | 3071571 | 2026-09-22 | evolution/ability/shiny change |
| VAL-027 | Save-v3 migration and ability persistence work | verified-focused | updated test_habitat_state PASS from current GitHub main source on authorized Mac | Node contract | 3071571 | 2026-09-22 | persistence/world-state change |
| VAL-028 | Changed Phase-6 modules are syntactically valid | verified | node --check exit 0 for six changed source modules | Node syntax check | 3071571 | 2026-09-22 | source change |
| VAL-029 | Phase-6 ownership remains singular | verified-source | one animate, one GLB load, one evolution controller/tick, one ability system, one celify seam | Repository source inspection | 3071571 | 2026-09-22 | runtime architecture change |
| VAL-030 | Phase-6 visible browser journey works | verified-browser | cel materials, rim light, two-step evolution, targeted shiny and ability persistence pass in the broad journey and representative frames were visually inspected | Playwright + rendered inspection | 634f4df | 2026-09-22 | Phase-6/render change |

| VAL-031 | Phase-7.5 broad browser gate | verified-browser | 86 passed, 0 failed; zero console/page errors from clean disposable current checkout | Playwright | 634f4df | 2026-09-22 | runtime/harness change |
| VAL-032 | Phase-7 rendered composition | verified-manual | controlled desktop/mobile captures inspected for cel treatment, weather/ambient readability, ability VFX, interaction popover, evolution ready state and mobile usability | Rendered browser inspection | 634f4df | 2026-09-22 | visual/lighting/UI change |
| VAL-033 | Phase-7.5 focused contracts | verified-focused | all eight focused Node contracts pass after final harness edits | Node contracts | 634f4df | 2026-09-22 | relevant source/test change |
| VAL-034 | Expansion lifecycle contract | verified-focused | 50 rooms navigate/build/tick/activate/dispose; 36 setpieces, 36 mementos, 4 hub curios execute; legacy save preserved | GitHub Actions Node contract | 4d4c0ee | 2026-09-23 | expansion/room integration change |
| VAL-035 | Expansion-integrated broad browser gate | verified-browser | 86 passed, 0 failed; zero console/page errors after deterministic overlay/lighting synchronization | GitHub Actions Playwright | 4d4c0ee | 2026-09-23 | runtime/harness integration change |
| VAL-036 | Merge preservation and ancestry | verified | integration is ahead of prior main with zero behind; main-only Phase-7.5 report/state preserved; no force push used | GitHub compare/ref evidence | 4d4c0ee | 2026-09-23 | branch integration |
| VAL-037 | Adaptive viewport geometry | verified-browser | phone portrait, phone landscape, tablet portrait, tablet landscape and wide desktop all preserve center-clear closed state, bounded controls, no horizontal overflow, and in-viewport scrollable drawers | GitHub Actions Playwright | bdb4e81 | 2026-09-23 | responsive UI change |
| VAL-038 | Adaptive broad regression | verified-browser | full browser journey plus responsive matrix: 95 passed, 0 failed, zero console/page errors; focused expansion and Phase-1–7 contracts also pass | GitHub Actions Node + Playwright | bdb4e81 | 2026-09-23 | responsive UI/harness change |
| VAL-039 | Live GitHub Pages delivery | verified-live | Pages deployment for current main completed successfully; external runner fetched the public route, matched responsive safe-area CSS, and loaded live UI-controller and expansion-kit assets | GitHub Pages + external Actions curl probe | ac53c13 | 2026-09-23 | deployment change |

## 12. Current Change Scope and Impact Radius

- **Adaptive HUD scope:** responsive CSS and browser regression coverage only. Phone portrait uses thumb-first bottom sheets; short landscape uses edge rails and compact side panes; tablets use bounded wider panes; desktop remains sparse with constrained HUD rails; safe-area and dynamic viewport units are foundational.
- **Protected and unchanged:** nine model binaries, Three.js r128, no-bundler/global-script architecture, save schema v3, one-heavy-room lifecycle, one GLB load path, living-world/audio architecture, creature ownership boundaries, room/expansion definitions, photo/camera behavior and Stone Dash rules.
- **Browser result:** 95 passed, 0 failed, zero console/page errors in the final GitHub Actions Playwright gate.
- **Responsive result:** five representative viewport classes pass center-clear, no-horizontal-overflow, bounded FAB/species-strip geometry, and fully settled in-viewport drawer checks.
- **Focused result:** expansion contract plus all eight pre-existing Phase-1–7 focused Node contracts pass unchanged.
- **Evidence limit:** rendered visual composition of the new adaptive layouts has not yet been manually inspected.
- **Remaining delivery unknown:** live GitHub Pages after the adaptive HUD merge.
- **Next safe phase:** continue from `bdb4e8109fede35e0ac634be3089035cd9d40253`, preserving INV-011 and the green 95-check responsive browser gate.

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


### Revision 11 — 2026-09-22

- **Artifact/source identity:** `634f4df71e7ea3a0c5d8a9ee21b0026a94f35a67`
- **State delta:** Phase 7.5 Browser Runtime Recovery gate promoted to browser-verified and manually visually verified.
- **Root cause:** clean current checkout reproduced `ReferenceError: FX is not defined` inside all GLB load callbacks; the missing `window.RenderEffects` binding was repaired. CreatureActor itself was present, so the earlier actor-unavailable symptom was not the earliest current failure.
- **Broad validation:** full Playwright journey completed 86 passed / 0 failed with zero console/page errors.
- **Focused validation:** all eight focused Node contracts passed after final harness edits.
- **Visual validation:** controlled desktop/mobile captures showed no blocker in cel rendering, native-room readability, Phase-7 weather/ambient composition, ability VFX, interaction popover, evolution ready state or mobile controls.
- **Preservation:** one render loop owner, one GLB load site, one AudioContext construction path, one-heavy-room lifecycle and save-v3 semantics remain intact.
- **Remaining unverified:** live GitHub Pages delivery of the repaired commit.
- **Next safe phase:** Phase 8 Observation & Media.

### Revision 12 — 2026-09-23

- **Artifact/source identity:** `4d4c0ee9f08b5f612647d86e3f81490cf6e6dace`
- **State delta:** Safely integrated `arena/01a0cbcd-eevee-lab` into current `main` through a two-parent integration commit plus bounded harness synchronization fixes; `main` advanced by non-forced fast-forward.
- **New behavior:** four expedition regions add four hubs and 36 species habitats, cross-room consequences, region-specific transitions, expedition navigation, and additive expansion registry/world-state seams.
- **Preservation evidence:** current Phase-7.5 RenderEffects boot repair, broad harness, operational-state authority, and `docs/PHASE7_5_REPORT.md` were preserved; the stale feature-branch state did not overwrite them.
- **Focused validation:** expansion lifecycle contract plus all eight prior focused Node contracts pass in GitHub Actions. Expansion contract covers all 50 rooms, 36 setpieces, 36 mementos, 4 hub curios, disposal, consequences, and legacy-save preservation.
- **Broad validation:** Playwright completes 86 passed / 0 failed with zero console/page errors after replacing two timing-sensitive assertions with deterministic synchronization consistent with existing Phase-7 behavior.
- **Declared unverified:** live GitHub Pages delivery of this baseline and manual rendered composition of representative expansion rooms.
- **Next safe action:** verify Pages and visually inspect representative rooms from all four expansion regions before claiming expansion visual QA closure.

### Revision 13 — 2026-09-23

- **Artifact/source identity:** `bdb4e8109fede35e0ac634be3089035cd9d40253`
- **State delta:** Added a bounded adaptive-HUD system for phone portrait, phone landscape, tablet portrait, tablet landscape/small desktop, wide desktop, notched safe areas, hybrid touch devices and ultrawide monitors.
- **Layout behavior:** portrait phones use bottom-sheet controls/settings and thumb-zone navigation; short landscape moves the species selector to a vertical edge rail and compresses chrome; tablets and desktops use bounded side panes; photo, toast, arcade, lore and settings surfaces respect viewport and safe-area limits.
- **Preservation:** implementation changes are confined to `index.html` and `tools/verify_all_gameplay.js`; no runtime dependency, model, asset, gameplay, save, room, expansion or engine architecture changed.
- **Adversarial repair:** the new viewport matrix exposed hidden horizontal document overflow caused by the offscreen absolute control drawer. The drawer was corrected to viewport-fixed positioning. A second false failure came from sampling its CSS transition mid-flight; the harness now waits for settled drawer geometry rather than sleeping a fixed interval.
- **Focused validation:** all expansion and Phase-1–7 focused contracts pass.
- **Broad validation:** full Playwright journey plus five viewport classes completes 95 passed / 0 failed with zero console/page errors.
- **Declared unverified:** manual rendered visual QA of the new adaptive compositions and live GitHub Pages delivery.
- **Next safe action:** visually inspect representative phone/tablet/desktop captures and verify the public Pages route before promoting visual/delivery claims.

### Revision 14 — 2026-09-23

- **Artifact/source identity:** `ac53c13a15292a1ebf221060c6156804abc33c0f`
- **State delta:** Live GitHub Pages delivery promoted from unverified to verified.
- **Deployment evidence:** GitHub's Pages build/deploy workflow completed successfully for the current `main` commit.
- **Public-route evidence:** a separate GitHub Actions runner fetched `https://westkitty.github.io/eevee_lab/`, found the adaptive safe-area CSS in the served HTML, and successfully fetched the live `src/ui-controller.js` and `src/expansions/expansion-kit.js` assets.
- **Remaining unverified:** manual rendered visual QA of the adaptive viewport compositions and representative expansion-room composition.

