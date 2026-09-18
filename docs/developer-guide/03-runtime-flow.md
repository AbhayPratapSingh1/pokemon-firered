# Runtime Flow

## Play Mode Game Loop

```
┌─────────────────────────────────────────────────┐
│                  animate()                       │
│                  (src/main.js:72)                │
├─────────────────────────────────────────────────┤
│                                                  │
│  1. input.update()                               │
│     └── Edge-detect jump/interact                │
│                                                  │
│  2. playerHouse.update(delta, player)            │
│     └── Check door trigger zones                 │
│     └── Teleport player in/out if in zone        │
│                                                  │
│  3. player.update(delta, input, yaw, obstacles)  │
│     ├── Compute target velocity from input       │
│     ├── Apply gravity                            │
│     ├── Integrate position                       │
│     ├── Ground clamp (getGroundHeight)           │
│     ├── resolveCollisions(position, obstacles)   │
│     └── Update animation (idle/walk/run)         │
│                                                  │
│  4. cameraController.update(delta, input, player)│
│     ├── Read mouse delta for yaw/pitch           │
│     ├── Compute desired camera position          │
│     ├── Raycast against collision meshes         │
│     └── Pull camera forward if wall hit          │
│                                                  │
│  5. interaction.update(delta, input, player)     │
│     ├── Find nearest interactable in range       │
│     ├── Show "Press E" prompt                    │
│     └── Show message on E press                  │
│                                                  │
│  6. renderer.render(scene, camera)               │
│                                                  │
└─────────────────────────────────────────────────┘
```

### Key File References

| Step | File | Function/Class |
|------|------|----------------|
| Bootstrap | `src/main.js` | Top-level setup (renderer, scene, camera, lights) |
| World creation | `src/World.js` | `createWorld()` → `createTownLayout()` |
| Player setup | `src/Player.js` | `new Player(scene, position)` |
| Input | `src/Input.js` | `new InputManager(domElement)` |
| Camera | `src/CameraController.js` | `new CameraController(camera)` |
| House interior | `src/PlayerHouseInterior.js` | `setupPlayerHouse(scene, doorPosition)` |
| Interaction | `src/InteractionManager.js` | `new InteractionManager()` |

## Editor Mode Render Loop

```
┌─────────────────────────────────────────────────┐
│                  animate()                       │
│                  (src/EditorApp.js:89)           │
├─────────────────────────────────────────────────┤
│                                                  │
│  1. cameraPan.update(delta)                      │
│     └── WASD panning (moves camera + target)     │
│                                                  │
│  2. controls.update()                            │
│     └── OrbitControls damping                    │
│                                                  │
│  3. renderer.render(scene, camera)               │
│                                                  │
└─────────────────────────────────────────────────┘
```

### Editor State Flow

```
User clicks ground with tool armed
        │
        ▼
EditorPlacement.pointerup handler
        │
        ├── Raycast against ground + partsGroup
        │
        ├── If armed tool: placePart(state, hit)
        │   ├── Create part record (id, position, rotationY, scale, type, size, color)
        │   ├── push to state.parts
        │   └── addPartToScene(state, part)
        │       ├── buildPartMesh(part) → THREE.Mesh
        │       └── state.partsGroup.add(mesh)
        │
        └── If no tool: findPartIdFromObject → onSelectPart
            └── EditorInspector.renderInspector()
```
