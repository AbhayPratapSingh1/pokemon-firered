# House Teleport Flow

## Overview

Houses use the Teleporter system (`src/engine/Teleporter.js`) with rectangular trigger zones placed near doors.

## Entry Flow (World → House)

```
Player walks near door trigger zone in WORLD
    │
    ▼
main.js game loop:
    │
    ├── teleportCooldown > 0? → skip
    │
    ├── for each teleporter in allTeleporters:
    │     distance(player, tp.entry.triggerPosition) < tp.entry.radius?
    │
    ├── Found match:
    │     ├── handleTeleport(tp.config.targetSpace, tp.config.spawnPosition, tp.config.spawnOrientation)
    │     │     ├── targetSpace = SPACE_LOOKUP[targetSpaceName]
    │     │     ├── spaceManager.clear()           // remove world objects
    │     │     ├── spaceManager.load(targetSpace)  // add house interior
    │     │     ├── player.position = spawnPos
    │     │     ├── player.velocity = (0,0,0)
    │     │     ├── player.facingAngle = orientation
    │     │     ├── snap to ground height
    │     │     ├── teleportCooldown = 1.0
    │     │     └── inputLockTimer = 0.2
    │     └── break
```

## Exit Flow (House → World)

```
Player walks near exit trigger zone inside house
    │
    ▼
main.js game loop:
    │
    ├── teleportCooldown > 0? → skip
    │
    ├── for each teleporter in allTeleporters:
    │     distance(player, tp.entry.triggerPosition) < tp.entry.radius?
    │
    ├── Found match:
    │     ├── handleTeleport(tp.config.targetSpace, tp.config.spawnPosition, tp.config.spawnOrientation)
    │     │     ├── targetSpace = SPACE_LOOKUP["WORLD"]
    │     │     ├── spaceManager.clear()           // remove house interior
    │     │     ├── spaceManager.load(world)        // add world objects
    │     │     ├── player.position = spawnPos      // outside door
    │     │     ├── snap to ground height (0)
    │     │     └── teleportCooldown = 1.0
    │     └── break
```

## Trigger Zone Design

### Rectangular Triggers (Doors)

Door teleporters use thin rectangular zones:

```javascript
{
  triggerSpace: "WORLD",
  triggerPosition: [x, y, z],    // 1-2 units outside door threshold
  triggerWidth: 1.8,              // X extent (door width)
  triggerDepth: 0.1,              // Z extent (thin line)
  targetSpace: "ASH_HOUSE",
  spawnPosition: [300, 0, 303.8], // inside house, away from exit trigger
  spawnOrientation: Math.PI,
}
```

### Why Rectangular

- Thin rectangle (1.8 × 0.1) placed just outside the door
- Prevents entry/exit loops (spawn is outside the other trigger)
- Matches door width for natural feel

### Cooldown System

| Mechanism | Duration | Purpose |
|-----------|----------|---------|
| Global cooldown | 1.0s | Prevents any teleport after one fires |
| Per-teleporter cooldown | 0.8s | Prevents same teleporter from re-firing |
| Input lock | 0.2s | Prevents player drift after teleport |

## Per-House Positions

### AshHouse

| Trigger | Position | Notes |
|---------|----------|-------|
| Entry (WORLD → ASH_HOUSE) | [-5, 0, -6] | 2 units outside door at z=-8 |
| Exit (ASH_HOUSE → WORLD) | [300, 0, 306] | Inside door at z=305 |
| Spawn inside | [300, 0, 303.8] | 1.2 units inside from door |
| Spawn outside | [-5, 0, -4.5] | 3.5 units outside door |

### GaryHouse

| Trigger | Position | Notes |
|---------|----------|-------|
| Entry (WORLD → GARY_HOUSE) | [5, 0, -6] | 2 units outside door at z=-8 |
| Exit (GARY_HOUSE → WORLD) | [400, 0, 306] | Inside door at z=305 |
| Spawn inside | [400, 0, 303.8] | 1.2 units inside from door |
| Spawn outside | [5, 0, -4.5] | 3.5 units outside door |

### OakLab

| Trigger | Position | Notes |
|---------|----------|-------|
| Entry (WORLD → OAK_LAB) | [0, 0, 39] | 2 units outside door at z=37 |
| Exit (OAK_LAB → WORLD) | [500, 0, 312] | Inside door at z=312 |
| Spawn inside | [500, 0, 308] | 4 units inside from door |
| Spawn outside | [0, 0, 39] | 2 units outside door |
