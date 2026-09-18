# Dependency Architecture

## External Dependencies

```
Project
├── three@0.169.0 (CDN via import map)
│   ├── Core (Scene, Renderer, Camera, etc.)
│   └── Addons
│       ├── GLTFLoader.js (player model loading)
│       └── OrbitControls.js (editor camera)
└── Browser APIs
    ├── localStorage (model persistence)
    ├── DOM Events (keyboard, mouse, pointer lock)
    └── ES Module import maps
```

No `package.json`, no `node_modules`, no bundler. All dependencies are loaded at runtime from CDN.

## Internal Dependency Graph

```
main.js
├── World.js
│   ├── Buildings.js (createHouse, createLab, createTree, createFenceSegment, createSignpost)
│   ├── ModelStore.js (listModels)
│   └── ModelLoader.js (buildModelGroup)
│       ├── PartKit.js (buildPartMesh)
│       └── ModelStore.js (resolveModelParts, listModels)
├── Player.js
│   └── Collision.js (resolveCollisions)
├── Input.js
├── CameraController.js
├── PlayerHouseInterior.js
│   └── Player.js (imports COLLISION_RADIUS, COLLISION_HEIGHT)
└── InteractionManager.js

EditorApp.js
├── EditorPalette.js
│   ├── ModelStore.js (listModels, getModel, saveModel, exportModelToJSON, importModelFromJSON, deleteModel)
│   └── EditorPlacement.js (addPartToScene)
├── EditorPlacement.js
│   ├── PartKit.js (buildPartMesh)
│   └── ModelStore.js (resolveModelParts, listModels)
├── EditorInspector.js
│   └── EditorPlacement.js (addPartToScene)
└── EditorCameraPan.js
```

## Dependency Depth

| Module | Max Depth | Notes |
|--------|-----------|-------|
| `main.js` | 0 (root) | Entry point |
| `World.js` | 1 | Depends on Buildings, ModelStore, ModelLoader |
| `Player.js` | 1 | Depends on Collision |
| `ModelLoader.js` | 2 | Depends on PartKit, ModelStore |
| `EditorPalette.js` | 2 | Depends on ModelStore, EditorPlacement |
| `EditorPlacement.js` | 2 | Depends on PartKit, ModelStore |
| `EditorInspector.js` | 2 | Depends on EditorPlacement |

## Circular Dependencies

None detected. All dependency edges are acyclic.
