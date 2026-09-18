# Feature Tracing Guide

## How to Trace a Feature

Follow this repeatable process:

```
1. Find entry point (API/CLI/event/DOM trigger)
        ↓
2. Find handler/controller
        ↓
3. Find business logic/service
        ↓
4. Find data access
        ↓
5. Find external integration
        ↓
6. Find tests
```

## Example 1: Player Jumps

```
Entry: Space key pressed
  → Input.js: _onKeyDown() → keys.add("Space")
  → Input.js: update() → jumpPressed = true (edge-detected)

Handler: Player.update()
  → Player.js:178: if (input.jumpPressed && this.isGrounded)
  → Sets velocity.y = JUMP_SPEED (8)
  → Sets isGrounded = false

Physics: Player.update()
  → velocity.y += GRAVITY * delta (each frame)
  → Position integrates upward then downward

Ground clamp:
  → If position.y <= groundHeight: snap to ground, velocity.y = 0, isGrounded = true
```

## Example 2: Building a Model in the Editor

```
Entry: User clicks "Place" on a tool card
  → EditorPalette.js:73: armedTool set to { kind: "primitive", type, size, color }

Handler: EditorPlacement.pointerup
  → Raycasts against ground + partsGroup
  → placePart(state, hit)

Data:
  → Creates part record: { id, type, position, rotationY, scale, size, color }
  → Pushes to state.parts

Rendering:
  → addPartToScene(state, part)
  → buildPartMesh(part) → THREE.Mesh
  → state.partsGroup.add(mesh)

Persistence:
  → User clicks "Save As Model"
  → EditorPalette.js:160: saveModel({ id, name, parts })
  → ModelStore.js:32: writes to localStorage
```

## Example 3: Entering the Player's House

```
Entry: Player walks to house door
  → Position approaches PLAYERS_HOUSE_DOOR_POSITION (World.js:98)

Handler: PlayerHouseInterior controller.update()
  → outsideDoorZone.contains(x, z) → true
  → player.position.set(groundEntrySpawn)
  → controller.inside = true

State change:
  → getObstacles() now returns interiorObstacles
  → getCollisionMeshes() now returns interiorCollisionMeshes
  → getGroundHeight() returns interior heights (0 or stair height)

Player physics:
  → Walking on flat ground (y=0) indoors
  → Approaching NE corner → getGroundHeight returns step heights
  → Walking up L-shaped staircase via per-step quantized heights
```

## Example 4: Saving a Model to Disk

```
Entry: User clicks "Export" button
  → EditorPalette.js:186

Handler: ModelStore.exportModelToJSON(id)
  → Reads model from localStorage
  → Creates Blob with JSON string
  → Creates object URL
  → Creates temporary <a> element, clicks it, removes it
  → Browser downloads .json file
```

## Example 5: Camera Wall Collision

```
Entry: CameraController.update() each frame
  → CameraController.js:27

Logic:
  → Reads mouse delta for yaw/pitch
  → Computes desired camera position behind player
  → Raycasts from look target back toward desired position
  → If ray hits collision mesh: pull camera closer
  → If wall pushes camera closer: snap instantly (no lerp)
  → If pulling back: lerp smoothly
```
