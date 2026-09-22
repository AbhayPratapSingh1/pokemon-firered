# Pokemon 3D Game — Codebase & Workflow Documentation

A Pokemon FireRed/LeafGreen-inspired 3D world built with Three.js (v0.169.0), using ES modules with no build tool, served via `python3 -m http.server`.

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Architecture](#2-architecture)
3. [Engine: Space System](#3-engine-space-system)
4. [Game Flow](#4-game-flow)
5. [Player System](#5-player-system)
6. [Collision System](#6-collision-system)
7. [Camera System](#7-camera-system)
8. [House & Interior System](#8-house--interior-system)
9. [Teleporter System](#9-teleporter-system)
10. [Component System](#10-component-system)
11. [Editor System](#11-editor-system)
12. [Model Store System](#12-model-store-system)
13. [Data Flow](#13-data-flow)
14. [How to Extend](#14-how-to-extend)

---

## 1. Project Overview

Two applications share one codebase:

| Application | Entry HTML | Entry JS | Purpose |
|-------------|-----------|----------|---------|
| **Game** | `index.html` | `src/main.js` | Play mode - explore world, enter houses, interact |
| **Model Builder** | `editor.html` | `src/EditorApp.js` | Visual editor - place parts, save models |

### File Structure

```
pokemon/
  index.html                  # Game entry
  editor.html                 # Editor entry
  style.css                   # Shared styles
  dev.sh                      # HTTP server launcher (port 8934)
  assets/
    adventurer.glb            # Player 3D model (CC0 by Quaternius)
  src/
    main.js                   # Game bootstrap & loop
    World.js                  # World scene construction
    Player.js                 # Player character + physics
    Input.js                  # Keyboard/mouse input
    CameraController.js       # Third-person camera
    Collision.js              # AABB collision resolution
    InteractionManager.js     # Proximity interactions (E key)
    Buildings.js              # Generic building factories
    HousePartBuilder.js       # House part builder registry
    PartKit.js                # Part mesh builder
    ModelStore.js             # localStorage save/load
    ModelLoader.js            # Saved model to scene
    engine/
      Space.js                # Recursive scene node
      SpaceManager.js         # Context swap (clear + load)
      Teleporter.js           # Trigger/action teleporter
      index.js                # Barrel export
    constants/
      game.js                 # DIRECTIONS, HOUSES, OBJECTS, WORLD
    house/AshHouse/
      AshHouse.js             # Player house Space + teleporters
      config.js               # Furniture layout
      constants.js            # Dimensions, staircase geometry
    buildings/
      GaryHouse/              # Gary's house exterior
      OakLab/                 # Oak's Lab
    components/               # 23 visual components
      shared.js               # COLORS palette + helpers
      Bed/ TV/ Stairs/ Tree/ Plant/ Sink/ ...
      (each: ComponentName.js + config.js)
```

---

## 2. Architecture

### Core Concept: Spaces

Everything in the game world is a **Space**. A Space has:

- **exterior** - what you see when looking at it from outside (parent context)
- **interior** - what you see when you are inside it
- **children** - sub-spaces that can be entered

```
World Space (name: "world")
  interior: [ground, paths, trees]
  children:
    players_house Space
      exterior: [walls, roof, door, windows]
      interior: [furniture, stairs, floor]
    gary_house Space
      exterior: [walls, roof, chimney]
      interior: [furniture]
    oak_lab Space
      exterior: [walls, flat roof]
      interior: [lab equipment, pokeballs]
  teleporters: [entry/exit for each house]
```

### What `getInsideObjects()` Returns

When you are inside a space, you see:

```
this.interior + all children[*].exterior
```

- **World**: ground, paths, trees + house shells
- **House**: furniture, stairs (no children, so just interior)

---

## 3. Engine: Space System

### Space (`src/engine/Space.js`)

The fundamental building block. Every Space has exterior, interior, children, and data.

```javascript
const house = new Space({
  name: "garyHouse",
  exterior: [wallsMesh, roofMesh],       // seen from world
  interior: [bedMesh, tableMesh],        // seen when inside
  children: [],                           // sub-spaces
  data: { obstacles, interactables },     // custom data
});

world.addChild(house);
house.getInsideObjects();  // [bedMesh, tableMesh]
house.getOutsideObjects(); // [wallsMesh, roofMesh]
```

### SpaceManager (`src/engine/SpaceManager.js`)

Handles swapping contexts. Only ONE space is active in the scene at a time.

```javascript
const sm = new SpaceManager(scene);
sm.load(world);     // adds world.interior + children[*].exterior

sm.clear();         // removes all current objects
sm.load(house);     // adds house.interior + children[*].exterior
sm.getCurrent();    // returns active space
```

### Teleporter (`src/engine/Teleporter.js`)

Connects spaces. Two types:

| Type | Entry | Exit | Example |
|------|-------|------|---------|
| **trigger** | Auto (collision zone) | Auto (collision zone) | Door |
| **action** | Manual (press E) | Manual (press ESC) | TV screen |

Key fields:
- `triggerPosition` - where collision is checked (source zone)
- `position` - where player appears (destination)
- `target` - the Space to enter
- `radius` - trigger zone size
- `orientation` - player rotation on arrival

---

## 4. Game Flow

### Startup Sequence

```
main.js
  |
  +-- createWorld(scene)                    [World.js]
  |     +-- createWorldSpace()
  |     |     +-- new Space("world")
  |     |     +-- Add ground, paths, trees to world.interior
  |     |     +-- For each house in HOUSES:
  |     |           +-- createHouseSpace({...})     [AshHouse.js]
  |     |           |     +-- Build exterior shell (walls, roof, door, windows)
  |     |           |     +-- Build interior (floor, walls, stairs, furniture)
  |     |           |     +-- Collect obstacles, interactables
  |     |           |     +-- Return new Space({exterior, interior, data})
  |     |           +-- world.addChild(houseSpace)
  |     |           +-- createHouseTeleporters(...) [AshHouse.js]
  |     |                 +-- entry: trigger outside, spawn at room center
  |     |                 +-- exit: trigger inside, spawn outside
  |     |
  |     +-- new SpaceManager(scene)
  |     +-- spaceManager.load(world)        // world objects enter scene
  |     +-- Build worldObstacles (tree trunks + manual wall boxes)
  |
  +-- new Player(scene, spawnPosition)       [Player.js]
  |     +-- Load GLB model (async)
  |     +-- Show placeholder capsule until loaded
  |
  +-- new InputManager(canvas)               [Input.js]
  +-- new CameraController(camera)           [CameraController.js]
  +-- new InteractionManager()               [InteractionManager.js]
  |
  +-- animate() loop starts
```

### Per-Frame Update Order

```
animate() {
  1. input.update()                    // capture keyboard/mouse state

  2. if teleportCooldown <= 0:
     for each house:
       if entry.updateTrigger(player):  // check entry zone collision
         handleTeleport(entry)
       if exit.updateTrigger(player):   // check exit zone collision
         handleTeleport(exit)

  3. player.update(delta, input, yaw, obstacles, groundHeight)
     +-- Calculate movement direction (WASD + camera yaw)
     +-- Apply acceleration / deceleration
     +-- Apply gravity + jump
     +-- Integrate position
     +-- Ground clamp (step-snap for stairs)
     +-- resolveCollisions(position, obstacles)
     +-- Update animation (idle/walk/run)

  4. cameraController.update(delta, input, player, collisionMeshes)
     +-- Calculate desired position (spherical coords)
     +-- Raycast backward to find walls
     +-- Pull camera in front of walls
     +-- Smooth lerp to desired position

  5. renderer.render(scene, camera)
}
```

### Teleport Flow

```
handleTeleport(teleporter):
  1. spaceManager.clear()           // remove ALL current objects from scene
  2. spaceManager.load(target)      // add target space's interior + child exteriors
  3. player.position = dest         // reposition player
  4. player.root.rotation = orient  // set facing direction
  5. player.velocity = (0,0,0)      // stop all movement
  6. snap to ground height          // prevent falling through floor
  7. teleportCooldown = 1.0         // global cooldown (prevents loop)
```

---

## 5. Player System

**File:** `src/Player.js`

### Constants

- `COLLISION_RADIUS = 0.45` - player horizontal collision radius
- `COLLISION_HEIGHT = 1.8` - player vertical collision height
- `HEAD_HEIGHT = 1.55` - camera look target height
- `WALK_SPEED = 3.2` m/s
- `SPRINT_MULTIPLIER = 1.8`

### Physics

- Smooth acceleration/deceleration (exponential ease, ACCELERATION = 12)
- Gravity: -20 m/s^2
- Jump speed: 8 m/s
- Step-snap: exponential ease for stair climbing (smoothing = 18), epsilon snap (0.01m)
- `STEP_SNAP_MAX_GAP = 0.5` - above this, snap instantly (landing drop)

### Model Loading

- Loads `assets/adventurer.glb` via GLTFLoader
- Normalizes to 1.8m tall
- Shows placeholder capsule while loading
- Animations: idle, walk, run (blended via AnimationMixer)

### Key Methods

- `update(delta, input, cameraYaw, obstacles, getGroundHeight)` - full physics + collision
- `position` - getter for `root.position`
- `headHeight` - camera look target

---

## 6. Collision System

**File:** `src/Collision.js`

### How It Works

Pure function: `resolveCollisions(position, radius, height, obstacles)`

1. Creates player AABB from position + radius + height
2. For each obstacle box:
   - Check intersection
   - Calculate overlap on X, Y, Z axes
   - Push out along axis of minimum penetration
   - Update playerBox for subsequent checks

### Obstacle Types

| Context | Source | Format |
|---------|--------|--------|
| **World** | Tree trunks (`userData.collide`) | `{mesh, box}` |
| **World** | House walls (manual collision boxes) | `{mesh: null, box}` |
| **House interior** | Furniture (`userData.collide`) | `{mesh, box}` |

House walls use manual collision boxes. The south wall is split around the door gap:

```
  West wall (full)
  East wall (full)
  North wall (full)
  South wall left (west of door)
  South wall right (east of door)
  South wall above door (lintel)
```

---

## 7. Camera System

**File:** `src/CameraController.js`

### How It Works

Third-person GTA-style camera:

1. **Look target** = player position + (0, HEAD_HEIGHT, 0)
2. **Desired position** = target + direction * DISTANCE (spherical: yaw + pitch)
3. **Wall detection** = raycast from target backward along camera direction
4. **Collision response** = if wall hit, pull camera to hit distance - margin
5. **Smooth follow** = lerp to desired position (snap-in when wall pushes closer)

### Constraints

- Pitch: clamped to [-0.6, 1.2] radians
- Min height above ground: 0.5m
- Camera collision margin: 0.25m
- Collision meshes: raw THREE.Object3D (filtered from obstacles, nulls removed)

---

## 8. House & Interior System

### Player House (`src/house/AshHouse/`)

Key constants:

```
HOUSE_ORIGIN = (300, 0, 300)     // interior placed far from world
FLOOR_WIDTH = 12, FLOOR_DEPTH = 10
WALL_HEIGHT = 3.6
FLOOR2_HEIGHT = 3.9              // second floor height
FLOOR_SLAB_THICK = 0.3

L-Shaped Staircase:
  Flight A: 6 steps, X: -5 to -1.7, Z: -3.5 to 0.5
  Landing:  X: -1.7 to 1.7, Z: -3.5 to 0.5
  Flight B: 7 steps, X: 1.7 to 5, Z: 0.5 to 4.5
```

### AshHouse.js Exports

- `createHouseSpace({name, worldPosition, wallColor, roofColor, rotation})` - returns a Space
- `createHouseTeleporters(houseSpace, doorWorldPosition, doorDirection, worldSpace)` - returns `{entry, exit}`

### Furniture Layout

**Ground Floor:** TV (NW corner), Cupboard (west wall), Dining set (center-west), Sink (south wall), Plants (flanking door)

**Second Floor:** Bed (NW corner), Cupboard (south wall), TV (west wall), Computer desk (east wall)

### Ground Height Function

`getGroundHeight(worldX, worldZ)` transforms world coordinates to house-local, checks which stair region the player is in, returns the appropriate Y height.

---

## 9. Teleporter System

### Per-House Teleporters

**Entry (world -> house):**
```
triggerPosition: doorWorldPosition + doorDirection * 1.0  (outside, near door)
position:        HOUSE_ORIGIN                              (room center)
orientation:     Math.PI                                   (facing into room)
radius:          1.2
```

**Exit (house -> world):**
```
triggerPosition: HOUSE_ORIGIN + HALF_D - 1.0               (inside, near door)
position:        doorWorldPosition - doorDirection * 3.0   (outside, far from door)
orientation:     0                                          (facing house)
radius:          1.2
```

### Why the Distances Matter

- Entry spawn at room center (300,0,300) - away from exit trigger at door
- Exit spawn 3.0m outside door - outside entry trigger zone (radius 1.2)
- Prevents the entry/exit loop

### Cooldown System

- **Global cooldown**: 1.0 seconds after any teleport
- **Individual cooldown**: 0.8 seconds per teleporter

---

## 10. Component System

### Pattern

Every component: `ComponentName.js` + `config.js`

```
src/components/
  shared.js           // COLORS palette, addShadow(), makeBox(), at()
  Bed/
    Bed.js            // buildBed(group, x, z, y)
    config.js         // dimensions, colors
  TV/
    TV.js             // buildTV(group, x, z, y, facing)
    config.js
  Stairs/
    Stairs.js         // buildStairsVisual(), getGroundHeight()
    config.js
  ... (23 total)
```

### shared.js Utilities

- `COLORS` - centralized color palette
- `addShadow(mesh)` - enables castShadow + receiveShadow
- `makeBox(w, h, d, color)` - creates a standard material box mesh
- `at(mesh, x, y, z)` - positions a mesh and returns it

### Component List

| Category | Components |
|----------|-----------|
| **Furniture** | TV, Plant, Cupboard, DiningSet, Sink, Bed, ComputerDesk, Table, Pokeball |
| **Nature** | Grass, Tree, Water |
| **Structure** | Banner, Shelter, Chimney, Mailbox, Sign, WindowBox, Fence |
| **House Structure** | Floor, Walls, Roof, Door, Stairs |
| **Lab** | LabShelf, LabMachine, LabDesk, LabPlant |

---

## 11. Editor System

### Entry: `editor.html` + `src/EditorApp.js`

| File | Purpose |
|------|---------|
| `EditorApp.js` | Bootstrap, scene setup (grid, sea, lighting), animation loop |
| `EditorPalette.js` | Left sidebar - tool list + saved models |
| `EditorPlacement.js` | Click-to-place parts, selection, snap-to-grid (0.5m) |
| `EditorInspector.js` | Right panel - position/rotation/scale/color fields |
| `EditorCameraPan.js` | WASD panning + keyboard shortcuts |

### Keyboard Shortcuts

| Key | Action |
|-----|--------|
| Arrow keys | Move selected part (XZ) |
| Shift+Up/Down | Move vertically (Y) |
| R/F | Rotate |
| +/- | Scale |
| Delete/Backspace | Remove selected |
| Ctrl+D | Duplicate |
| Escape | Deselect / disarm transform gizmo |

### Editor vs Game

- Editor has no player character
- Editor uses OrbitControls (orbit camera)
- Editor shows grid + sea around build area
- Game uses third-person camera + WASD movement

---

## 12. Model Store System

### Files

- `src/ModelStore.js` - CRUD for localStorage, export/import JSON
- `src/ModelLoader.js` - converts saved models to THREE.Group
- `src/PartKit.js` - builds mesh for individual parts

### Data Model

```javascript
{
  id: "uuid",
  name: "My Model",
  parts: [
    { type: "box", position: [0,0,0], rotation: [0,0,0], scale: [1,1,1], color: "#ff0000" },
    { type: "tv", position: [2,0,1], rotation: [0,Math.PI,0], scale: [1,1,1] },
    { type: "ref", modelId: "other-model-id", position: [0,3,0], scale: [0.5,0.5,0.5] },
  ]
}
```

### Part Types

- **Primitives**: box, wall, roof, cylinder
- **House parts**: tv, plant, bed, sink, etc. (all 23 components)
- **References**: ref (model referencing another saved model, max depth 6)

### Model Resolution

`resolveModelParts(modelId, allModels, rootTransform, options)`:
- Recursively resolves ref parts
- Composes transforms (Y-rotation + uniform scale)
- Circular reference detection
- Max depth: 6 levels

---

## 13. Data Flow

### Teleport: World to House

```
Player walks near door trigger zone
  -> entry.updateTrigger(player) returns true
  -> handleTeleport(entry)
     -> spaceManager.clear()       // Remove: ground, paths, trees, house exteriors
     -> spaceManager.load(house)   // Add: house.interior (furniture, stairs, floor)
     -> player.position = (300, 0, 300)    // room center
     -> player.rotation = Math.PI           // face into room
     -> player.velocity = (0, 0, 0)
     -> snap to ground height
     -> teleportCooldown = 1.0
```

### Teleport: House to World

```
Player walks near exit trigger zone (inside house, near door)
  -> exit.updateTrigger(player) returns true
  -> handleTeleport(exit)
     -> spaceManager.clear()       // Remove: house.interior
     -> spaceManager.load(world)   // Add: ground, paths, trees, house exteriors
     -> player.position = (-14, 0, -13)    // outside door
     -> player.rotation = 0                  // face house
     -> player.velocity = (0, 0, 0)
     -> snap to ground height (0)
     -> teleportCooldown = 1.0
```

### Player Movement Pipeline

```
Input (WASD + Shift + Space)
  -> Calculate input direction (relative to camera yaw)
  -> Target velocity = direction * speed
  -> Accelerate toward target (exponential ease)
  -> Apply gravity (-20 m/s^2)
  -> Integrate position += velocity * delta
  -> Ground clamp (step-snap for stairs)
  -> resolveCollisions(position, obstacles)
  -> Update animation state (idle/walk/run)
```

### Camera Pipeline

```
Look target = player.position + (0, HEAD_HEIGHT, 0)
  -> Desired position = target + sphericalDirection * DISTANCE
  -> Raycast backward from target to find walls
  -> If wall hit: pull camera to hitDist - MARGIN
  -> Lerp to desired position
  -> Clamp min height above ground
```

---

## 14. How to Extend

### Add a New House

1. Add entry to `HOUSES` in `src/constants/game.js`
2. In `World.js`, `createHouseSpace()` creates the Space
3. `createHouseTeleporters()` creates entry/exit teleporters
4. The house reuses the AshHouse interior layout (or customize)

### Add a New Interactable

1. Create component in `src/components/NewThing/`
2. Add `buildNewThing(group, x, z, y)` function
3. Add to `BUILDERS` registry in `AshHouse.js`
4. Add to layout config in `config.js`
5. Add interactable data to `OBJECTS` in `constants/game.js`

### Add a New Space Type (e.g. TV Interior)

1. Create Space with exterior + interior
2. Add as child of house Space: `house.addChild(tvSpace)`
3. Create Teleporter with type "action"
4. Wire to key press in game loop

### Constants Reference

| Constant | Value | Location |
|----------|-------|----------|
| COLLISION_RADIUS | 0.45 | Player.js |
| COLLISION_HEIGHT | 1.8 | Player.js |
| HOUSE_ORIGIN | (300, 0, 300) | AshHouse/constants.js |
| FLOOR2_HEIGHT | 3.9 | AshHouse/constants.js |
| WALK_SPEED | 3.2 | Player.js |
| GRAVITY | -20 | Player.js |
| SPAWN_POSITION | (0, 0, 0) | constants/game.js |
| GROUND_SIZE | 200 | constants/game.js |
| TREE_COUNT | 16 | constants/game.js |
