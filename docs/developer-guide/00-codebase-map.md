# Codebase Map

## Repository Structure

```
pokemon/
├── index.html              # Play mode entry point
├── editor.html             # Editor mode entry point
├── style.css               # Shared styles (HUD + editor UI)
├── dev.sh                  # HTTP dev server script
├── assets/
│   ├── adventurer.glb      # Player character model (CC0 by Quaternius)
│   └── README.md           # Asset attribution
├── src/
│   ├── main.js             # Play mode bootstrap + game loop
│   ├── EditorApp.js        # Editor mode bootstrap + render loop
│   ├── World.js            # Town layout, ground, obstacles
│   ├── Player.js           # Player character (movement, physics, animation)
│   ├── Input.js            # Keyboard/mouse input manager
│   ├── CameraController.js # Third-person camera with collision
│   ├── Collision.js        # AABB collision resolution (stateless)
│   ├── Buildings.js        # Building geometry factories
│   ├── PlayerHouseInterior.js  # Two-story player house (FireRed-inspired)
│   ├── InteractionManager.js   # Proximity-based E-key interactions
│   ├── EditorPalette.js    # Tool selection + saved model list UI
│   ├── EditorPlacement.js  # Part placement on grid (raycasting)
│   ├── EditorInspector.js  # Part property editing panel
│   ├── EditorCameraPan.js  # WASD camera panning for editor
│   ├── PartKit.js          # Primitive part builders (box, wall, roof, cylinder)
│   ├── ModelStore.js       # localStorage persistence for models
│   └── ModelLoader.js      # Build Three.js groups from model data
└── docs/
    └── developer-guide/    # This documentation
```

## File Classification

| Category | Files |
|----------|-------|
| Entry Points | `index.html` → `src/main.js`, `editor.html` → `src/EditorApp.js` |
| Game Logic | `World.js`, `Player.js`, `Collision.js`, `PlayerHouseInterior.js`, `InteractionManager.js` |
| Rendering | `Buildings.js`, `PartKit.js`, `ModelLoader.js` |
| Editor | `EditorApp.js`, `EditorPalette.js`, `EditorPlacement.js`, `EditorInspector.js`, `EditorCameraPan.js` |
| Shared | `Input.js`, `CameraController.js`, `ModelStore.js` |
| Assets | `assets/adventurer.glb` |
| Config | `style.css`, `dev.sh` |

## Module Dependency Graph

```
main.js
├── World.js
│   ├── Buildings.js
│   ├── ModelStore.js
│   └── ModelLoader.js → PartKit.js, ModelStore.js
├── Player.js → Collision.js
├── Input.js
├── CameraController.js
├── PlayerHouseInterior.js → Player.js
└── InteractionManager.js

EditorApp.js
├── EditorPalette.js → ModelStore.js, EditorPlacement.js
├── EditorPlacement.js → PartKit.js, ModelStore.js
├── EditorInspector.js → EditorPlacement.js
└── EditorCameraPan.js
```
