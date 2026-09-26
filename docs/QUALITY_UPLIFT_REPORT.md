# Eevee Lab quality-uplift assessment

**Assessment date:** 2026-09-26
**Rubric:** The 25 requested dimensions, using the names supplied in the task.
**Baseline:** `2c7d83ad35bbb84fb1f06eeda6cfa011c794ed22` (`origin/arena/01a0dee3-eevee-lab`). Before edits, the working files were verified to match this tree; the earlier local-HEAD mismatch was reconciled without replacing working-tree files.
**Scope:** Existing static Three.js product; no new app dependency, service, placeholder, synthetic telemetry, or feature-count target.

## Scoring and evidence rules

Scores are integers from 0–4: **0** absent/known broken; **1** rudimentary or materially fragile; **2** implemented but partial or weakly evidenced; **3** coherent with meaningful focused evidence; **4** comprehensively verified and polished across target contexts. Confidence describes the evidence, not the score:

- `VERIFIED` — directly exercised by a current automated contract or direct check.
- `STRONG_EVIDENCE` — implementation and focused evidence align, but integration or target-runtime coverage is incomplete.
- `PARTIAL_EVIDENCE` — source/document evidence exists, with important runtime, visual, or user-path uncertainty.
- `UNVERIFIED` — the relevant behavior has not been directly assessed in this run.

A browser-dependent visual/runtime claim is not upgraded on source inspection alone. This is a static browser app: **Backend** covers local persistence, state, integration, lifecycle, and validation; no server/API is implied. The scores below are a fresh exact-rubric comparison against the effective pre-edit tree, not a carry-forward of the prior report's renamed dimensions.

## Exact 25-dimension scorecard

| Domain | Dimension | Before | After | Δ | Evidence and rationale |
|---|---|---:|---:|---:|---|
| **UI** | Hierarchy & Composition | 2 · `PARTIAL_EVIDENCE` | 2 · `PARTIAL_EVIDENCE` | 0 | Creature-first composition and layered panels are source-visible; no current rendered review or viewport capture. |
| UI | Visual Cohesion | 2 · `PARTIAL_EVIDENCE` | 2 · `PARTIAL_EVIDENCE` | 0 | A shared warm visual language is present in `index.html`; cohesion and polish cannot be confirmed without a browser. |
| UI | Readability & Density | 2 · `PARTIAL_EVIDENCE` | 2 · `PARTIAL_EVIDENCE` | 0 | Labels, panels, and density settings exist; actual legibility and information load were not observed at runtime. |
| UI | Responsive & Adaptive Behavior | 2 · `PARTIAL_EVIDENCE` | 2 · `PARTIAL_EVIDENCE` | 0 | Responsive/safe-area rules and input modes are present; no current multi-viewport run was possible. |
| UI | Visible States & Feedback | 2 · `PARTIAL_EVIDENCE` | 2 · `PARTIAL_EVIDENCE` | 0 | A persistent, live save-compatibility notice was added in Settings, but its rendered visibility/announcement is not browser-verified. |
| **WOW** | Project Identity & Distinctiveness | 3 · `STRONG_EVIDENCE` | 3 · `STRONG_EVIDENCE` | 0 | Eevee-specific habitat, forms, behaviors, and authored world systems distinguish the project; visual distinctiveness was not freshly reviewed. |
| WOW | Meaningful Reactivity | 3 · `STRONG_EVIDENCE` | 3 · `STRONG_EVIDENCE` | 0 | Creature/world/room systems have focused contracts; tests establish logic, not live feel. |
| WOW | Tactility & Immersion | 2 · `PARTIAL_EVIDENCE` | 2 · `PARTIAL_EVIDENCE` | 0 | Three.js motion, camera, interaction, and audio are implemented; no current browser, input-device, or sound review. |
| WOW | Surprise, Discovery & Intelligence | 3 · `STRONG_EVIDENCE` | 3 · `STRONG_EVIDENCE` | 0 | Discovery, memento, room-state, journey, and game logic have focused coverage; no user response/retention claim. |
| WOW | Authorial Finish | 2 · `PARTIAL_EVIDENCE` | 2 · `PARTIAL_EVIDENCE` | 0 | Breadth and authored systems are evidenced in source/tests, but final visual/audio finish was not reviewed. |
| **Backend** | Correctness & Integration | 3 · `VERIFIED` | 3 · `VERIFIED` | 0 | Focused state, manager, room, behavior, expansion, and game contracts passed before and after the changes. |
| Backend | Reliability & Recovery | 2 · `PARTIAL_EVIDENCE` | 3 · `STRONG_EVIDENCE` | **+1** | Added future-schema read-only protection, compatible-backup recovery, import rollback when storage fails, and pagehide flushing; new fake-storage contracts pass. |
| Backend | Performance & Lifecycle | 2 · `PARTIAL_EVIDENCE` | 2 · `PARTIAL_EVIDENCE` | 0 | Existing disposal/lifecycle contracts pass and saves now flush on hide, but no startup, frame-time, storage-cost, or network performance measurement was made. |
| Backend | Architecture & Maintainability | 2 · `PARTIAL_EVIDENCE` | 2 · `PARTIAL_EVIDENCE` | 0 | Focused source modules and tests coexist with substantial inline application code; this pass did not restructure the app. |
| Backend | Build, Security & Observability | 2 · `PARTIAL_EVIDENCE` | 2 · `PARTIAL_EVIDENCE` | 0 | Import size/form/version validation and focused test tools exist; there is no discovered CI workflow or browser-runner evidence for this checkout. |
| **Assets** | Completeness & Coverage | 3 · `STRONG_EVIDENCE` | 3 · `STRONG_EVIDENCE` | 0 | Nine runtime species GLBs and broad procedural-room coverage are source-visible; the expansion contract exercised 50 rooms and related systems. |
| Assets | Cohesion & Art Direction | 2 · `UNVERIFIED` | 2 · `UNVERIFIED` | 0 | Asset families/procedural art are present, but character framing, material match, and room composition were not visually inspected. |
| Assets | Technical Quality & Optimization | 2 · `PARTIAL_EVIDENCE` | 2 · `PARTIAL_EVIDENCE` | 0 | Inventory is 64 files / 28.570 MiB (nine runtime species GLBs total 6.377 MiB); no network waterfall, GPU, or load-time measurement. |
| Assets | Integration & Lifecycle | 2 · `PARTIAL_EVIDENCE` | 2 · `PARTIAL_EVIDENCE` | 0 | Loader and procedural-room integration are in source and room disposal contracts pass; no GLB browser-load/render pass was available. |
| Assets | Reuse, Provenance & Accessibility | 3 · `PARTIAL_EVIDENCE` | 3 · `PARTIAL_EVIDENCE` | 0 | Third-party source/license records and rig/animation manifests exist; provenance was not externally audited and visual alternatives were not reviewed. |
| **UX** | Efficiency | 2 · `PARTIAL_EVIDENCE` | 2 · `PARTIAL_EVIDENCE` | 0 | Shortcuts, settings, map, and interaction routes exist; no observed task-time or user-path study. |
| UX | Discoverability | 2 · `PARTIAL_EVIDENCE` | 2 · `PARTIAL_EVIDENCE` | 0 | Tour/guide/map affordances are in source; first-run and recovery discoverability were not browser/user tested. |
| UX | Feedback & Recovery | 2 · `PARTIAL_EVIDENCE` | 3 · `STRONG_EVIDENCE` | **+1** | Newer saves now get a startup notice and persistent accessible Settings status; export/import errors are surfaced, and save-recovery contracts pass. UI presentation remains unverified. |
| UX | Accessibility & Inclusivity | 2 · `PARTIAL_EVIDENCE` | 2 · `PARTIAL_EVIDENCE` | 0 | Modal Tab/Shift+Tab containment now listens at document capture and is directly contract-tested, including focus outside the modal; no real browser/AT audit. |
| UX | Predictability & Persistence | 3 · `STRONG_EVIDENCE` | 3 · `STRONG_EVIDENCE` | 0 | Versioned local save/migration remains; tests now verify non-destructive handling of future saves, compatible import, storage-failure rollback, and hide flush. |

### Aggregate (unweighted)

| Domain | Before | After | Change |
|---|---:|---:|---:|
| UI | 10/20 | 10/20 | 0 |
| WOW | 13/20 | 13/20 | 0 |
| Backend | 11/20 | 12/20 | +1 |
| Assets | 12/20 | 12/20 | 0 |
| UX | 11/20 | 12/20 | +1 |
| **Total** | **57/100** | **59/100** | **+2/100** |

No 4s were awarded. The uplift is narrow and risk-focused; no score was raised for unobserved visual quality. **The requested 15/20 category aim is not met** (all domains remain below 15), so this report does not claim the quality gate is fully satisfied. A real browser/runtime and visual assessment is the main blocker to defensible UI/WOW/asset gains.

## Interventions

1. **Protect saves across schema upgrades.** `src/persistence.js` now detects a stored schema newer than this app and stays read-only rather than normalizing/writing over it. Export is blocked in that state; a compatible import restores writable mode. A failed import write rolls back in-memory state and reports that the stored save was left unchanged. `index.html` provides a startup cue and a persistent `role="status"` Settings notice with the recovery action.
2. **Flush debounced saves when leaving or backgrounding.** `SaveManager` flushes on `pagehide`; the existing `visibilitychange` handler also flushes when hidden. This closes the 250 ms debounce loss window at those lifecycle boundaries.
3. **Contain modal focus at document scope.** `ModalFocusManager` now observes Tab at document capture (with a root-level fallback for limited event targets), so focus moved outside the dialog is redirected as well as normal forward/reverse wrap. It removes the exact listener on close.

These interventions were selected for data-loss risk and keyboard containment, not feature or file counts. No new dependency, service, fake telemetry, model asset, or unrelated gameplay change was introduced.

## Protected capability status

The patch does not replace or delete existing models, rooms, game content, audio, interactions, or save fields. Existing nine runtime species, 20-game suite, Photo Safari, world/room systems, and expansion content remain in place. Compatible save import continues to round-trip; the new future-version path preserves the stored bytes until the user imports a compatible backup. The exact unavailable list of prior non-game suggestions is not reconstructed or claimed item-by-item.

## Validation record

- **Passed after edits:** JavaScript syntax checks for every `src/` and `tools/` `.js` file and both inline `index.html` scripts; all 13 focused Node contracts; `python3 -m py_compile tools/*.py`; `python3 tools/validate_phase0.py assets/models/rig-manifest.json assets/models/animation-contract.json`; and `git diff --check`.
- **Asset contract:** The manifest/animation-contract validator passed. Asset inventory was measured from repository files; it is not a performance measurement.
- **Python/exporter:** Tool compilation passed. Export execution was not attempted because Blender is unavailable.
- **Browser:** no Chromium/Chrome executable or cached Playwright browser is available. No screenshot, real focus/AT audit, gameplay browser run, or responsive visual assessment is claimed. Earlier Chromium download attempts failed with `ECONNRESET`; no retry was made.
- **Build/CI:** no app build configuration or `.github/workflows` file was found in the inspected checkout; no build, CI, or deployment result is claimed.

## Remaining high-value work, ranked

1. Obtain a compatible browser and run the full gameplay journey plus a five-viewport visual/focus audit; verify the new save status presentation and page lifecycle in a real browser.
2. Inspect the nine runtime models and representative procedural rooms at runtime; measure network, load, and GPU costs before changing asset formats or loading strategy. Preserve the unused tracked test GLB unless a separate authorized cleanup is justified.
3. Add a reproducible CI gate only after selecting a supported browser runner and a project-appropriate command set; do not treat syntax/unit-only CI as browser assurance.
4. Reassess all 25 scores after runtime evidence; keep the current below-target category verdict until a defensible uplift is demonstrated.

## Verdict

This patch improves save safety/recovery and modal keyboard containment with direct contracts and no new runtime dependency. It preserves the existing product and demonstrates a **+2/100** exact-rubric delta. It is **not a complete quality-gate pass**: UI/WOW/asset presentation remains unverified, and every domain is below the 15/20 aim. Do not infer deployment or broad visual polish from these code/test changes.
