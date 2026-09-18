# Player House Teleport Flow

## Trigger

Player walks into the door trigger zone.

## Entry Flow

```
Player position enters outsideDoorZone
    │
    ▼
PlayerHouseInterior.controller.update(delta, player)
    │
    ├── cooldown > 0? → return (prevent re-teleport)
    │
    ├── !inside && outsideDoorZone.contains(x, z)?
    │   ├── player.position.set(groundEntrySpawn)
    │   │   └── (HOUSE_ORIGIN.x, 0, HOUSE_ORIGIN.z + HALF_D - 1.2)
    │   ├── inside = true
    │   ├── currentFloor = 0
    │   └── cooldown = 0.6s
    │
    └── Subsequent frames use interior systems:
        ├── getObstacles() → interiorObstacles
        ├── getCollisionMeshes() → interiorCollisionMeshes
        └── getGroundHeight() → interior heights
```

## Exit Flow

```
Player position enters insideExitZone (ground floor, near door)
    │
    ▼
PlayerHouseInterior.controller.update(delta, player)
    │
    ├── inside && currentFloor === 0 && insideExitZone.contains(x, z)?
    │   ├── player.position.set(outsideSpawn)
    │   │   └── (exteriorDoorWorldPos.x, 0, exteriorDoorWorldPos.z + 1.2)
    │   ├── inside = false
    │   └── cooldown = 0.6s
    │
    └── Subsequent frames use outdoor systems:
        ├── getObstacles() → outdoorObstacles
        ├── getCollisionMeshes() → outdoorMeshes
        └── getGroundHeight() → 0
```

## Trigger Zones

| Zone | Center | Size | Purpose |
|------|--------|------|---------|
| `outsideDoorZone` | Exterior door position | 2×0.85 | Enter house |
| `insideExitZone` | HOUSE_ORIGIN + south wall | 2×0.7 | Exit house |

## Implementation

- Zone definition: `src/PlayerHouseInterior.js:437-447`
- Door zones: `src/PlayerHouseInterior.js:493-504`
- Teleport logic: `src/PlayerHouseInterior.js:571-588`
