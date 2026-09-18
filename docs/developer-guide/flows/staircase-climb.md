# Staircase Climb Flow

## Trigger

Player walks onto the L-shaped staircase inside the house.

## Staircase Layout

```
Flight A (6 steps, north along east wall)
    │
    ▼
Landing (flat corner platform)
    │
    ▼
Flight B (7 steps, west along north wall)
    │
    ▼
Second floor
```

## Ground Height Flow

```
Player at world position (worldX, worldZ)
    │
    ▼
getGroundHeight(worldX, worldZ)
    │
    ├── Not inside? → return 0
    │
    ├── Convert to local: x = worldX - HOUSE_ORIGIN.x, z = worldZ - HOUSE_ORIGIN.z
    │
    ├── Flight A zone? (FLIGHT_A_X0..X1, FLIGHT_A_Z0..Z1)
    │   ├── run = FLIGHT_A_Z1 - z (distance from bottom)
    │   ├── stepIndex = min(6, floor(run / STEP_DEPTH_A) + 1)
    │   ├── height = stepIndex × STEP_HEIGHT (0.3)
    │   └── currentFloor = height > 1.95 ? 1 : 0
    │
    ├── Landing zone? (LANDING_X0..X1, LANDING_Z0..Z1)
    │   ├── height = FLIGHT_A_RISE (1.8, constant)
    │   └── currentFloor = 1
    │
    ├── Flight B zone? (FLIGHT_B_X0..X1, FLIGHT_B_Z0..Z1)
    │   ├── run = FLIGHT_B_X1 - x (distance from landing)
    │   ├── stepIndex = min(7, floor(run / STEP_DEPTH_B) + 1)
    │   ├── height = 1.8 + stepIndex × 0.3
    │   └── currentFloor = height > 1.95 ? 1 : 0
    │
    └── Flat floor area
        └── height = currentFloor === 1 ? FLOOR2_HEIGHT : 0
```

## Step Snap (Player.js)

```
Player.position.y <= groundHeight
    │
    ├── gap = groundHeight - position.y
    │
    ├── gap > 0 && gap ≤ 0.5 (STEP_SNAP_MAX_GAP)?
    │   ├── Ease toward groundHeight
    │   │   └── position.y += gap × (1 - e^(-STEP_SNAP_SMOOTHING × dt))
    │   └── If remaining gap < 0.01: snap fully
    │
    ├── gap > 0.5?
    │   └── Snap instantly (normal landing)
    │
    └── velocity.y = 0, isGrounded = true
```

## Implementation

- Ground height: `src/PlayerHouseInterior.js:535-568`
- Step snap: `src/Player.js:193-222`
- Visual stairs: `src/PlayerHouseInterior.js:367-395`
- Parapets: `src/PlayerHouseInterior.js:224-242`
