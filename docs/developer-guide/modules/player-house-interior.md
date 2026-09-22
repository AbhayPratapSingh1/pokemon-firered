# House Interior System

## Purpose

Config-driven house system. Each house is defined by a config object in `src/house/*/config.js`, not by a dedicated module.

## Architecture

Houses are data-driven, not code-driven. Each house has:

- **`config.js`** — Full layout definition (exterior, interior objects, teleporters)
- **`constants.js`** — Building dimensions, staircase math, world origin

The `World.js` BUILDERS registry processes these configs at runtime.

## Config Structure

```javascript
export const ASH_HOUSE = {
  name: "Ash's House",
  exterior: {
    position: [-5, 0, -8],           // world position
    facing: DIRECTIONS.SOUTH,
    objects: [                        // built by BUILDERS registry
      { type: OBJ.HOUSE, position: [0,0,0], config: { width:6, depth:6, wallHeight:3, ... } },
    ],
  },
  interior: {
    origin: [300, 0, 300],           // interior world offset
    objects: [
      { type: OBJ.GROUND_FLOOR, position: [0,0,0], config: { width:12, depth:10 } },
      { type: OBJ.WALLS, position: [0,0,0], collide: true, config: { width:12, depth:10, height:10.0 } },
      { type: OBJ.DOOR_FRAME, position: [0, 0, 5.0] },
      { type: OBJ.TV, position: [-5, 0, -4.5], collide: true,
        action: { type: ACTIONS.MESSAGE, prompt: "Watch TV", message: "..." } },
      // ... more furniture
    ],
  },
  teleporters: [
    { triggerSpace: "WORLD", triggerPosition: [...], targetSpace: "ASH_HOUSE", ... },
    { triggerSpace: "ASH_HOUSE", triggerPosition: [...], targetSpace: "WORLD", ... },
  ],
};
```

## Object Config Pattern

Each interior object can have:

| Field | Type | Purpose |
|-------|------|---------|
| `type` | string | OBJ type constant (matched to BUILDERS registry) |
| `position` | [x, y, z] | Local position within interior |
| `rotation` | number | Y-axis rotation (radians) |
| `scale` | [x, y, z] | Scale multiplier |
| `collide` | boolean | Adds collision to all child meshes |
| `canStandOn` | boolean | Enables step-snap collision logic |
| `config` | object | Builder-specific configuration |
| `action` | object | Interaction definition (prompt + message) |

## Three Houses

### AshHouse (`src/house/AshHouse/`)

- World position: [-5, 0, -8]
- Interior origin: [300, 0, 300]
- 2 floors, L-shaped staircase (direction 1: north-then-west)
- Ground floor: TV, cupboard, dining table + 4 chairs, sink, plants
- First floor: bed, computer desk, TV, plants, table

### GaryHouse (`src/house/GaryHouse/`)

- World position: [5, 0, -8]
- Interior origin: [400, 0, 300]
- Mirrored from AshHouse (direction -1: south-then-east)
- Blue roof, different flavor text

### OakLab (`src/house/OakLab/`)

- World position: [0, 0, 25]
- Interior origin: [500, 0, 300]
- Single floor, flat roof, 14×24 long room
- Lab furniture: shelves, machines, desks, pokeballs

## How It's Built

In `World.js`, `buildWorldSpace()`:

1. Creates root World Space
2. For each house in `WORLD.objects`:
   - Creates child Space
   - Calls `buildExteriorObjects()` → offsets to house world position
   - Calls `buildInteriorObjects()` → offsets to house interior origin
   - Traverses interior meshes → collects obstacles (`userData.collide`) and interactables (`userData.action`)
   - Calls `buildTeleporters()` → creates Teleporter instances
3. Resolves all teleporter targets via `SPACE_LOOKUP`
4. Returns world Space + all teleporters

## Interactable Objects

Objects with `action` property are auto-collected as interactables. The `action` object:

```javascript
{
  type: ACTIONS.MESSAGE,    // action type
  prompt: "Watch TV",       // shown in prompt HUD when player is near
  message: "The news is on...", // shown for 3 seconds when E is pressed
}
```

Detection happens in `main.js`:
- Each frame, iterate `currentSpace.data.interactables`
- Find nearest within `INTERACT_RANGE` (2.0 units)
- Show/hide prompt HUD
- On E press: call `handleAction(action)` which dispatches by type
