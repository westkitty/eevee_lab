# Operational State: Eevee Lab

<!-- operational-state:metadata
{
  "schema_version": 1,
  "project_id": "eevee-lab",
  "project_name": "Eevee Lab",
  "project_root": "/",
  "artifact_path": "index.html",
  "state_revision": 5,
  "last_updated": "2026-09-22",
  "current_baseline": {
    "identity": "f0ceaa8340cae57bd4364f0dd835016f18f8997d",
    "state": "phase3-implemented",
    "last_verified": "source-scope-and-phase3-structure"
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

- **Primary artifact:** `f0ceaa8340cae57bd4364f0dd835016f18f8997d`
- **Protected pre-Phase-0 runtime baseline:** `661a37bc7f86e5ff2b7da28d02e8c44ad696e007`.
- **Protected pre-Phase-1 implementation baseline:** `0e31de1b392bb6cab1895818047ad45982a87a08`.
- **Protected pre-Phase-2 implementation baseline:** `0c8f9adc9f251c044f4cb290cc6c6ec2f110c8cc`.
- **Protected pre-Phase-3 implementation baseline:** `39dfb95e65f0391722f0e40ce39916b7dcb615bd`.
- **Baseline state:** Phase 3 Personality, Memory and Relationship is committed. Source scope, bounded persistence, and behavior ownership are verified; browser/runtime behavior remains unverified in the current execution environment.
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

## 8. Unknown or Evidence-Stale State

- **UNK-001:** Current live browser/GitHub Pages behavior is not reverified in this state record.
- **UNK-002:** Semantic meanings of the seven opaque primary-pack animation clips remain intentionally unclassified pending visual playback evidence.

## 9. Pending Work

- **PND-001:** In the first normal checkout, regenerate `assets/models/rig-manifest.json` so Umbreon's deep binary inventory replaces the partial evidence entry.
- **PND-002:** Run `node tools/test_creature_actor.js`.
- **PND-003:** Run `node tools/test_interaction_system.js`.
- **PND-004:** Run `tools/verify_all_gameplay.js` in a browser-capable checkout and promote Phase-1/2 runtime behavior only if it passes.
- **PND-005:** Visually classify any embedded animation clip before mapping it to a semantic slot.
- **PND-006:** Full limb IK remains deferred until rig-specific foot-chain behavior is visually proven; Phase 2 uses root-ground projection only.
- **PND-007:** Run `node tools/test_creature_behavior.js`.
- **PND-008:** Phase 4 Multi-Creature Habitat must not begin until the current actor/interaction/behavior ownership contracts are preserved and the first browser-capable regression run is obtained when possible.

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

## 12. Current Change Scope and Impact Radius

- **Allowed Phase-3 changes:** bounded creature memory, needs/opportunity state, behavior scheduler, external actor behavior poses, familiarity-sensitive response wiring, rare/bond/sleep events, focused tests, Phase-3 report, operational state.
- **Protected and unchanged:** model binaries, Three.js version, save version, one-heavy-room lifecycle, camera subsystem, procedural audio architecture, photo storage, direct interaction ownership, Stone Dash rules.
- **Potentially affected behavior:** idle/autonomous cadence, call response, pet/brush/toy/feed memory, sleep/wake behavior, rare spontaneous moments, bonded initiative.
- **Mandatory checks:** BondTracker remains sole familiarity score; no unbounded history; no neglect decay; scheduler never mutates scene objects; actor remains transform authority; sleep wakes on interaction/special action; rare events expire.
- **Unavailable proof:** committed Node/Playwright execution in this environment.
- **Repair class:** bounded feature implementation.

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
