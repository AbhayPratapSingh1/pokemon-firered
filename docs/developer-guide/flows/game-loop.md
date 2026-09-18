# Game Loop Flow

## Trigger

Browser `requestAnimationFrame` callback.

## Flow

```
requestAnimationFrame(animate)
    │
    ▼
clock.getDelta() → delta (clamped to 0.1s)
    │
    ├── input.update()
    │   └── Edge-detect jumpPressed, interactPressed
    │
    ├── playerHouse.update(delta, player)
    │   ├── Check outsideDoorZone.contains(player.position)
    │   │   └── If true: teleport inside, set inside=true
    │   ├── Check insideExitZone.contains(player.position)
    │   │   └── If true: teleport outside, set inside=false
    │   └── Cooldown prevents rapid re-teleporting
    │
    ├── player.update(delta, input, cameraYaw, obstacles, getGroundHeight)
    │   ├── Compute input vector from WASD
    │   ├── Rotate input by camera yaw
    │   ├── Set target velocity (walk or sprint)
    │   ├── Smooth acceleration toward target
    │   ├── Apply gravity
    │   ├── Jump if grounded + space
    │   ├── Integrate position
    │   ├── Ground clamp via getGroundHeight()
    │   │   ├── Outdoor: y=0
    │   │   └── Indoor: per-step staircase height
    │   ├── resolveCollisions() → push out of obstacles
    │   └── Play animation (idle/walk/run)
    │
    ├── cameraController.update(delta, input, player, collisionMeshes)
    │   ├── Read mouse delta → update yaw/pitch
    │   ├── Compute desired position (sphere behind player)
    │   ├── Raycast for wall collision
    │   ├── Snap if wall pushes closer, lerp if pulling back
    │   └── Look at player head
    │
    ├── interaction.update(delta, input, player, interactables)
    │   ├── Find nearest interactable within INTERACT_RANGE
    │   ├── Show/hide "Press E" prompt
    │   └── Show message on interactPressed
    │
    ├── Update debug HUD (#debug-stair)
    │
    └── renderer.render(scene, camera)
```

## Implementation

- Entry: `src/main.js:72` (`animate()`)
- Game loop: `src/main.js:72-95`
- Player update: `src/Player.js:141-234`
- Collision: `src/Collision.js:14-47`
- Camera: `src/CameraController.js:27-69`
- Interaction: `src/InteractionManager.js:17-47`
