# Eevee Lab quality uplift assessment

**Assessment date:** 2026-09-26
**Comparison base:** `f606913a4bede2d90b9c6fb619e4f038cae29df4`
**Scope:** UI, WOW, Backend, Assets, and UX; existing static Three.js product and working capabilities preserved.

## Scoring and evidence rules

The 25 criteria below operationalize the requested five domains as five observable criteria per domain. Scores are integer, 0–4: **0** absent/known broken; **1** rudimentary or materially fragile; **2** implemented but partial or weakly evidenced; **3** coherent with meaningful focused evidence; **4** comprehensively verified and polished across target contexts. Confidence is separate from score:

- `VERIFIED` — directly exercised by a current automated contract or direct check.
- `STRONG_EVIDENCE` — implementation and focused evidence align, but some integration or target-runtime coverage is missing.
- `PARTIAL_EVIDENCE` — source/document evidence exists, with important user-path or visual uncertainty.
- `UNVERIFIED` — the relevant behavior has not been directly assessed in this run.

Browser-dependent UI/WOW behavior is not scored 4 without current browser/runtime evidence. “Backend” means the project’s local persistence, data, lifecycle, and validation infrastructure; this is a static browser app and no server/API was added or assumed.

## Before/after scorecard

| Domain | Criterion | Before | After | Δ | Evidence / basis |
|---|---|---:|---:|---:|---|
| **UI** | Character-first hierarchy | 2 · `PARTIAL_EVIDENCE` | 2 · `PARTIAL_EVIDENCE` | 0 | Existing creature-first layout and fade behavior are present in `index.html`; no current rendered inspection. |
| UI | Responsive viewport composition | 2 · `PARTIAL_EVIDENCE` | 2 · `PARTIAL_EVIDENCE` | 0 | Responsive/safe-area CSS is present. The prior operational record’s viewport result is historical and was not rerun against this checkout. |
| UI | Visual-system consistency | 2 · `PARTIAL_EVIDENCE` | 2 · `PARTIAL_EVIDENCE` | 0 | Shared styles and component patterns are source-visible; current visual consistency has not been inspected in a browser. |
| UI | Interaction feedback and state clarity | 2 · `PARTIAL_EVIDENCE` | 2 · `PARTIAL_EVIDENCE` | 0 | Labels, captions, pressed/selected states, and speech feedback exist; rendered behavior is unverified here. |
| UI | Overlay/dialog semantics | 2 · `PARTIAL_EVIDENCE` | 2 · `PARTIAL_EVIDENCE` | 0 | Dialog markup and ARIA state are present; focus behavior is scored separately under UX and has no browser run. |
| **WOW** | Creature characterization/expressiveness | 2 · `PARTIAL_EVIDENCE` | 2 · `PARTIAL_EVIDENCE` | 0 | Species behavior and animation systems are implemented and focused contracts pass; rendered motion/quality was not reviewed. |
| WOW | World breadth and coherence | 3 · `STRONG_EVIDENCE` | 3 · `STRONG_EVIDENCE` | 0 | `test_expansions.js` exercised 50 rooms, setpieces, curios, consequences, and disposal; this verifies logic/lifecycle, not visual composition. |
| WOW | Interaction depth | 3 · `STRONG_EVIDENCE` | 3 · `STRONG_EVIDENCE` | 0 | Interaction, actor, behavior, and room contracts passed; no current browser feel/usability assessment. |
| WOW | Discovery and progression | 3 · `STRONG_EVIDENCE` | 3 · `STRONG_EVIDENCE` | 0 | Habitat-state and experience-system focused contracts pass; no claim about live retention or player response. |
| WOW | Game-suite logic/variety | 3 · `VERIFIED` | 3 · `VERIFIED` | 0 | `test_mini_games.js` passed its 20-game contracts and Photo Safari capture-flow checks. Visual play remains browser-unverified. |
| **Backend** | Save schema and migration | 3 · `VERIFIED` | 3 · `VERIFIED` | 0 | `test_habitat_state.js` passed migration, nested defaults, export/import, and bounded album checks. |
| Backend | State ownership/resource lifecycle | 3 · `VERIFIED` | 3 · `VERIFIED` | 0 | Room/expansion contracts passed lifecycle, handoff, persistence, and disposal assertions. |
| Backend | Bounded data and retention | 3 · `VERIFIED` | 3 · `VERIFIED` | 0 | Focused contracts exercise capped album/room/game/journey state; no persistent event telemetry was added. |
| Backend | Import/export input safety | 2 · `STRONG_EVIDENCE` | 2 · `STRONG_EVIDENCE` | 0 | Valid round-trip and malformed top-level input are covered; storage-quota and future-schema recovery remain open. |
| Backend | Test-runner portability | 1 · `PARTIAL_EVIDENCE` | 2 · `STRONG_EVIDENCE` | **+1** | Removed host-specific Playwright module/Brave launch paths from the legacy smoke/evidence runners, shared a resolver, added `EEVEE_TEST_BASE_URL` to the focused browser tools, and made failures set a nonzero exit code. The broad verifier retains its platform-aware optional executable fallback. Resolver check passed; no Chromium launch was possible. |
| **Assets** | Provenance/licensing records | 3 · `PARTIAL_EVIDENCE` | 3 · `PARTIAL_EVIDENCE` | 0 | `THIRD_PARTY_ASSETS.md` records model authors, source IDs, and stated licenses; no external legal/provenance audit was performed. |
| Assets | Runtime model coverage/art fit | 2 · `UNVERIFIED` | 2 · `UNVERIFIED` | 0 | Nine species GLBs are present (6.377 MiB combined); character framing/material fit was not rendered or visually reviewed. |
| Assets | Payload/loading efficiency | 2 · `PARTIAL_EVIDENCE` | 2 · `PARTIAL_EVIDENCE` | 0 | Asset inventory: 64 files / 28.570 MiB total; no current network waterfall, GPU, or load-time measurement. |
| Assets | Generated-export safety | 1 · `STRONG_EVIDENCE` | 2 · `STRONG_EVIDENCE` | **+1** | `tools/test_export_one.py` now writes to ignored `qa/asset-tests/`; the existing tracked model binary is preserved. Python compilation and `.gitignore` resolution passed; Blender is unavailable, so export execution was not tested. |
| Assets | Procedural environment coverage | 3 · `STRONG_EVIDENCE` | 3 · `STRONG_EVIDENCE` | 0 | Room definitions and expansion/lifecycle contracts substantiate broad procedural coverage; visual polish remains unreviewed. |
| **UX** | Onboarding/help discoverability | 1 · `PARTIAL_EVIDENCE` | 2 · `PARTIAL_EVIDENCE` | **+1** | README now describes the 20-game Arcade, remappable shortcuts, current save coverage, architecture, and honest test requirements; in-app discoverability was not browser-tested. |
| UX | Navigation/task flow | 2 · `STRONG_EVIDENCE` | 2 · `STRONG_EVIDENCE` | 0 | World Map, guide, routines, favorites, and game flows are source-visible and experience contracts pass; live task completion is not verified. |
| UX | Keyboard focus and modal access | 1 · `PARTIAL_EVIDENCE` | 2 · `PARTIAL_EVIDENCE` | **+1** | Added Tab/Shift+Tab containment, focus restoration, dynamic-control focus, and single-active shortcut capture. New Node contracts pass; real browser/screen-reader integration is unverified. |
| UX | Feedback and recovery | 2 · `PARTIAL_EVIDENCE` | 2 · `PARTIAL_EVIDENCE` | 0 | Existing speech/caption feedback and import validation remain; no error-path browser audit was run. |
| UX | Player autonomy/personalization | 3 · `STRONG_EVIDENCE` | 3 · `STRONG_EVIDENCE` | 0 | Reduced motion, control scheme, density, settings, Chill Mode, favorites, and saved visits are implemented; focused experience tests pass. |

### Aggregate (unweighted)

| Domain | Before | After | Change |
|---|---:|---:|---:|
| UI | 10/20 | 10/20 | 0 |
| WOW | 13/20 | 13/20 | 0 |
| Backend | 12/20 | 13/20 | +1 |
| Assets | 11/20 | 12/20 | +1 |
| UX | 9/20 | 11/20 | +2 |
| **Total** | **55/100 (2.20/4 average)** | **59/100 (2.36/4 average)** | **+4/100** |

This is a modest, evidence-backed delta, not a feature/file-count score. No category score regressed. No score is 4; current browser and visual evidence are absent.

## Intervention ledger

| Intervention | Why it was chosen | Validation/evidence | Remaining uncertainty |
|---|---|---|---|
| Added reusable modal focus containment/restoration and single-active shortcut capture in `src/ui-controller.js`; connected settings and World Console; kept focus stable across Arcade actions and result/list transitions. | Existing dialogs only performed ad-hoc initial focus; they had no shared Tab containment/return-focus contract. Independent capture handlers could coexist. | New `tools/test_ui_controller.js` passes wrap, reverse-wrap, outside-focus, return-focus, single listener, conflict/invalid key, Escape cancel, and close-cancel contracts. Existing 20-game contract still passes. | No browser run: CSS visibility, actual focus order, screen-reader semantics, and full integration are not visually/runtime verified. |
| Repointed `tools/test_export_one.py` output to ignored `qa/asset-tests/umbreon_test.glb`. | The exporter targeted the tracked `assets/models/umbreon_test.glb`, risking accidental overwrite of a checked-in asset. | Existing model hashes remain unchanged; target resolves under `.gitignore`; Python compile passes. | Blender is not installed; export was not executed. |
| Made the Playwright smoke/evidence tools share `tools/playwright_support.js`; removed hardcoded macOS module/browser paths and support a configurable base URL. | The old tools hardcoded `/opt/homebrew` and a Brave app path, preventing use outside that machine. | All JS syntax checks pass; resolver was exercised using the cached Playwright package. | The required Chromium binary is missing, so these browser tools could not launch. |
| Brought `README.md` and operational-state metadata into line with current features and available evidence. | The README omitted current game/experience modules and overclaimed bundled-browser behavior; state metadata predated the checked-out source baseline. | Documentation and links were source-reviewed; browser limitations and historical evidence are explicitly separated. | Documentation usability itself was not user-tested. |

## Protected capability status

- **Preserved by scope:** Nine runtime creature models, existing model hashes, species switching, pet/feed/brush/toy interactions, Stone Dash, Photo Safari/game-suite contracts, room/expansion lifecycle, save schema, audio, and asset provenance files were not replaced or deleted.
- **Regression evidence:** All 12 pre-existing focused Node contracts and the new UI-controller contract pass after the edits; syntax checks pass. No test run in this report is a browser-runtime pass.
- **No new app runtime dependency, backend service, fake data/telemetry, Android/ADB work, or model binary change was introduced.** Playwright remains optional tooling already used by the repository’s tests.

## Ranked opportunity map

1. **Run current browser verification and add UI-specific assertions.** Restore a compatible Chromium/Playwright environment; run `tools/verify_all_gameplay.js`, capture the five viewport classes, and assert settings/World Console/Arcade focus entry, Tab wrap, Escape, shortcut capture, focus return, and no console/page errors. The historical 95/95 report is not a substitute for this run.
2. **Protect newer saves from older code.** `src/persistence.js` currently normalizes `state.version` to the current schema; design/test a non-destructive policy for future-version imports and locally stored saves before changing migration behavior.
3. **Inspect rendered models and measure loading.** Review all nine character models and representative rooms in a real browser, then measure startup network/load/GPU behavior before attempting compression or lazy-loading. Umbreon is the largest runtime model at about 2.09 MiB.
4. **Add a reproducible CI gate.** There are no workflow files in this checkout and no current-branch Actions runs. Once a browser runner is available, automate the focused contracts, syntax checks, and broad browser journey on the fixed branch’s PR path.
5. **Audit in-app help against the full experience.** README accuracy improved, but the in-app tour/help could still be checked for shortcuts, Arcade, saved visits, accessibility, and first-time mobile use.

## Validation and delivery record

- **Passed:** JavaScript syntax for `src/` and `tools/`; both inline scripts in `index.html`; Python tool compilation; `git diff --check`; 12 pre-existing focused Node contracts; the new modal/shortcut contract; Playwright module resolution.
- **Browser blocked:** `tools/verify_all_gameplay.js` fails before navigation because Playwright’s expected Chromium headless-shell executable is absent at `/home/user/.cache/ms-playwright/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell`. Earlier download attempts were blocked by `ECONNRESET`; no rendered inspection was completed.
- **Asset exporter blocked:** no Blender executable was found; only source-path/ignore-path and Python syntax checks were possible.
- **Historical results:** The older operational record attributes 95/95 browser checks and a Pages deployment to earlier commits. Those commits are unavailable in this shallow checkout, and those results were not rerun here.
- **Git/delivery:** Work is on `arena/01a0dee3-eevee-lab`, based on `f606913a4bede2d90b9c6fb619e4f038cae29df4`. No claim of deployment or live-site verification is made in this report.

## Verdict

The project already has unusually broad, coherent world/gameplay systems and strong focused logic contracts. This pass makes a small targeted uplift to modal/keyboard behavior, test portability, export safety, and user-facing documentation. It does **not** establish a browser-verified visual/accessibility or deployment uplift. The quality plateau for this environment is reached until Chromium and Blender-capable verification are available; further unmeasured visual/performance changes would add risk rather than defensible quality.
