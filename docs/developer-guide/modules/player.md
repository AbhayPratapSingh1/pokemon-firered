# Player Module

**File:** `src/Player.js` (235 lines)

## Purpose

Player character — movement, physics, animation, and GLTF model loading.

## Responsibilities

- Load GLTF character model asynchronously (with placeholder fallback)
- WASD/arrow key movement relative to camera yaw
- Smooth velocity interpolation (exponential easing)
- Gravity and jumping
- Ground clamping with staircase step-snap
- AABB collision push-out
- Locomotion animation (idle/walk/run)

## Public Interface

```javascript
class Player {
  constructor(scene, spawnPosition)
  update(delta, input, cameraYaw, obstacles, getGroundHeight)
  get position → THREE.Vector3
  get headHeight → number (1.55)
}
```

## Key Exports

| Export | Type | Purpose |
|--------|------|---------|
| `Player` | Class | Player character |
| `COLLISION_RADIUS` | Constant (0.45) | Horizontal collision radius |
| `COLLISION_HEIGHT` | Constant (1.8) | Vertical collision height |

## Movement Constants

| Constant | Value | Purpose |
|----------|-------|---------|
| `WALK_SPEED` | 3.2 | Base movement speed (m/s) |
| `SPRINT_MULTIPLIER` | 1.8 | Sprint speed multiplier |
| `ACCELERATION` | 12 | Velocity interpolation rate |
| `GRAVITY` | -20 | Gravitational acceleration |
| `JUMP_SPEED` | 8 | Initial jump velocity |
| `ROTATION_SMOOTHING` | 12 | Facing direction smoothing |
| `STEP_SNAP_SMOOTHING` | 18 | Stair climb smoothing |
| `STEP_SNAP_MAX_GAP` | 0.5 | Max gap for step-snap (larger = instant snap) |
| `STEP_SNAP_EPSILON` | 0.01 | Threshold for full snap |

## Movement Flow

```
Input (forward/backward/left/right)
    │
    ▼
inputVector (normalized, rotated by camera yaw)
    │
    ▼
targetVelocity = inputVector × speed
    │
    ▼
velocity += (target - velocity) × (1 - e^(-ACCELERATION × dt))
    │
    ▼
position += velocity × dt
    │
    ▼
Ground clamp (getGroundHeight)
    │
    ▼
resolveCollisions (push out of obstacles)
```

## Animation States

| State | Trigger | Clip Name |
|-------|---------|-----------|
| idle | No movement input | `CharacterArmature\|Idle` |
| walk | Moving | `CharacterArmature\|Walk` |
| run | Moving + sprint | `CharacterArmature\|Run` |

## GLTF Model

- **Source:** `assets/adventurer.glb` (CC0 by Quaternius)
- **Target height:** 1.8 meters (normalized)
- **Fallback:** Green capsule mesh if load fails
