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
| **UI** | Hierarchy & Composition | 2 · `PARTIAL_EVIDENCE` | 2 · `PARTIAL_EVIDENCE` | 0 | Creature-first composition and layered panels are source-visible; browser captures exist but were not reviewed for hierarchy or framing. |
| UI | Visual Cohesion | 2 · `PARTIAL_EVIDENCE` | 2 · `PARTIAL_EVIDENCE` | 0 | A shared warm visual language is present in `index.html`; captured screens were not visually reviewed for cohesion or polish. |
| UI | Readability & Density | 2 · `PARTIAL_EVIDENCE` | 2 · `PARTIAL_EVIDENCE` | 0 | Labels, panels, and density settings exist; responsive bounds were tested, but actual legibility and information load were not visually assessed. |
| UI | Responsive & Adaptive Behavior | 2 · `PARTIAL_EVIDENCE` | 3 · `VERIFIED` | **+1** | Hosted Chromium checks cover the visible room-toast bounds, closed/open drawer geometry, and expected bottom-sheet/side-pane behavior at five viewports. The final 390px portrait check measured the toast at 14–376px with zero document overflow. This is focused geometry coverage, not a full visual/accessibility review. |
| UI | Visible States & Feedback | 2 · `PARTIAL_EVIDENCE` | 3 · `VERIFIED` | **+1** | The real-browser future-save flow verifies the Settings notice is visible, exposes `role="status"` and `aria-live="polite"`, and names v5; screenshot appearance was not manually reviewed. |
| **WOW** | Project Identity & Distinctiveness | 3 · `STRONG_EVIDENCE` | 3 · `STRONG_EVIDENCE` | 0 | Eevee-specific habitat, forms, behaviors, and authored world systems distinguish the project; visual distinctiveness was not freshly reviewed. |
| WOW | Meaningful Reactivity | 3 · `STRONG_EVIDENCE` | 3 · `STRONG_EVIDENCE` | 0 | Creature/world/room systems have focused contracts; tests establish logic, not live feel. |
| WOW | Tactility & Immersion | 2 · `PARTIAL_EVIDENCE` | 2 · `PARTIAL_EVIDENCE` | 0 | Three.js motion, camera, interaction, and audio are implemented; the browser matrix passed, but no tactile-device or sound review was performed. |
| WOW | Surprise, Discovery & Intelligence | 3 · `STRONG_EVIDENCE` | 3 · `STRONG_EVIDENCE` | 0 | Discovery, memento, room-state, journey, and game logic have focused coverage; no user response/retention claim. |
| WOW | Authorial Finish | 2 · `PARTIAL_EVIDENCE` | 2 · `PARTIAL_EVIDENCE` | 0 | Breadth and authored systems are evidenced in source/tests, but final visual/audio finish was not reviewed. |
| **Backend** | Correctness & Integration | 3 · `VERIFIED` | 3 · `VERIFIED` | 0 | Focused state, manager, room, behavior, expansion, and game contracts passed before and after the changes. |
| Backend | Reliability & Recovery | 2 · `PARTIAL_EVIDENCE` | 3 · `VERIFIED` | **+1** | Unit contracts cover future-schema protection, compatible-backup recovery, import rollback, and failed-write export. Hosted browser testing exposed and verified a guard against an older tab's pagehide flush downgrading a newer stored save. |
| Backend | Performance & Lifecycle | 2 · `PARTIAL_EVIDENCE` | 2 · `PARTIAL_EVIDENCE` | 0 | Existing disposal/lifecycle contracts pass and saves now flush on hide, but no startup, frame-time, storage-cost, or network performance measurement was made. |
| Backend | Architecture & Maintainability | 2 · `PARTIAL_EVIDENCE` | 2 · `PARTIAL_EVIDENCE` | 0 | Focused source modules and tests coexist with substantial inline application code; this pass did not restructure the app. |
| Backend | Build, Security & Observability | 2 · `PARTIAL_EVIDENCE` | 3 · `VERIFIED` | **+1** | The least-privilege, SHA-pinned workflow validates syntax, focused contracts, Python, asset manifests, and the hosted Chromium matrix; run [36293159823](https://github.com/westkitty/eevee_lab/actions/runs/36293159823) passed both jobs on `ubuntu-24.04` and uploaded browser/runtime evidence. No app build or deployment is implied. |
| **Assets** | Completeness & Coverage | 3 · `STRONG_EVIDENCE` | 3 · `STRONG_EVIDENCE` | 0 | Nine runtime species GLBs and broad procedural-room coverage are source-visible; the expansion contract exercised 50 rooms and related systems. |
| Assets | Cohesion & Art Direction | 2 · `UNVERIFIED` | 2 · `UNVERIFIED` | 0 | Asset families/procedural art are present, but character framing, material match, and room composition were not visually inspected. |
| Assets | Technical Quality & Optimization | 2 · `PARTIAL_EVIDENCE` | 2 · `PARTIAL_EVIDENCE` | 0 | Inventory is 64 files / 28.570 MiB (nine runtime species GLBs total 6.377 MiB); no network waterfall, GPU, or load-time measurement. |
| Assets | Integration & Lifecycle | 2 · `PARTIAL_EVIDENCE` | 3 · `STRONG_EVIDENCE` | **+1** | The hosted browser run loaded all nine species GLBs and completed multi-angle runtime screenshot capture; screenshots were uploaded but not visually reviewed, so this supports integration rather than art-quality claims. |
| Assets | Reuse, Provenance & Accessibility | 3 · `PARTIAL_EVIDENCE` | 3 · `PARTIAL_EVIDENCE` | 0 | Third-party source/license records and rig/animation manifests exist; provenance was not externally audited and visual alternatives were not reviewed. |
| **UX** | Efficiency | 2 · `PARTIAL_EVIDENCE` | 2 · `PARTIAL_EVIDENCE` | 0 | Shortcuts, settings, map, and interaction routes exist; no observed task-time or user-path study. |
| UX | Discoverability | 2 · `PARTIAL_EVIDENCE` | 2 · `PARTIAL_EVIDENCE` | 0 | Tour/guide/map affordances are in source; first-run and recovery discoverability were not browser/user tested. |
| UX | Feedback & Recovery | 2 · `PARTIAL_EVIDENCE` | 3 · `VERIFIED` | **+1** | The real-browser future-save path confirms the persistent Settings notice is visible and announced as a status; focused contracts cover storage-failure recovery and compatible import. Screenshot styling and assistive-technology speech were not reviewed. |
| UX | Accessibility & Inclusivity | 2 · `PARTIAL_EVIDENCE` | 2 · `STRONG_EVIDENCE` | 0 | Chromium verifies focus entry, forward/reverse wrapping, outside-focus recovery, Escape close, and return focus; Playwright also resolves the visually hidden save-import input by its associated label. Screen-reader, contrast, and broader assistive-technology review remain open, so the score stays conservative. |
| UX | Predictability & Persistence | 3 · `STRONG_EVIDENCE` | 3 · `VERIFIED` | 0 | Browser and unit tests verify future-save protection, no stale-tab/pagehide downgrade, compatible import, storage-failure rollback, and hide flushing. |

### Aggregate (unweighted)

| Domain | Before | After | Change |
|---|---:|---:|---:|
| UI | 10/20 | 12/20 | +2 |
| WOW | 13/20 | 13/20 | 0 |
| Backend | 11/20 | 13/20 | +2 |
| Assets | 12/20 | 13/20 | +1 |
| UX | 11/20 | 12/20 | +1 |
| **Total** | **57/100** | **63/100** | **+6/100** |

No 4s were awarded. The hosted browser matrix supports focused gains for responsive behavior, save-state feedback, and asset loading integration; no score was raised for unobserved visual cohesion, readability, or art quality. **The requested 15/20 category aim is not met** (all domains remain below 15), so this report does not claim the quality gate is fully satisfied. Manual visual review and broader accessibility/performance evidence remain the main blockers.

## Interventions

1. **Protect saves and preserve recovery options.** `src/persistence.js` detects a newer stored schema and stays read-only rather than normalizing/writing over it. A hosted browser run exposed that an already-open older tab could overwrite such a save during `pagehide`; `flush()` now re-reads the stored version before writing, and a focused contract confirms the newer bytes survive. An explicit compatible-backup import may replace the future save and restores writable mode; failed import writes roll back. Writable saves still support recovery export after storage failures, and `index.html` keeps a persistent `role="status"` Settings notice synchronized.
2. **Flush debounced saves when leaving or backgrounding.** `SaveManager` flushes on `pagehide`; the existing `visibilitychange` handler also flushes when hidden. The new version re-check at each flush prevents the 250 ms lifecycle flush from silently downgrading a newer save.
3. **Contain modal focus at document scope.** `ModalFocusManager` now observes Tab at document capture (with a root-level fallback for limited event targets), so focus moved outside the dialog is redirected as well as normal forward/reverse wrap. It removes the exact listener on close.
4. **Make core verification repeatable in CI.** `.github/workflows/quality.yml` runs the project's 13 dependency-free Node contracts, source/inline syntax checks, Python compilation, asset-manifest contract, and a separate pinned Playwright/Chromium gameplay/responsive job. Its official actions are pinned to full commit SHAs, the runner is pinned to `ubuntu-24.04`, and the workflow grants only `contents: read`. Run [36293159823](https://github.com/westkitty/eevee_lab/actions/runs/36293159823) passed both jobs; automation does not replace manual visual or assistive-technology review.
5. **Name the save-import control.** A static control audit found the visually hidden file input lacked an accessible name. It now has an associated visually hidden `<label>`, and a browser contract verifies it is discoverable through Playwright's label locator without changing the visible import flow.
6. **Keep room feedback centered on small screens.** The room toast was already inside a centered HUD container but applied a second `translateX(-50%)`, shifting it offscreen. The duplicate translation was removed, and the responsive matrix now checks the visible toast bounds at each viewport.

These interventions were selected for data-loss risk, keyboard containment, and repeatable verification—not feature or file counts. No new application runtime dependency, service, fake telemetry, model asset, or unrelated gameplay change was introduced.

## Protected capability status

The patch does not replace or delete existing models, rooms, game content, audio, interactions, or save fields. Existing nine runtime species, 20-game suite, Photo Safari, world/room systems, and expansion content remain in place. Compatible save import continues to round-trip; an older open tab now detects and preserves a newer stored save even during a pagehide flush, until the user explicitly imports a compatible backup. The exact unavailable list of prior non-game suggestions is not reconstructed or claimed item-by-item.

## Validation record

- **Passed after edits:** JavaScript syntax checks for every `src/` and `tools/` `.js` file and both inline `index.html` scripts; all 13 focused Node contracts, including future-schema preservation, failed-write rollback, volatile backup export, pagehide flushing, and document-level focus containment; `python3 -m py_compile tools/*.py`; the asset manifest validator; and `git diff --check`. The Chromium suite also resolves the hidden save-import field through its associated label.
- **Asset contract:** The manifest/animation-contract validator passed. Asset inventory was measured from repository files; it is not a performance measurement.
- **Python/exporter:** Tool compilation passed. Export execution was not attempted because Blender is unavailable.
- **Browser:** Hosted GitHub Actions run [36293159823](https://github.com/westkitty/eevee_lab/actions/runs/36293159823) passed both the focused contracts and Chromium gameplay/responsive jobs on commit `da6648c`. The browser verifier exited 0, covering nine species GLBs, Settings keyboard focus, future-save protection/recovery, the labeled save-import input, and five responsive viewports with the room toast deliberately visible and in bounds; the separate nine-species, three-angle screenshot capture and artifact upload also completed. CI measured the 390px portrait toast at 14–376px with zero document overflow after breakpoint transitions settled. The artifact (including `qa/results.json`) was not downloaded into this workspace and screenshots were not visually reviewed; a download attempt for run 36290002768 failed with EOF from Azure Blob Storage, so no retry was made. Local Chromium/Playwright remains unavailable. No screen-reader/assistive-technology audit is claimed.
- **Failure learning:** Run [36288493165](https://github.com/westkitty/eevee_lab/actions/runs/36288493165) timed out waiting for a future save to enter read-only mode after reload; inspection traced it to the old tab's pagehide flush overwriting the injected v5 bytes. Run [36288851301](https://github.com/westkitty/eevee_lab/actions/runs/36288851301) identified a stale assertion expecting schema v3; it was corrected to v4. Run [36289715273](https://github.com/westkitty/eevee_lab/actions/runs/36289715273) caught the HTTP-server startup race; CI now waits for `/index.html`. Responsive run [36291178265](https://github.com/westkitty/eevee_lab/actions/runs/36291178265) measured 2px document overflow at 390px. Diagnostics showed the room toast was being shifted left twice by `translateX(-50%)` despite its centered parent; the duplicate transform was removed. Run [36292106774](https://github.com/westkitty/eevee_lab/actions/runs/36292106774) then showed the test was measuring the toast during its hidden entrance offset, so the matrix now measures the visible toast. Run [36292882674](https://github.com/westkitty/eevee_lab/actions/runs/36292882674) caught the settings sheet mid-transition when switching from desktop to phone; the stable-layout wait was increased to 400ms. Final run [36293159823](https://github.com/westkitty/eevee_lab/actions/runs/36293159823) passed with zero document overflow at 390px and the toast inside its bounds.
- **Build/CI:** No app build configuration exists in the inspected tree. The pinned, least-privilege workflow passed both its non-browser and hosted browser jobs in run [36293159823](https://github.com/westkitty/eevee_lab/actions/runs/36293159823) on `ubuntu-24.04`. This is not deployment or live-site verification.

## Delivery and Git state

The changes and this report are committed on `arena/01a0dee3-eevee-lab`, which tracks the same branch on `origin`; the working tree is clean at handoff. No pull request, deployment, or live-site verification is claimed.

## Remaining high-value work, ranked

1. Manually inspect the uploaded browser/runtime screenshots and rendered states across the tested viewports; the automated geometry/focus checks passed, but the image artifact was not reviewed here.
2. Review the nine runtime models and representative procedural rooms visually, and measure network, load, and GPU costs before changing asset formats or loading strategy. Preserve the unused tracked test GLB unless a separate authorized cleanup is justified.
3. Conduct a broader accessibility check (contrast, screen-reader announcements, reduced-motion and input-device behavior) beyond the verified modal keyboard path and labeled save-import control.
4. Reassess all 25 scores after those remaining runtime/visual checks; keep the current below-target category verdict until the 15/20 aim is defensibly met.

## Verdict

This patch improves save safety/recovery—including protection against stale-tab downgrades—modal keyboard containment, labels the save-import input, corrects offscreen room-toast positioning, and adds repeatable non-browser plus hosted Chromium verification. It preserves the existing product and demonstrates a **+6/100** exact-rubric delta from the recorded baseline. The gameplay/responsive browser job and runtime capture passed, but screenshots were not manually inspected. It is **not a complete quality-gate pass**: all domains remain below the 15/20 aim, and visual/art quality, broad accessibility, performance, and deployment are not established by this CI result.
