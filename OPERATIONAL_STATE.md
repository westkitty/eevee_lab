# Operational State: Eevee Lab

<!-- operational-state:metadata
{
  "schema_version": 1,
  "project_id": "eevee-lab",
  "project_name": "Eevee Lab",
  "project_root": "/",
  "artifact_path": "index.html",
  "state_revision": 2,
  "last_updated": "2026-09-21",
  "current_baseline": {
    "identity": "61cea6790453367526b6f19cc25d3d68662477e7",
    "state": "phase0-implemented",
    "last_verified": "source-scope-and-phase0-tooling"
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

- **Primary artifact:** `61cea6790453367526b6f19cc25d3d68662477e7`
- **Protected pre-Phase-0 runtime baseline:** `661a37bc7f86e5ff2b7da28d02e8c44ad696e007`.
- **Baseline state:** Phase-0 implementation committed. Source-scope preservation and Phase-0 tooling are verified; broad browser/runtime parity remains unverified in the current execution environment.
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

## 6. Known Not Working

No confirmed baseline failure is recorded at initialization.

## 7. Implemented but Unverified

- **UNV-001:** `tools/verify_all_gameplay.js` exists and encodes the current broad regression path, but it could not be executed in the current Phase-0 environment because the working container cannot clone/fetch the repository binary payloads and the authorized desktop device is offline.
- **UNV-002:** The README-described runtime behavior remains source-backed but is not newly browser-verified in this execution environment.
- **UNV-003:** Umbreon's 2,192,044-byte GLB exceeds the current connector's inline binary contents limit. Its repository identity, source armature, runtime normalization, and runtime bone/material lookup behavior are recorded, but its complete raw joint/clip/material inventory must be regenerated by `tools/inspect_glb_manifest.py` in a normal checkout.

## 8. Unknown or Evidence-Stale State

- **UNK-001:** Current live browser/GitHub Pages behavior is not reverified in this state record.
- **UNK-002:** Semantic meanings of the seven opaque primary-pack animation clips remain intentionally unclassified pending visual playback evidence.

## 9. Pending Work

- **PND-001:** Before or during the first normal-checkout Phase-1 session, regenerate `assets/models/rig-manifest.json` locally so Umbreon's deep binary inventory replaces the partial evidence entry.
- **PND-002:** Run `tools/verify_all_gameplay.js` in a browser-capable checkout and promote runtime parity only if it passes.
- **PND-003:** Visually classify any embedded animation clip before mapping it to a semantic slot.
- **PND-004:** Phase 1 may begin using the committed rig/animation contracts; preserve all active invariants.

## 10. Active Decisions, Defaults, and Prohibitions

- **DEC-001:** Phase 0 may add inspection tooling, manifests, state/governance records, and validation only; it must not add Phase-1 creature behavior.
- **DEC-002:** Do not replace or regenerate runtime character assets during Phase 0.
- **DEC-003:** Do not upgrade Three.js during Phase 0 merely for modernity.
- **DEC-004:** Unknown clip names must remain unclassified until visual/runtime evidence supports a semantic label.

## 11. Validation and Evidence Matrix

| ID | Claim or behavior | State | Evidence | Validation method | Artifact/revision | Last checked | Recheck trigger |
|---|---|---|---|---|---|---|---|
| VAL-001 | Baseline source architecture exists as documented | observed-source | README, index.html, src/, libs/, tools/ | Repository inspection | 661a37b | 2026-09-21 | architecture change |
| VAL-002 | Broad regression harness exists | observed-source | tools/verify_all_gameplay.js | Source inspection | 661a37b | 2026-09-21 | test rewrite |
| VAL-003 | Runtime user journey passes | unverified | Not executable in current environment; no runtime file changed by Phase 0 | Browser/Playwright regression suite | 61cea67 | — | next browser-capable checkout |
| VAL-004 | Phase-0 change scope is additive only | verified | GitHub compare 661a37b...61cea67: seven files added, zero existing files modified/deleted | GitHub compare | 61cea67 | 2026-09-21 | any Phase-0 repair |
| VAL-005 | Rig manifest/contract schemas are internally valid | verified | py_compile + synthetic-fixture schema test + role-pattern regression PASS | Local container tests | 61cea67 | 2026-09-21 | tooling/schema change |

## 12. Current Change Scope and Impact Radius

- **Allowed to change:** Operational state, rig/animation inspection tooling, generated rig manifest, semantic animation contract, Three.js migration-gate documentation, focused Phase-0 validation.
- **Must remain unchanged:** Runtime behavior, model binaries, current room/gameplay/camera/audio/save architecture, dependency set.
- **Potentially affected behavior:** None intended; Phase 0 is inspection/governance only.
- **Mandatory checks:** Manifest covers all nine species; semantic slots are complete; no unsupported clip labels; Three.js decision is explicit; baseline source/runtime regression is rerun if executable.
- **Checks deliberately reused:** Existing Playwright regression suite remains the authoritative broad behavior check.
- **Repair class:** Bounded preparatory implementation.

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
