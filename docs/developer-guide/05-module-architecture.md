# Module Architecture

## Module Map

```
src/
├── main.js                 # Play mode entry + game loop + interaction
├── EditorApp.js            # Editor mode entry + render loop
├── World.js                # BUILDERS registry, Space hierarchy, obstacles
├── Player.js               # Player character class
├── Input.js                # Input manager class
├── CameraController.js     # Camera controller class
├── Collision.js            # Collision resolution with step-snap
├── HousePartBuilder.js     # House part builder registry (editor)
├── PartKit.js              # Primitive part builders
├── ModelStore.js           # Model persistence (localStorage)
├── config/
│   ├── index.js            # Barrel export
│   ├── objTypes.js         # OBJ enum (28 types)
│   ├── colors.js           # COLORS palette (18 colors)
│   ├── actions.js          # ACTIONS enum (MESSAGE, GIVE_ITEM, CHANGE_SPACE)
│   ├── spaces.js           # SPACES enum (4 spaces)
│   ├── world.js            # WORLD constants
│   └── houses.js           # HOUSES registry
├── engine/
│   ├── Space.js            # Recursive scene node
│   ├── SpaceManager.js     # Context swap (clear + load)
│   ├── Teleporter.js       # Trigger/action teleporter
│   └── index.js            # Barrel export
├── house/
│   ├── AshHouse/           # config.js + constants.js
│   ├── GaryHouse/          # config.js + constants.js
│   └── OakLab/             # config.js + constants.js
├── components/             # 28 component builders
│   ├── shared.js           # addShadow() helper
│   ├── Bed/ TV/ Table/ Chair/ Plant/ Sink/ Cupboard/ ...
│   └── (each: ComponentName.js + config.js)
└── Editor*.js              # Editor modules (5 files)
```

## Module Categories

### Entry Points

| Module | Purpose |
|--------|---------|
| `main.js` | Creates renderer, scene, camera, lights; instantiates all game systems; runs game loop with interaction detection |
| `EditorApp.js` | Creates renderer, scene, camera, orbit controls; initializes editor modules; runs render loop |

### Engine

| Module | Purpose | Depends On |
|--------|---------|------------|
| `engine/Space.js` | Recursive scene node with exterior, interior, children, data | `three` |
| `engine/SpaceManager.js` | Handles scene context swaps (clear + load) | `Space.js` |
| `engine/Teleporter.js` | Entry/exit between spaces (circular or rectangular triggers) | `three` |

### Config

| Module | Purpose | Depends On |
|--------|---------|------------|
| `config/objTypes.js` | OBJ enum — 28 object type string constants | none |
| `config/colors.js` | COLORS hex palette (18 material colors) | none |
| `config/actions.js` | ACTIONS enum (MESSAGE, GIVE_ITEM, CHANGE_SPACE) | none |
| `config/spaces.js` | SPACES enum (WORLD, ASH_HOUSE, GARY_HOUSE, OAK_LAB) | none |
| `config/world.js` | WORLD constants (ground size, spawn, fog, space list) | `three`, `spaces.js` |
| `config/houses.js` | HOUSES registry (imports house configs) | `house/*/config.js` |

### Game Logic

| Module | Purpose | Depends On |
|--------|---------|------------|
| `World.js` | BUILDERS registry (29 builders), builds Space hierarchy, resolves teleporter targets, creates obstacles | `engine/*`, `config/*`, `house/*/config.js`, `components/*` |
| `Player.js` | Player movement, physics, animation, GLTF model loading | `Collision.js`, `three` |
| `Collision.js` | Stateless AABB collision resolution with `canStandOn` step-snap | `three` (Box3 only) |
| `main.js` | Interaction detection, action handling, message HUD, teleport dispatch | `World.js`, `Player.js`, `Input.js`, `CameraController.js` |

### Rendering

| Module | Purpose | Depends On |
|--------|---------|------------|
| `components/*` | 28 individual THREE.js builders (Bed, TV, Table, Tree, etc.) | `three` |
| `PartKit.js` | Primitive part builders (box, wall, roof, cylinder) | `three` |
| `HousePartBuilder.js` | Wraps component builders for editor placement | `components/*`, `PartKit.js` |

### Input/Camera

| Module | Purpose | Depends On |
|--------|---------|------------|
| `Input.js` | Keyboard/mouse input manager with edge detection | DOM events |
| `CameraController.js` | Third-person camera with wall collision raycasting | `three` (Raycaster) |

### Editor

| Module | Purpose | Depends On |
|--------|---------|------------|
| `EditorPalette.js` | Renders tool cards + saved model list; wires toolbar buttons | `ModelStore.js`, `EditorPlacement.js` |
| `EditorPlacement.js` | Raycasts clicks, snaps to grid, places parts | `PartKit.js`, `ModelStore.js`, `HousePartBuilder.js` |
| `EditorInspector.js` | Renders property panel for selected part | `EditorPlacement.js` |
| `EditorCameraPan.js` | WASD camera panning (independent of OrbitControls) | `three` |

### Data Layer

| Module | Purpose | Depends On |
|--------|---------|------------|
| `ModelStore.js` | CRUD operations on localStorage; model composition/reference resolution | `localStorage` |
