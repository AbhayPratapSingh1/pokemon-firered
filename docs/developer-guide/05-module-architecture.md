# Module Architecture

## Module Map

```
src/
├── main.js                 # Play mode entry + game loop
├── EditorApp.js            # Editor mode entry + render loop
├── World.js                # Town layout builder
├── Player.js               # Player character class
├── Input.js                # Input manager class
├── CameraController.js     # Camera controller class
├── Collision.js            # Collision resolution (stateless)
├── Buildings.js            # Building geometry factories
├── PlayerHouseInterior.js  # Two-story interior builder
├── InteractionManager.js   # Interaction system class
├── EditorPalette.js        # Editor tool/model list UI
├── EditorPlacement.js      # Editor part placement
├── EditorInspector.js      # Editor part property inspector
├── EditorCameraPan.js      # Editor camera panning
├── PartKit.js              # Primitive part builders
├── ModelStore.js           # Model persistence (localStorage)
└── ModelLoader.js          # Model → Three.js group builder
```

## Module Categories

### Entry Points

| Module | Purpose |
|--------|---------|
| `main.js` | Creates renderer, scene, camera, lights; instantiates all game systems; runs game loop |
| `EditorApp.js` | Creates renderer, scene, camera, orbit controls; initializes editor modules; runs render loop |

### Game Logic

| Module | Purpose | Depends On |
|--------|---------|------------|
| `World.js` | Builds ground, town layout, obstacles; places saved models | `Buildings.js`, `ModelStore.js`, `ModelLoader.js` |
| `Player.js` | Player movement, physics, animation, GLTF model loading | `Collision.js` |
| `Collision.js` | Stateless AABB collision resolution | `three` (Box3 only) |
| `PlayerHouseInterior.js` | Builds two-story house interior, door triggers, ground height | `Player.js` (exports COLLISION_RADIUS/HEIGHT) |
| `InteractionManager.js` | Proximity-based interaction system | `Input.js` (reads interactPressed) |

### Rendering

| Module | Purpose | Depends On |
|--------|---------|------------|
| `Buildings.js` | Factory functions: createHouse, createLab, createTree, createFenceSegment, createSignpost | `three` |
| `PartKit.js` | Factory functions: createBoxPart, createWallPart, createRoofPart, createCylinderPart; buildPartMesh dispatcher | `three` |
| `ModelLoader.js` | Resolves model references, builds Three.js groups with collision boxes | `PartKit.js`, `ModelStore.js` |

### Input/Camera

| Module | Purpose | Depends On |
|--------|---------|------------|
| `Input.js` | Keyboard/mouse input manager with edge detection | DOM events |
| `CameraController.js` | Third-person camera with wall collision raycasting | `three` (Raycaster) |

### Editor

| Module | Purpose | Depends On |
|--------|---------|------------|
| `EditorPalette.js` | Renders tool cards + saved model list; wires toolbar buttons | `ModelStore.js`, `EditorPlacement.js` |
| `EditorPlacement.js` | Raycasts clicks, snaps to grid, places parts | `PartKit.js`, `ModelStore.js` |
| `EditorInspector.js` | Renders property panel for selected part (position, rotation, scale, size, color) | `EditorPlacement.js` |
| `EditorCameraPan.js` | WASD camera panning (independent of OrbitControls) | `three` |

### Data Layer

| Module | Purpose | Depends On |
|--------|---------|------------|
| `ModelStore.js` | CRUD operations on localStorage; model composition/reference resolution | `localStorage` |
| `ModelLoader.js` | Converts model data → Three.js group + collision box | `PartKit.js`, `ModelStore.js` |
