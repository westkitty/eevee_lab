# Expansions — Four New Regions for the Habitat House

Each expansion is a self-contained **region**: one hub (its own crossroads, reached by an
*expedition gate* in the Conservatory) plus **nine habitat rooms, one per Eeveelution**. Every
room has its own floor, backdrop, lighting profile, weather palette, ambient life, two
atmosphere variants, four narrative stages, a memento, and a **native setpiece** — a clickable
prop that also becomes the species' Phase-6 ability target (Vaporeon's *Shape Water*,
Jolteon's *Charge Relay*, etc. all work in the new rooms).

Everything is additive. The nine original habitats, the Conservatory, saves, Stone Dash, the
photo system and Chill Mode are untouched. No new assets were downloaded — every prop is
procedural primitives in the existing toon language.

```
Conservatory
 ├─ (9 original habitats)
 ├─ ⛵ Tidewild Coast ─── Driftwood Harbor ─── 9 rooms
 ├─ ⛰ Emberpeak Ruins ── The Pilgrim's Stair ─ 9 rooms
 ├─ 🌃 Neon Undercity ─── Lantern Alley ─────── 9 rooms
 └─ 🌙 Starfall Dreamway ─ The Pillow Nebula ─── 9 rooms
```

## 01 · Tidewild Coast — *Driftwood Harbor*
A scattered archipelago reached by tide-gate. Salt wind, gull-cries, a harbor built from
whatever floated in. Hub setpiece: a bell buoy you can ring.

| Form | Room | Environment | Setpiece |
|---|---|---|---|
| Eevee | Tidepool Shallows | Rock pools, sea stars, low/high tide | Anemone pool — anemones shy away then reopen |
| Vaporeon | Glassreef Drop-off | Coral reef falling into blue | Drop-off ledge — calls a spinning shoal of light-fish |
| Jolteon | Stormwatch Lighthouse | Storm rocks, rain, lightning rods | Storm rail — lights the lamp and starts the sweeping beam |
| Flareon | Bonfire Cove | Sheltered beach under cliffs | Driftwood bonfire — roars up, throws embers |
| Espeon | Moonpull Tidal Clock | Stone dial in tidal shallows under a moon | Tidal dial — hand swings a sixth-turn, orbiting motes speed up |
| Umbreon | Blackwater Sea Cave | Stalactites, phosphor-rimmed pool | Blackwater pool — echo pulses ring-lights around the wall |
| Leafeon | Mangrove Boardwalk | Brackish water, prop-root trees | Seed drum — pollen burst, saplings jump a size |
| Glaceon | Iceberg Landing | A berg with its own weather | Calving face — a chunk splits off, drops, bobs |
| Sylveon | Ribbonwreck Deck | A tipped survey ship re-rigged in ribbon | Ship's wheel — gust animates every ribbon |

## 02 · Emberpeak Ruins — *The Pilgrim's Stair*
A mountain that was a temple, and before that, a volcano. Prayer flags, cairns, terraced
stairs to a broken gate. Hub setpiece: a prayer wheel.

| Form | Room | Environment | Setpiece |
|---|---|---|---|
| Eevee | Waystation Hut | Wooden hut, nine tea tins, stove | Stove — warms up, steam and glow |
| Vaporeon | Hotspring Terraces | Stepped mineral pools, steam | Spring vent — geyser erupts |
| Jolteon | Thunderhead Aerie | Summit ledge above a cloud sea | Storm spire — lightning strike, scars glow |
| Flareon | Caldera Heart | Cooled lava floor, basalt columns | Magma core — cracks brighten, ember storm |
| Espeon | Fallen Sky-Temple | Floating rubble held by nothing | Altar — every shard lifts and rotates |
| Umbreon | Lantern Monastery | Cliffside pagoda, paper lanterns | Monastery bell — tolls, lanterns flare |
| Leafeon | Cloudforest Ledge | Moss, ferns, fog, tree through a wall | Wall tree — ferns unfurl, sun shafts open |
| Glaceon | Glacier Pass | Blue-ice corridor, singing crevasse | Ice bridge — crevasse sings, crystals pulse in sequence |
| Sylveon | Windchime Sanctum | Domed summit room, nine chimes | Singing bowl — ring expands, chimes swing |

## 03 · Neon Undercity — *Lantern Alley Junction*
A city that only exists after dark. Rain on neon, a train on the viaduct, ramen steam. Hub
setpiece: a ramen cart.

| Form | Room | Environment | Setpiece |
|---|---|---|---|
| Eevee | Capsule Arcade | Nine crane machines, one per evolution | Claw machine — drops, grabs, sometimes wins |
| Vaporeon | Aquarium Bar | A bar inside a tank; fish and jellies | Fish feeder — flakes fall, the shoal converges |
| Jolteon | Substation Rooftop | Transformers over a skyline | Main breaker — surge, the whole city's windows light |
| Flareon | Night Market Grill | Charcoal stall, lanterns, lucky cat | Charcoal grill — coals flare, skewers turn |
| Espeon | Data Spire Observatory | Dish, holo-panels, rooftop console | Uplink console — rings expand, holograms flicker |
| Umbreon | Last Train Platform | Abandoned subway, flickering tubes | Departure board — the last train finally arrives |
| Leafeon | Rooftop Farm | Planters, solar panels, beehive | Rain tank — irrigation spray, crops swell |
| Glaceon | Cold Storage Rink | Frozen warehouse rink, mirror ball | Mirror ball — Zamboni lap, ice turns to mirror |
| Sylveon | Karaoke Lantern Loft | Tiny loft, nine lanterns, mic on a ribbon | Microphone — an 8-second song: beat lights, disco colour |

## 04 · Starfall Dreamway — *The Pillow Nebula*
Reached only by falling asleep somewhere comfortable. Soft gravity, slow stars, hill-sized
cushions, drifting islands. Hub setpiece: the Great Pillow.

| Form | Room | Environment | Setpiece |
|---|---|---|---|
| Eevee | Nursery of Maybes | Eight glowing cribs around a mobile | Star mobile — cribs rock, futures glow |
| Vaporeon | Sea of Glass | An ocean frozen mid-wave, lit from below | Glass buoy — ripple, lights rise from beneath |
| Jolteon | Static Field | A meadow of charged grass blades | Grounding rod — arcs, flashes, every blade shivers |
| Flareon | Comet Garden | Resting comets with tails | Great comet — warms, tail flares |
| Espeon | Tilted Clocktower | A leaning tower; time runs sideways | Winding key — hands and cogs spin up |
| Umbreon | Library of Unwritten Books | Ring-lit stacks, floating books | Lectern — glyphs appear, books orbit |
| Leafeon | Seedling Sky-Isles | Floating islands grown from seeds | Seedling isle — sprout grows, isle lifts off |
| Glaceon | Aurora Cathedral | Ice pillars under a sky of aurora | Ice altar — curtains billow, pillars ring |
| Sylveon | Ribbon Bridge to Morning | A ribbon bridge toward a sunrise | The last knot — ribbons still, the sun rises |

## Hubs are places, not rings
Each hub's `doorLayout()` places the nine habitat doors according to the region's geography:
- **Driftwood Harbor** — beach arc (tidepools, bonfire, mangroves), pier head over water (reef, iceberg, wreck), cliff foot (lighthouse, sea cave, tidal clock).
- **The Pilgrim's Stair** — five terraces climbing north; low doors for the hut and springs, the caldera off the mid-terrace, aerie/glacier/sanctum at the summit gate.
- **Lantern Alley** — vertical: street level (market, arcade, bar, platform), a mezzanine catwalk (karaoke, farm), rooftop line (substation, data spire), the rink behind the shutter at the alley's end.
- **The Pillow Nebula** — no floor; every door stands on its own drifting fragment at its own height and tilt.

## Cross-room consequences
Each region keeps one bounded save record, `expeditions.<region>` = `{ flags, mementos, setpieces }`
(≤24 flags, ≤12 memento ids, one counter per room). Rooms with a `consequence:` key set a flag
when their setpiece fires; siblings and the hub read it on build. Currently wired:

| Flag | Set by | Seen in |
|---|---|---|
| `lighthouseLit` | Tidewild Jolteon | beam sweeps past Umbreon's cave mouth; lamp on Glaceon's horizon; hub cliff lamp |
| `bonfireLit` / `reefDived` | Tidewild Flareon / Vaporeon | smoke over the headland in Eevee's tidepools; boats moor at the pier |
| `lanternsLit` | Emberpeak Umbreon | every lantern on the Stair, the far pagoda, and the ridge above Glacier Pass |
| `springsWoken` / `spireStruck` | Emberpeak Vaporeon / Jolteon | steam on the hub's west flank; a scorch on the summit gate |
| `lastTrainArrived` | Undercity Umbreon | the viaduct train in Lantern Alley becomes the lit last train and dwells overhead; it waits at the platform on return |
| `gridSurged` / `songSung` | Undercity Jolteon / Sylveon | arcade strips & rink floodlights at full; the platform's tubes stop flickering |
| `morningCame` / `isleLifted` / `clockWound` | Dreamway Sylveon / Leafeon / Espeon | dawn bleeds into the Nebula horizon; Leafeon's isle drifts through the hub |

Mementos found in a region reappear in its hub (tide line, gate offerings, alley noticeboard, orbiting the Great Pillow).

## Transitions
Crossing a region boundary plays a full-screen veil in that region's language (`#region-veil`):
Tidewild wave/spray, Emberpeak stone aperture + altitude cloud, Undercity shutter + streaking
signage, Dreamway geometry inversion. Moves inside one region keep only the existing camera
cinematic. Reduced-motion collapses the veil to a 0.3 s fade.

## Dreamway rules (one learnable rule per room)
Nursery: only one future glows, never the one nearest you · Sea of Glass: the world under the
glass is one narrative stage ahead · Static Field: lightning is handwriting; each strike adds a
stroke · Comet Garden: the small comets are falling toward the great one · Clocktower: down is
toward the lean, cogs fall sideways, and the tower straightens as time runs · Library: floor
shadows are one second ahead of the books · Sky-Isles: the isle you grow leaves the room ·
Cathedral: the aurora is nearer than the ceiling · Ribbon Bridge: tying the knot brings morning
everywhere.

## Architecture

- `src/expansions/expansion-kit.js` — `ExpansionKit.registerExpansion(def)`. Builds the hub
  and nine rooms from compact specs, registers them in `ROOM_DEFINITIONS` / `ROOM_ORDER`,
  patches the Conservatory with expedition gates, and publishes `EXPANSION_REGISTRY`
  (`weather`, `life`, `narrative`, `expansions`, `roomsByExpansion`).
- `src/expansions/<region>.js` — one file per region; pure data + small `build(api)` closures.
- Small seams in existing systems (all fall through to prior behavior for original rooms):
  - `rooms.js` — `decorateHabitatRoom` honours `def.hubId` (return door goes to the region hub)
    and `def.abilityType`; exports `lightingProfile` / `makeInteractable` /
    `decorateHabitatRoom` on `RoomKit`.
  - `phase7-living-world.js` — weather and ambient life look up `EXPANSION_REGISTRY` when a
    room isn't in the static tables.
  - `habitat-state.js` — narrative stages resolve via `EXPANSION_REGISTRY.narrative`.
  - `room-manager.js` — room context gains `activeForm()` and `unlockBehavior()` so hub
    curios can add Journal discoveries.
  - `discovery-system.js` — labels for non-table behaviors are persisted so the Journal can
    display expansion discoveries.
  - `index.html` — loads the scripts; adds an **Expeditions** drawer section (collapsible
    per region) and keeps the original Habitats grid unchanged.

### Adding a fifth region
Copy any `src/expansions/*.js`, change `id`, hub and the nine `rooms.<species>` specs, and
add one `<script>` tag before `room-manager.js`. Nothing else needs editing.

## Testing
`node tools/test_expansions.js` uses the real vendored Three.js, `SaveManager`,
`HabitatWorldState`, `DiscoveryLog` and `RoomManager` (no fakes for project code). Starting
from a legacy pre-expansion save it walks Conservatory → each hub → each of its nine rooms →
back, exclusively through door interactables; ticks every room; fires every setpiece, memento
and hub curio; applies all four stages and an ability mutation; asserts region flags persisted,
scene empty after dispose, identical resource counts across repeated rebuilds, and that the
legacy save's keys survive under a bounded size. Browser/WebGL automation was not available in
the sandbox (Chromium download blocked), so visual composition is unverified by automation.
