# Pokemon 3D Game — Codebase Documentation

A Pokemon FireRed/LeafGreen-inspired 3D world built with Three.js (v0.169.0), using ES modules with no build tool, served via `python3 -m http.server`.

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Architecture](#2-architecture)
3. [Config System](#3-config-system)
4. [Engine: Space System](#4-engine-space-system)
5. [House System](#5-house-system)
6. [Game Flow](#6-game-flow)
7. [Player System](#7-player-system)
8. [Collision System](#8-collision-system)
9. [Camera System](#9-camera-system)
10. [Interaction System](#10-interaction-system)
11. [Teleporter System](#11-teleporter-system)
12. [World Builder (BUILDERS)](#12-world-builder-builders)
13. [Component System](#13-component-system)
14. [Editor System](#14-editor-system)
15. [Model Store System](#15-model-store-system)
16. [How to Extend](#16-how-to-extend)

---

## 1. Project Overview

Two applications share one codebase:

| Application | Entry HTML | Entry JS | Purpose |
|-------------|-----------|----------|---------|
| **Game** | `index.html` | `src/main.js` | Play mode — explore world, enter houses, interact |
| **Model Builder** | `editor.html` | `src/EditorApp.js` | Visual editor — place parts, save models |

### File Structure

```
pokemon/
  index.html                      # Game entry
  editor.html                     # Editor entry
  style.css                       # Shared styles
  dev.sh                          # HTTP server launcher (port 8934)
  assets/
    adventurer.glb                # Player 3D model (CC0 by Quaternius)
  src/
    main.js                       # Game bootstrap, loop, interaction, HUD
    World.js                      # BUILDERS registry, Space hierarchy, obstacles
    Player.js                     # Player character, physics, GLTF model
    Input.js                      # Keyboard/mouse input (WASD, E, Space, Shift)
    CameraController.js           # Third-person camera with wall collision
    Collision.js                  # AABB collision with step-snap logic
    HousePartBuilder.js           # House part builder registry (editor)
    PartKit.js                    # Part mesh builder (editor primitives)
    ModelStore.js                 # localStorage save/load, JSON export/import
    EditorApp.js                  # Editor application entry
    EditorCameraPan.js            # Editor camera panning
    EditorInspector.js            # Editor property inspector
    EditorPalette.js              # Editor object palette
    EditorPlacement.js            # Editor object placement
    config/
      index.js                    # Barrel export for all config
      objTypes.js                 # OBJ enum — all object type constants
      colors.js                   # COLORS hex palette
      actions.js                  # ACTIONS enum (MESSAGE, GIVE_ITEM, CHANGE_SPACE)
      spaces.js                   # SPACES enum (WORLD, ASH_HOUSE, GARY_HOUSE, OAK_LAB)
      world.js                    # WORLD constants (ground, trees, spawn, fog, space list)
      houses.js                   # HOUSES registry (imports from house/*/config.js)
    engine/
      Space.js                    # Recursive scene node (exterior/interior/children)
      SpaceManager.js             # Context swap (clear + load)
      Teleporter.js               # Trigger/action teleporter (circular + rectangular)
      index.js                    # Barrel export
    house/
      AshHouse/
        config.js                 # Full layout: exterior, interior, teleporters, actions
        constants.js              # Building dimensions, staircase math, world origin
      GaryHouse/
        config.js                 # Mirrored layout, blue roof, different flavor text
        constants.js              # Mirrored dimensions, staircase math
      OakLab/
        config.js                 # Long 14x24 lab, flat roof, lab furniture, actions
        constants.js              # Building dimensions, world origin
    components/                   # 28 component subdirectories
      shared.js                   # addShadow() helper
      Bed/ TV/ Stairs/ Tree/ Plant/ Sink/ Cupboard/ DiningSet/
      ComputerDesk/ Table/ Chair/ KitchenCounter/ Pokeball/
      LabShelf/ LabMachine/ LabDesk/ LabPlant/
      Floor/ Walls/ Roof/ Door/ Window/ Banner/ Chimney/
      Mailbox/ Sign/ WindowBox/ Fence/ Grass/ Water/ Shelter/
      (each: ComponentName.js + config.js)
```

---

## 2. Architecture

### Core Concept: Spaces

Everything in the game world is a **Space**. A Space has:

- **exterior** — what you see when looking at it from outside (parent context)
- **interior** — what you see when you are inside it
- **children** — sub-spaces that can be entered

```
World Space (name: "WORLD")
  interior: [ground, trees]
  children:
    ASH_HOUSE Space
      exterior: [walls, roof, door]  (at world position [-5, 0, -8])
      interior: [furniture, stairs, 2 floors]
    GARY_HOUSE Space
      exterior: [walls, roof, door]  (at world position [5, 0, -8])
      interior: [furniture, stairs, 2 floors]
    OAK_LAB Space
      exterior: [walls, flat roof]   (at world position [0, 0, 25])
      interior: [lab equipment, pokeballs, long room]
  teleporters: [entry/exit for each house]
```

### What `getInsideObjects()` Returns

When you are inside a space, you see:

```
this.interior + all children[*].exterior
```

- **World**: ground, trees + house shells
- **House**: furniture, stairs, floors (no children, so just interior)

### Config-Driven Houses

Each house is defined by a config object in `src/house/*/config.js`:

```javascript
export const ASH_HOUSE = {
  name: "Ash's House",
  exterior: {
    position: [-5, 0, -8],           // world position
    facing: DIRECTIONS.SOUTH,
    objects: [                        // built by BUILDERS registry
      { type: OBJ.HOUSE, position: [0,0,0], config: { width:6, depth:6, ... } },
    ],
  },
  interior: {
    origin: [300, 0, 300],           // interior world offset
    objects: [
      { type: OBJ.GROUND_FLOOR, position: [0,0,0], config: { width:12, depth:10 } },
      { type: OBJ.WALLS, position: [0,0,0], collide: true, config: { ... } },
      { type: OBJ.TV, position: [-5, 0, -4.5], collide: true,
        action: msg("Watch TV", "The news is on...") },
      // ... more furniture
    ],
  },
  teleporters: [
    { triggerSpace: "WORLD", triggerPosition: [...], targetSpace: "ASH_HOUSE", ... },
    { triggerSpace: "ASH_HOUSE", triggerPosition: [...], targetSpace: "WORLD", ... },
  ],
};
```

### SPACE_LOOKUP Pattern

Teleporters reference spaces by string name. After all spaces are created, targets are resolved:

```javascript
export const SPACE_LOOKUP = {};
SPACE_LOOKUP["WORLD"] = world;
SPACE_LOOKUP["ASH_HOUSE"] = houseSpace;
// ... resolve teleporter targets
tp.entry.target = SPACE_LOOKUP[tp.config.targetSpace];
```

---

## 3. Config System

All configuration lives in `src/config/`:

| File | Exports | Purpose |
|------|---------|---------|
| `objTypes.js` | `OBJ` | 28 object type string constants |
| `colors.js` | `COLORS` | 18 hex color constants |
| `actions.js` | `ACTIONS` | 3 action types: MESSAGE, GIVE_ITEM, CHANGE_SPACE |
| `spaces.js` | `SPACES` | 4 space names: WORLD, ASH_HOUSE, GARY_HOUSE, OAK_LAB |
| `world.js` | `WORLD` | Ground size, tree count, spawn position, fog, space list |
| `houses.js` | `HOUSES` | Registry mapping space names to house configs |
| `index.js` | barrel | Re-exports all of the above |

### OBJ Types

| Category | Types |
|----------|-------|
| **Structure** | HOUSE, GROUND_FLOOR, FLOOR_SLAB, FLOOR_WITH_HOLE, WALLS, ROOF, CEILING, DOOR_FRAME, WINDOW, STAIRS, STAIR_STEP, RAILING |
| **Furniture** | TV, BED, SINK, CUPBOARD, DINING_SET, PLANT, COMPUTER_DESK, TABLE, KITCHEN_COUNTER, VISUAL_STAIRS, CHAIR |
| **Nature** | TREE, GRASS, WATER |
| **Lab** | LAB_SHELF, LAB_MACHINE, LAB_DESK, LAB_PLANT, POKEBALL |

### WORLD Constants

| Constant | Value | Description |
|----------|-------|-------------|
| GROUND_SIZE | 800 | World ground plane size |
| TREE_COUNT | 0 | Trees spawned (0 = disabled) |
| SPAWN_POSITION | (0, 0, 0) | Player starting position |
| BACKGROUND_COLOR | 0x87ceeb | Sky blue |
| FOG_NEAR / FOG_FAR | 60 / 160 | Distance fog range |

---

## 4. Engine: Space System

### Space (`src/engine/Space.js`)

Recursive scene node. Each Space has exterior, interior, children, and data.

```javascript
const house = new Space({ name: "ASH_HOUSE" });
house.exterior = [wallsMesh, roofMesh];       // seen from world
house.interior = [bedMesh, tableMesh];        // seen when inside
house.data = { obstacles, interactables };    // collision + interaction data

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
sm.load(house);     // adds house.interior
sm.getCurrent();    // returns active space
```

### Teleporter (`src/engine/Teleporter.js`)

Connects spaces. Supports two shapes and two trigger modes:

| Shape | Config | Detection |
|-------|--------|-----------|
| **Circular** | `radius` | `distance(player, trigger) < radius` |
| **Rectangular** | `width`, `depth` | `|dx| <= width/2 && |dz| <= depth/2` |

| Type | Entry | Exit | Example |
|------|-------|------|---------|
| **trigger** | Auto (collision zone) | Auto (collision zone) | Door |
| **action** | Manual (press E) | Manual (press E) | TV screen |

Key fields:
- `triggerPosition` — where collision is checked (source zone)
- `position` — where player appears (destination)
- `target` — the Space to enter
- `radius` / `width` / `depth` — trigger zone size
- `orientation` — player rotation on arrival

---

## 5. House System

### Three Houses

| House | World Position | Interior Origin | Size | Roof | Features |
|-------|---------------|-----------------|------|------|----------|
| **Ash's House** | [-5, 0, -8] | [300, 0, 300] | 6×6 exterior, 12×10 interior | Pyramid (red) | 2 floors, L-shaped stairs, TV, kitchen |
| **Gary's House** | [5, 0, -8] | [400, 0, 300] | 6×6 exterior, 12×10 interior | Pyramid (blue) | Mirrored layout, direction -1 stairs |
| **Oak's Lab** | [0, 0, 25] | [500, 0, 300] | 14×24 exterior, 14×24 interior | Flat (gray-blue) | Long room, lab equipment, pokeballs |

### AshHouse Interior (2 floors)

**Ground floor (z: -5 to +5):**
- North wall: Sink, Cupboard, TV
- Center: Table + 4 chairs
- South wall: Plants flanking door
- East wall: L-shaped staircase (direction 1)

**First floor (y ≈ 4.75):**
- Bed (NW corner)
- Computer desk (west wall)
- TV (south section)
- Plants, table
- Floor with hole for staircase
- Railing around hole

### GaryHouse Interior (2 floors)

Mirrored from AshHouse:
- Staircase on LEFT (west), direction -1
- Furniture on RIGHT (east) to avoid staircase hole
- Blue roof, different flavor text

### OakLab Interior (single floor, 14×24)

Long room matching FireRed layout:

| Zone | z | Furniture |
|------|---|-----------|
| Back wall (N) | -11 | Bookshelf, Computer desk, Large machine |
| Mid-back | -7, -5 | Two bookshelves (west wall) |
| Center | -2 | Pokemon table (3.0 wide) + 3 Poké Balls |
| Mid-front | +4 | Two lab desks (left & right) |
| Front | +8 | Two cabinets (left & right) |
| Entrance | +11 | Two plants flanking door |
| West side | +1 | Observation machine |

---

## 6. Game Flow

### Startup Sequence

```
main.js
  |
  +-- createWorld(scene)                    [World.js]
  |     +-- new Space("WORLD")
  |     +-- Add ground, trees to world.interior
  |     +-- For each house in WORLD.objects:
  |     |     +-- new Space(name)
  |     |     +-- buildExteriorObjects(house.exterior.objects)
  |     |     +-- Offset exterior to house.exterior.position
  |     |     +-- world.addChild(houseSpace)
  |     |     +-- SPACE_LOOKUP[name] = houseSpace
  |     |     +-- buildInteriorObjects(house.interior.objects, origin)
  |     |     +-- Collect obstacles, interactables
  |     |     +-- buildTeleporters(house.teleporters)
  |     |
  |     +-- resolveTeleportTargets(allTeleporters)
  |     +-- new SpaceManager(scene)
  |     +-- spaceManager.load(world)
  |     +-- buildWorldObstacles(world)
  |
  +-- spaceManager.load(SPACE_LOOKUP["WORLD"])
  +-- new Player(scene, spawnPosition)
  +-- new InputManager(canvas)
  +-- new CameraController(camera)
  +-- animate() loop starts
```

### Per-Frame Update Order

```
animate() {
  1. input.update()

  2. if teleportCooldown <= 0:
     for each teleporter:
       if distance(player, trigger) < radius:
         handleTeleport(target, spawn, orientation)

  3. Interaction: find nearest interactable within INTERACT_RANGE (2.0)
     Show/hide prompt HUD
     If E pressed: handleAction(action)

  4. Message timer countdown (3s duration)

  5. player.update(delta, input, yaw, obstacles, getGroundHeight)
     +-- WASD movement relative to camera yaw
     +-- Acceleration/deceleration (exponential ease)
     +-- Gravity + jump
     +-- Ground clamp + step-snap for stairs
     +-- resolveCollisions(position, obstacles)
     +-- Animation state (idle/walk/run)

  6. cameraController.update(delta, input, player, collisionMeshes)
     +-- Spherical coords from yaw/pitch
     +-- Raycast backward for wall collision
     +-- Smooth lerp follow

  7. Debug HUD: space name + player position

  8. renderer.render(scene, camera)
}
```

### Teleport Flow

```
handleTeleport(targetSpaceName, spawnPos, spawnOrientation):
  1. targetSpace = SPACE_LOOKUP[targetSpaceName]
  2. spaceManager.clear()           // remove ALL current objects
  3. spaceManager.load(targetSpace) // add target interior + child exteriors
  4. player.position = spawnPos
  5. player.velocity = (0,0,0)
  6. player.facingAngle = spawnOrientation
  7. snap to ground height
  8. teleportCooldown = 1.0
  9. inputLockTimer = 0.2           // prevent immediate re-trigger
```

---

## 7. Player System

**File:** `src/Player.js`

### Constants

| Constant | Value | Description |
|----------|-------|-------------|
| COLLISION_RADIUS | 0.45 | Horizontal collision radius |
| COLLISION_HEIGHT | 1.8 | Vertical collision height |
| WALK_SPEED | 3.2 | Base walk speed (m/s) |
| SPRINT_MULTIPLIER | 1.8 | Sprint speed multiplier |
| GRAVITY | -20 | Gravity (m/s²) |
| JUMP_SPEED | 8 | Jump velocity (m/s) |
| MAX_STEP_UP | 0.5 | Maximum step height for stair climbing |
| STEP_SNAP_EPSILON | 0.01 | Snap threshold for step surface |

### Physics

- Smooth acceleration/deceleration (exponential ease, ACCELERATION = 12)
- Gravity: -20 m/s²
- Jump speed: 8 m/s
- Step-snap: exponential ease for stair climbing (smoothing = 18)
- `STEP_SNAP_MAX_GAP = 0.5` — above this, snap instantly (landing drop)

### Model Loading

- Loads `assets/adventurer.glb` via GLTFLoader
- Normalizes to 1.8m tall
- Shows placeholder capsule while loading
- Animations: idle, walk, run (blended via AnimationMixer)

---

## 8. Collision System

**File:** `src/Collision.js`

### How It Works

`resolveCollisions(position, radius, height, obstacles)`

1. Creates player AABB from position + radius + height
2. For each obstacle box:
   - Check intersection
   - Calculate overlap on X, Y, Z axes
   - If `canStandOn` and obstacle height ≤ `MAX_STEP_HEIGHT` (0.5):
     - Snap player to step surface
   - Else: push out along axis of minimum penetration via `pushHorizontally()`
3. Rebuild playerBox for subsequent checks

### `pushHorizontally()` Helper

```javascript
function pushHorizontally(position, box, overlapX, overlapZ) {
  if (overlapX < overlapZ) {
    // Push along X away from box center
    position.x += position.x < centerBox ? -overlapX : overlapX;
  } else {
    // Push along Z away from box center
    position.z += position.z < centerBox ? -overlapZ : overlapZ;
  }
}
```

### Obstacle Types

| Context | Source | Format |
|---------|--------|--------|
| **World** | Tree trunks (`userData.collide`) | `{mesh, box}` |
| **World** | House walls (manual collision boxes) | `{mesh: null, box}` |
| **Interior** | Furniture (`userData.collide`) | `{mesh, box, canStandOn}` |
| **Interior** | Stair steps (`userData.canStandOn`) | `{mesh, box, canStandOn: true}` |

### `canStandOn` Logic

When an obstacle has `canStandOn: true` and height ≤ 0.5:
- Player feet within 0.05 of surface → snap up
- Step distance ≤ 0.5 → snap up
- Player inside XZ footprint → push down to sit on top
- Otherwise → horizontal push

---

## 9. Camera System

**File:** `src/CameraController.js`

### How It Works

Third-person GTA-style camera:

1. **Look target** = player position + (0, HEAD_HEIGHT, 0)
2. **Desired position** = target + direction × DISTANCE (spherical: yaw + pitch)
3. **Wall detection** = raycast from target backward along camera direction
4. **Collision response** = if wall hit, pull camera to hit distance − margin
5. **Smooth follow** = lerp to desired position (snap-in when wall pushes closer)

### Constraints

- Pitch: clamped to [-0.6, 1.2] radians
- Min height above ground: 0.5m
- Camera collision margin: 0.25m
- Collision meshes: `userData.collide || userData.cameraCollide`

---

## 10. Interaction System

**File:** `src/main.js`

### How It Works

Each frame:

1. Iterate `currentSpace.data.interactables`
2. Find nearest object within `INTERACT_RANGE` (2.0 units)
3. If found: show prompt HUD with `action.prompt` text
4. If E pressed: call `handleAction(action)`

### Action Types

| Type | Handler | Behavior |
|------|---------|----------|
| `ACTIONS.MESSAGE` | `showMessage(message)` | Display text for 3 seconds |
| `ACTIONS.GIVE_ITEM` | `showMessage(message)` | Display text for 3 seconds |
| `ACTIONS.CHANGE_SPACE` | `handleTeleport(...)` | Teleport to target space |

### Object Config Pattern

Furniture with interaction:

```javascript
{
  type: OBJ.TV,
  position: [-5, 0, -4.5],
  collide: true,
  action: {
    type: ACTIONS.MESSAGE,
    prompt: "Watch TV",           // shown in prompt HUD
    message: "The news is on...", // shown for 3 seconds on E press
  },
}
```

### How Interactables Are Collected

In `World.js`, `buildWorldSpace()` traverses interior objects:
- If `obj.userData.collide` → added to obstacles
- If `obj.userData.action` → added to interactables
- Both stored on `houseSpace.data`

---

## 11. Teleporter System

### Config Pattern

Each house defines entry/exit teleporters:

```javascript
teleporters: [
  {
    triggerSpace: "WORLD",              // source space name
    triggerPosition: [0, 0, -6.0],      // where to check collision (world coords)
    triggerWidth: 1.8,                  // rectangular trigger width (X)
    triggerDepth: 0.1,                  // rectangular trigger depth (Z)
    targetSpace: "ASH_HOUSE",           // destination space name
    spawnPosition: [300, 0, 303.8],     // where player appears
    spawnOrientation: Math.PI,          // player facing direction
  },
  // ... exit teleporter
]
```

### Why Rectangular Triggers

Door teleporters use thin rectangular zones (1.8 × 0.1) placed 1–2 units outside the door threshold. This prevents:
- Entry/exit loops (spawn outside the other trigger)
- Accidental triggers from inside

### Cooldown System

- **Global cooldown**: 1.0 seconds after any teleport
- **Per-teleporter cooldown**: 0.8 seconds
- **Input lock**: 0.2 seconds (prevents drift after teleport)

---

## 12. World Builder (BUILDERS)

**File:** `src/World.js`

The `BUILDERS` registry maps OBJ type strings to builder functions:

```javascript
BUILDERS[OBJ.TV] = (mesh, cfg) => { ... };
BUILDERS[OBJ.TABLE] = (mesh, cfg) => { ... };
// ... 29 builders total
```

Each builder creates Three.js geometry and adds it to the given `mesh` (THREE.Group).

### Registered Builders

| Builder | Description |
|---------|-------------|
| GROUND_FLOOR | PlaneGeometry floor (wood material) |
| WALLS | 4 walls with south-wall door gap |
| ROOF | Extruded triangle cross-section roof |
| CEILING | PlaneGeometry ceiling (facing down) |
| FLOOR_SLAB | Solid slab with canStandOn collision |
| FLOOR_WITH_HOLE | Extruded shape with rectangular hole |
| RAILING | Thin colliding box rail |
| DOOR_FRAME | 2 posts + lintel + door panel |
| WINDOW | Frame + glass + cross bars |
| TREE | Tree trunk + leaf canopy |
| PLANT | Cylinder pot + sphere leaves |
| CUPBOARD | Box body + 2 handles |
| DINING_SET | Table + 4 legs + 4 chairs |
| TABLE | Table top + 4 legs |
| TV | Stand + TV body + glowing screen |
| KITCHEN_COUNTER | Cabinet + countertop |
| VISUAL_STAIRS | 8 ascending box steps (decorative) |
| CHAIR | Seat + back + 4 legs |
| SINK | Cabinet + basin + faucet |
| BED | Frame + mattress + pillow + headboard |
| COMPUTER_DESK | Desk + legs + monitor |
| STAIR_STEP | Single step with optional side walls |
| STAIRS | Built from STAIR_STEP components (straight or L-shaped) |
| LAB_SHELF | Bookshelf body + 3 shelves of books |
| LAB_MACHINE | Dark box body + green indicator light |
| LAB_DESK | Desk + legs + monitor |
| LAB_PLANT | Alias → delegates to PLANT |
| POKEBALL | Red/white hemispheres + torus band + glowing button |
| HOUSE | Full exterior shell (walls + roof + door + windows) |

### Builder Config Options

The HOUSE builder supports:

| Option | Default | Description |
|--------|---------|-------------|
| width | 6 | Building width (X) |
| depth | 6 | Building depth (Z) |
| wallHeight | 3 | Wall height |
| roofHeight | 2.2 | Roof height (ignored if flatRoof) |
| wallColor | WALL_DEFAULT | Wall material color |
| roofColor | ROOF_DEFAULT | Roof material color |
| flatRoof | false | If true, box roof instead of pyramid |
| windows | [] | Array of window configs |

The STAIRS builder supports:

| Option | Default | Description |
|--------|---------|-------------|
| stepsPerFlight | 12 | Steps per flight |
| stepWidth | 1.5 | Step width |
| stepDepth | 0.3 | Step depth |
| stepHeight | 0.15 | Step height |
| direction | 1 | 1 = north-then-west, -1 = south-then-east |
| straight | false | Single flight vs L-shaped |
| sideWalls | true | Outer walls along flights |

---

## 13. Component System

### Pattern

Every component: `ComponentName.js` + `config.js`

```
src/components/
  shared.js           // addShadow() helper
  Bed/
    Bed.js            // buildBed(group, config)
    config.js         // dimensions, colors
  TV/
    TV.js
    config.js
  Stairs/
    Stairs.js
    config.js
  ... (28 total)
```

### Component List

| Category | Components |
|----------|-----------|
| **Furniture** | TV, Plant, Cupboard, DiningSet, Sink, Bed, ComputerDesk, Table, Chair, KitchenCounter, Pokeball |
| **Nature** | Grass, Tree, Water |
| **Structure** | Banner, Shelter, Chimney, Mailbox, Sign, WindowBox, Fence |
| **House Structure** | Floor, Walls, Roof, Door, Window, Stairs |
| **Lab** | LabShelf, LabMachine, LabDesk, LabPlant |

---

## 14. Editor System

### Entry: `editor.html` + `src/EditorApp.js`

| File | Purpose |
|------|---------|
| `EditorApp.js` | Bootstrap, scene setup (grid, sea, lighting), animation loop |
| `EditorPalette.js` | Left sidebar — tool list + saved models |
| `EditorPlacement.js` | Click-to-place parts, selection, snap-to-grid (0.5m) |
| `EditorInspector.js` | Right panel — position/rotation/scale/color fields |
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

## 15. Model Store System

### Files

- `src/ModelStore.js` — CRUD for localStorage, export/import JSON
- `src/PartKit.js` — builds mesh for individual parts

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
- **House parts**: tv, plant, bed, sink, etc. (all 28 components)
- **References**: ref (model referencing another saved model, max depth 6)

---

## 16. How to Extend

### Add a New House

1. Create `src/house/NewHouse/config.js` with exterior, interior, teleporters
2. Create `src/house/NewHouse/constants.js` with building dimensions
3. Add space name to `src/config/spaces.js`: `NEW_HOUSE: "NEW_HOUSE"`
4. Import config in `src/config/houses.js` and add to `HOUSES`
5. Add to space list in `src/config/world.js`: `objects: [..., SPACES.NEW_HOUSE]`

### Add a New Interactable

1. Add action to objects in house config:
```javascript
{
  type: OBJ.TABLE,
  position: [0, 0, 0],
  collide: true,
  action: {
    type: ACTIONS.MESSAGE,
    prompt: "Examine table",
    message: "A dusty old table.",
  },
}
```
2. Object is auto-collected as interactable if `action` is present

### Add a New OBJ Type

1. Add constant to `src/config/objTypes.js`: `NEW_TYPE: "newType"`
2. Register builder in `World.js`: `BUILDERS[OBJ.NEW_TYPE] = (mesh, cfg) => { ... }`
3. Use in house config: `{ type: OBJ.NEW_TYPE, position: [...] }`

### Add a New Space Type

1. Add to `src/config/spaces.js`
2. Create house config with exterior + interior
3. Add teleporters connecting to WORLD or other spaces
4. Register in houses.js and world.js

### Constants Reference

| Constant | Value | Location |
|----------|-------|----------|
| COLLISION_RADIUS | 0.45 | Player.js |
| COLLISION_HEIGHT | 1.8 | Player.js |
| WALK_SPEED | 3.2 | Player.js |
| GRAVITY | -20 | Player.js |
| SPAWN_POSITION | (0, 0, 0) | config/world.js |
| GROUND_SIZE | 800 | config/world.js |
| INTERACT_RANGE | 2.0 | main.js |
| TELEPORT_COOLDOWN | 1.0 | main.js |
