# Player Movement Flow

## Trigger

WASD / Arrow keys + mouse movement.

## Flow

```
Keyboard Input
    │
    ▼
InputManager._onKeyDown(e)
    └── keys.add(e.code)
    │
    ▼
InputManager.update()
    └── jumpPressed = jumpHeld && !lastFrame
    │
    ▼
Player.update(delta, input, cameraYaw, obstacles, getGroundHeight)
    │
    ├── 1. Read input direction
    │   ├── inputX = left ? -1 : right ? +1 : 0
    │   └── inputZ = forward ? -1 : backward ? +1 : 0
    │
    ├── 2. Compute target velocity
    │   ├── inputVector = normalize(inputX, 0, inputZ)
    │   ├── inputVector.applyAxisAngle(Y, cameraYaw)
    │   ├── speed = WALK_SPEED × (sprint ? SPRINT_MULTIPLIER : 1)
    │   └── targetVelocity = inputVector × speed
    │
    ├── 3. Smooth acceleration
    │   └── velocity += (target - velocity) × (1 - e^(-ACCELERATION × dt))
    │
    ├── 4. Face movement direction
    │   └── Smoothly rotate facingAngle toward atan2(vx, vz)
    │
    ├── 5. Gravity + jump
    │   ├── velocity.y += GRAVITY × dt
    │   └── if jumpPressed && grounded: velocity.y = JUMP_SPEED
    │
    ├── 6. Integrate position
    │   └── position += velocity × dt
    │
    ├── 7. Ground clamp
    │   ├── groundHeight = getGroundHeight(x, z)
    │   ├── if position.y <= groundHeight:
    │   │   ├── Small gap (≤ STEP_SNAP_MAX_GAP): ease toward ground
    │   │   ├── Larger gap: snap instantly
    │   │   └── velocity.y = 0, isGrounded = true
    │
    ├── 8. Collision push-out
    │   └── resolveCollisions(position, radius, height, obstacles)
    │
    └── 9. Animation
        ├── Moving + sprint → "run"
        ├── Moving → "walk"
        └── Still → "idle"
```

## Implementation

- Input: `src/Input.js:54-67` (event handlers)
- Movement: `src/Player.js:141-234`
- Collision: `src/Collision.js:14-47`
- Ground height: `src/PlayerHouseInterior.js:535-568` (indoor) or constant 0 (outdoor)
