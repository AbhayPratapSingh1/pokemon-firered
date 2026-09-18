# Observability

## Current State

Minimal observability — no logging framework, no metrics, no tracing.

## What Exists

| Mechanism | Location | Purpose |
|-----------|----------|---------|
| `console.error()` | `Player.js:110`, `World.js:223`, `ModelStore.js:7`, `ModelLoader.js:23` | Model loading failures |
| `console.warn()` | `ModelStore.js:118` | Missing model reference |
| `#debug-stair` HUD | `main.js:91`, `PlayerHouseInterior.js:591` | Staircase collision diagnostics |
| Error banner | `Player.js:112-117` | Player model load failure notification |

## Debug HUD

The `#debug-stair` element (top-right corner in play mode) displays:

```
region=flightA floor=0
local x=4.50 z=-2.30 y=0.00
groundHeight=0.30
colliding=0:
```

Fields:
- `region` — Which part of the house the player is in (flightA, flightB, landing, outside-hole)
- `floor` — Current floor (0 or 1)
- `local x/z/y` — Position relative to house origin
- `groundHeight` — Walkable surface height at current position
- `colliding` — Number of obstacles intersecting the player's collision box, with bounding box details

## Three.js Built-in

`renderer.info` provides render call counts, triangle counts, etc. — accessible via browser DevTools console.
