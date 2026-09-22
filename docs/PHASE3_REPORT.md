# Phase 3 — Personality, Memory and Relationship

Phase 3 makes an individual Eeveelution change behavior based on shared history without adding punishment, neglect decay, chores, giant event logs, or a second AI authority.

## Core substrate

- `CreatureMemory` persists only bounded semantic facts: interaction counters, favorite touch region, favorite toy, favorite food, room visits, quiet sessions, sleep sessions and preferred sleep room.
- `NeedState` tracks alertness, curiosity, social interest, play interest and rest inclination as opportunity biases, never punishment meters.
- `BehaviorScheduler` decides when optional sleep, rare moments, familiar initiative and bond gestures become available.
- Existing `BondTracker` remains the source of familiarity; Phase 3 does not invent a competing relationship score.
- Familiarity tiers remain the existing 0/1/2 thresholds and are interpreted as cautious / comfortable / bonded behavior.
- Every rare behavior carries reusable semantic tags such as `rare`, `photographable`, `species:<id>`, and `room:<id>` for later photo, journal, audio and House Event systems.
- Each species receives one rare spontaneous behavior definition and one bonded personal gesture.
- Memory is stored under the lazily-created `creatureMemory.<species>` namespace; no save-version bump is required because missing memory is a valid empty state.

## Ownership contract

The scheduler may request behavior. It does not mutate Three.js scene objects. `CreatureActor` remains the only owner of creature world motion and pose state.

## Safety/purpose rules

- Familiarity never decays.
- Absence never harms the creature.
- Needs do not create penalties.
- No giant interaction history is persisted.
- Unknown imported animation clips remain unmapped.


## Runtime wiring implemented

- `CreatureActor` now exposes semantic external behavior poses while retaining sole transform authority.
- Sleep is a real scheduled state: locomotion pauses, a visible settled pose is applied, and player interaction wakes the creature immediately.
- Rare species behaviors are emitted as temporary tagged moments, journaled through the existing rare-moment system, and never remain falsely active after their short window.
- Familiarity changes call behavior: cautious creatures attend, comfortable creatures approach, and bonded creatures can perform a species-specific personal gesture.
- Comfortable/bonded creatures periodically initiate attention or approach rather than waiting for a button press.
- Petting and brushing record dominant touch region; toys record throw/retrieve preference; food records preference; rooms, quiet sessions, and sleep update bounded memory.
- The scheduler reads the existing BondTracker tier and does not introduce a second relationship score.
- UI/pointer/keyboard activity wakes or delays rest opportunities without creating any penalty for absence.

## Evidence state

Focused Node and Playwright assertions are committed. Runtime execution remains unavailable in the current environment because the container cannot resolve github.com for a clean checkout, so Phase 3 is source-verified but browser-unverified.
