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
