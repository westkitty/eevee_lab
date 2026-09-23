# 🌟 Eevee's Silly Evolution Disco & Arcade — The Habitat House 🌟

A quiet, explorable 3D habitat for Eevee and all nine Eeveelutions, built on Three.js. The
Pokémon is the interface's primary subject — the UI hugs the edges, fades when idle, and
gets out of the way so the creature gets the screen.

Nine real, sourced 3D Eeveelution models (see [`THIRD_PARTY_ASSETS.md`](THIRD_PARTY_ASSETS.md)
for provenance and licensing) live inside a central **Conservatory** hub connected to nine
habitat rooms, one per form, each with its own geometry, lighting, atmosphere, native
interaction, and small environmental story. The original petting/toybox sandbox and the
**Stone Dash** arcade runner both survive intact inside this new shell.

---

## Running locally

No build step, no dependencies to install. Serve the folder statically and open it:

```bash
cd EEvEE_Lab
python3 -m http.server 8099
```

Then open `http://localhost:8099/`. Opening `index.html` directly by double-click also
works, though `GLTFLoader` fetches (the nine `.glb` models) require `file://` to be
permitted by your browser — a local server is more reliable.

---

## The Habitat House

- **The Conservatory of Possibilities** — the central hub. Click a glowing doorway (or use
  the **Habitats** list in the control drawer) to travel to a room.
- **Nine habitat rooms**, one per Eeveelution: Eevee's Den, Vaporeon's Tideglass Grotto,
  Jolteon's Storm Relay, Flareon's Ember Den, Espeon's Hourglass Observatory, Umbreon's Moon
  Garden, Leafeon's Overgrown Glasshouse, Glaceon's Frost Gallery, Sylveon's Ribbon Hall.
- Any Eeveelution can visit any room — the room's own form just gets extra native reactions
  (splashing in Vaporeon's pool, charging the Jolteon relay, and so on).
- Only the active room's geometry, lights and particles exist in the scene at a time; the
  previous room is fully disposed on transition (no leaks from repeated switching).
- Click room props (the hearth, the relay core, evolution stones, mementos…) directly —
  most interactions are diegetic, not menu-driven.
- Each room remembers small, bounded state between visits (a lamp stays charged, a plant
  stays grown) and unlocks a second atmosphere variant (Settings drawer → Atmosphere) once
  you've discovered something there.

## Expeditions — four expansion regions

Beyond the nine original habitats, the Conservatory now has four **expedition gates** (the
smaller inner-ring doors), each leading to a whole new region with its own hub and nine more
habitats — one per Eeveelution, each with its own environment, weather, and native setpiece:

| Region | Hub | Flavour |
|---|---|---|
| ⛵ **Tidewild Coast** | Driftwood Harbor | Tide pools, a lighthouse, a sea cave, an iceberg, a ribbon-rigged shipwreck |
| ⛰ **Emberpeak Ruins** | The Pilgrim's Stair | Hot springs, a caldera, a fallen sky-temple, a lantern monastery, a glacier pass |
| 🌃 **Neon Undercity** | Lantern Alley Junction | An arcade, an aquarium bar, a substation rooftop, a subway platform, a karaoke loft |
| 🌙 **Starfall Dreamway** | The Pillow Nebula | A sea of glass, a static meadow, a comet garden, a tilted clocktower, a library of unwritten books |

Open the control drawer → **Expeditions** to jump straight to any room, or walk through the
gates. Species abilities, narrative stages, mementos, atmosphere variants, the living-world
clock/weather and the Journal all work in the new rooms. Full room-by-room breakdown and
architecture notes in [`docs/EXPANSIONS.md`](docs/EXPANSIONS.md).

## UI & camera controls

The default view is deliberately empty — the creature fills the screen. Controls fade after
a few seconds of inactivity and return instantly on input.

| Control | Effect |
|---|---|
| Drag / touch-drag | Orbit camera |
| Scroll / pinch | Zoom (close enough to fill the frame with a face, per species) |
| Double-click / double-tap Eevee | Focus the camera on that region |
| `C` | Cycle camera presets: Full Body → Portrait → Low Three-Quarter → Habitat View → Free |
| `F` | Quick focus (portrait) |
| `R` | Reset camera |
| `Tab` or the ☰ button | Open/close the control drawer (rooms, camera, mode, settings) |
| `Esc` | Close whatever's open, in order: interaction wheel → lore/settings → photo mode |
| 🐾 button | Open the interaction wheel (pet, feed, disco, loaf, derp, call, brush, room action, Roomba) |
| 📖 button | Lore & Journal drawer (facts + discovered behaviors/mementos) |
| 📷 button | Photo/cinematic mode — hides all UI, lets you compose and capture (Esc to exit) |

## Sandbox hotkeys (unchanged)

| Key | Action |
|---|---|
| `1`–`9` | Instant morph between Eevee and all 8 evolutions |
| `S` | Toggle Shiny Mode |
| `D` | Toggle Disco Dance Party |
| `L` | Toggle Bread Loaf Mode |
| `P` | Trigger Derp Mode |
| `Space` | Joyful hop |

## Stone Dash (arcade mode)

Toggle **Stone Dash** from the control drawer. `A`/`D` or arrow keys (or drag) to steer,
`Space`/`W`/Up to jump. Catch evolution stones for a mid-run transformation and a temporary
power-up; dodge banana peels and Voltorbs. The track's palette reflects whichever habitat
you launched it from. High score is versioned local storage (migrated automatically from the
old `eevee_dash_highscore` key if present).

## Photo mode & Observation scoring

Photo mode hides every UI element, lets you re-frame with the camera presets, and captures a
PNG exactly like the original quick-screenshot button. Capturing while in photo mode also
computes an original **Moment score** (0–100) from real, deterministic measurements — subject
size in frame, centering, facing, an active behavior, and a fresh room discovery — and keeps
a small bounded list of your best shots' *metadata* locally (no image data is stored).

## Discovery, bond & personality

- Each species has a distinct idle rhythm and reaction intensity (Jolteon is twitchy and
  fast, Flareon is slow and sleepy, and so on).
- Interactions build a per-species **familiarity** (Bond) with no decay and no penalty for
  neglect — it only ever unlocks alternate reactions.
- Room + form + interaction combinations unlock **behavioral discoveries**, which populate
  the Journal tab of the Lore drawer.
- After enough discoveries, faint traces of one room start appearing in others (a stray
  ribbon, a leaf, a frost mark) — the rooms are one connected place, not nine demos.

## Chill Mode

An explicit passive mode (control drawer → 🌙 Chill Mode): the UI mostly disappears, no
hazards, no game-over, and the camera gently reframes to a new preset after a long stretch
of inactivity. Respects Reduced Motion (see Settings).

## Accessibility & settings

Settings (drawer → ⚙️) covers UI density (Minimal/Standard/Full — Minimal is default),
Reduced Motion (also auto-detects `prefers-reduced-motion`), music/SFX, graphics quality,
camera sensitivity, ambience level, and camera auto-follow. All interactive controls are
keyboard-reachable with visible focus states; `Esc` follows a predictable, single-level
dismissal order.

## Persistence

One versioned save (`eevee_habitat_save`) covers active form, shiny state, last room,
discovered behaviors/mementos, bond/familiarity, resonance, unlocked atmosphere variants,
room memory, UI density and accessibility settings, camera preferences, and high score. The
legacy `eevee_dash_highscore` key is migrated in automatically on first load and left alone
afterward.

## 100% procedural audio

Zero external audio files. The chiptune BGM and every SFX (boing, chomp, zap, splash, purr,
evolution sparkle…) are synthesized live with the Web Audio API.

---

## Architecture

`index.html` remains the entry point and owns the protected character/gameplay systems
(GLTF loading, form switching, petting, the toybox gags, Stone Dash). The Habitat House
itself is a set of plain, dependency-free scripts loaded before it:

- `src/persistence.js` — versioned `SaveManager` + legacy high-score migration
- `src/render-effects.js` — shared toon material library, pooled particle VFX, two cheap
  custom shader accents (water ripple, fresnel rim), ground-contact helpers
- `src/rooms.js` — the data-driven room definitions (Conservatory + 9 habitats) and the
  shared `RoomKit` prop/doorway/memento builders
- `src/expansions/expansion-kit.js` + `src/expansions/*.js` — the four expedition regions
  (hub + nine habitats each), registered declaratively on top of `rooms.js`
- `src/room-manager.js` — one-room-at-a-time lifecycle (enter/exit/update/dispose), habitat
  memory, cross-room trace seeding, atmosphere variant application
- `src/discovery-system.js` — species personalities, toy preferences, bond/familiarity,
  short-term interaction memory (no repeated lines), the behavioral-discovery table
- `src/photo-system.js` — Moment scoring + bounded album metadata
- `src/camera-controller.js` — wraps `OrbitControls`: auto-framing from live model bounds,
  presets, focus-on-raycast, cinematic room transitions, reduced-motion-aware tweening
- `src/ui-controller.js` — auto-fade timer, the Escape/back stack, density + reduced-motion
  application

No bundler, no framework, no new runtime dependencies — the existing `<script>`-tag,
global-namespace execution model is unchanged, and none of the nine character GLBs are
duplicated or reloaded on room or mode changes.

## Asset provenance

See [`THIRD_PARTY_ASSETS.md`](THIRD_PARTY_ASSETS.md) for full attribution of the nine
sourced Eeveelution meshes. Every habitat room, prop, toy and memento is original procedural
geometry built from primitives — nothing new was downloaded for this pass.

## Testing

`tools/verify_all_gameplay.js` is a Playwright script (repo-relative paths, bundled
Chromium — no machine-specific paths) that boots the app, waits for all nine GLBs, and
exercises form switching, shiny, petting, feeding, loaf/derp/disco/Roomba, Stone Dash
(steering, jumping, scoring), room navigation and disposal, camera zoom/reset, photo mode,
and save-state persistence. Run it with:

```bash
python3 -m http.server 8099 &
node tools/verify_all_gameplay.js
```

Screenshots land in `qa/` (git-ignored).
