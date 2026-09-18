# PlayerHouseInterior Module

**File:** `src/PlayerHouseInterior.js` (618 lines)

## Purpose

Two-story interior house inspired by Pokémon FireRed/LeafGreen. Largest file in the codebase.

## Responsibilities

- Build shell (perimeter walls, ground floor, ceiling, mid-level slab, parapets)
- Furnish ground floor (TV, cupboard, dining table + 4 chairs, sink, plants)
- Furnish second floor (bed, TV, cupboard, computer desk + PC)
- Build visual L-shaped staircase (flight A → landing → flight B)
- Door teleportation (outside ↔ inside)
- Per-step ground height calculation for staircase
- Expose interior collision obstacles and collision meshes
- Define interactable objects (TV, sink, bed, PC)

## Public Interface

```javascript
setupPlayerHouse(scene, exteriorDoorWorldPos) → controller
```

The returned controller object has:

```javascript
controller = {
  inside: boolean,            // Current state
  interactables: Array,       // For InteractionManager
  update(delta, player),      // Door teleport check
  getObstacles(outdoorObstacles),    // Active collision list
  getCollisionMeshes(outdoorMeshes), // Active collision meshes
  getGroundHeight(worldX, worldZ),   // Walkable surface height
  getDebugInfo(player),              // Diagnostic string
}
```

## Architecture

The interior is placed at `HOUSE_ORIGIN = (300, 0, 300)` — a remote world position that never overlaps the outdoor town. No separate scene or level system is needed.

## Floor Layout

```
┌─────────────────────────────────┐
│         North Wall               │
│  ┌────────┐                     │
│  │ Flight │  ┌────────────────┐ │
│  │   B    │  │   Landing      │ │
│  │ (west) │  └────────────────┘ │
│  │        │  ┌─────┐           │
│  └────────┘  │Flt A│           │
│              │(nort)│           │
│              └─────┘           │
│                                 │
│  TV    Cupboard    Table  Sink  │
│              Door               │
└─────────────────────────────────┘
Ground Floor (y=0)

┌─────────────────────────────────┐
│         North Wall               │
│  Bed                PC Desk     │
│                                 │
│  TV                           │ │
│         Cupboard               │
│              Stairwell opening  │
└─────────────────────────────────┘
Second Floor (y=3.9)
```

## Staircase Dimensions

| Constant | Value | Calculation |
|----------|-------|-------------|
| `STEP_HEIGHT` | 0.3 | `COLLISION_HEIGHT / 6` |
| `FLIGHT_A_STEPS` | 6 | Climb north along east wall |
| `FLIGHT_A_RISE` | 1.8 | 6 × 0.3 |
| `FLIGHT_B_STEPS` | 7 | Climb west along north wall |
| `FLIGHT_B_RISE` | 2.1 | 7 × 0.3 |
| `STAIR_WIDTH` | 1.6 | Player diameter (0.9) + clearance |
| `LANDING_SIZE` | 1.6 | Square corner platform |

## Door Teleportation

| Trigger | From | To |
|---------|------|----|
| `outsideDoorZone` | Outdoor door position | Interior ground entry spawn |
| `insideExitZone` | Interior ground floor near door | Outdoor door position |

Cooldown: 0.6 seconds between teleports.

## Interactable Objects

| Name | Position | Prompt | Message |
|------|----------|--------|---------|
| TV | Ground floor NW corner | "Press E to watch TV" | "It's a TV. Nothing interesting is on." |
| Sink | Ground floor south wall | "Press E to use the sink" | "The sink is clean." |
| Bed | Second floor NW corner | "Press E to sleep" | "It's your bed. You feel refreshed just looking at it." |
| PC | Second floor east wall | "Press E to use the PC" | "The PC hums quietly. No new mail." |
