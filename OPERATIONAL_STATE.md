# Operational State: Eevee Lab

<!-- operational-state:metadata
{
  "schema_version": 1,
  "project_id": "eevee-lab",
  "project_name": "Eevee Lab",
  "project_root": "/",
  "artifact_path": "index.html",
  "state_revision": 1,
  "last_updated": "2026-09-21",
  "current_baseline": {
    "identity": "661a37bc7f86e5ff2b7da28d02e8c44ad696e007",
    "state": "current-baseline",
    "last_verified": null
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

- **Primary artifact:** `661a37bc7f86e5ff2b7da28d02e8c44ad696e007`
- **Baseline state:** current-baseline; not promoted to verified in this state file because the runtime regression suite has not yet been rerun in the current execution environment.
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

No behavior is newly marked verified by this initialization alone.

## 6. Known Not Working

No confirmed baseline failure is recorded at initialization.

## 7. Implemented but Unverified

- **UNV-001:** `tools/verify_all_gameplay.js` exists and encodes the current broad regression path, but it has not yet been executed in the current Phase-0 environment.
- **UNV-002:** The README describes nine habitat rooms, camera presets, discoveries/bond, photo scoring, Chill Mode, persistence, accessibility settings, and Stone Dash; these remain source-backed but are not newly runtime-verified here.

## 8. Unknown or Evidence-Stale State

- **UNK-001:** Current live browser/GitHub Pages behavior is not reverified in this state record.
- **UNK-002:** Runtime semantic usefulness of the animation clips embedded in the character GLBs has not yet been classified.

## 9. Pending Work

- **PND-001:** Phase 0 — inventory every character rig and embedded animation capability.
- **PND-002:** Phase 0 — establish a semantic animation contract without guessing clip meanings.
- **PND-003:** Phase 0 — freeze the Three.js version decision behind an explicit migration gate.
- **PND-004:** Phase 0 — rerun available regression checks or record precise unavailable proof.

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
| VAL-003 | Runtime user journey passes | unknown | Not executed in current environment | Browser/Playwright regression suite | 661a37b | — | Phase-0 completion |

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
