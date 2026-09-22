# Codebase Map

## Repository Structure

```
pokemon/
├── index.html                  # Game entry point
├── editor.html                 # Editor entry point
├── style.css                   # Shared styles (HUD + editor UI)
├── dev.sh                      # HTTP dev server script
├── CODEBASE.md                 # This documentation
├── assets/
│   ├── adventurer.glb          # Player character model (CC0 by Quaternius)
│   └── README.md               # Asset attribution
├── src/
│   ├── main.js                 # Game bootstrap, loop, interaction, HUD
│   ├── World.js                # BUILDERS registry, Space hierarchy, obstacles
│   ├── Player.js               # Player character (movement, physics, animation)
│   ├── Input.js                # Keyboard/mouse input manager
│   ├── CameraController.js     # Third-person camera with wall collision
│   ├── Collision.js            # AABB collision resolution with step-snap
│   ├── HousePartBuilder.js     # House part builder registry (editor)
│   ├── PartKit.js              # Primitive part builders (box, wall, roof, cylinder)
│   ├── ModelStore.js           # localStorage persistence for models
│   ├── EditorApp.js            # Editor bootstrap + render loop
│   ├── EditorPalette.js        # Tool selection + saved model list UI
│   ├── EditorPlacement.js      # Part placement on grid (raycasting)
│   ├── EditorInspector.js      # Part property editing panel
│   ├── EditorCameraPan.js      # WASD camera panning for editor
│   ├── config/
│   │   ├── index.js            # Barrel export for all config
│   │   ├── objTypes.js         # OBJ enum — all object type constants
│   │   ├── colors.js           # COLORS hex palette
│   │   ├── actions.js          # ACTIONS enum (MESSAGE, GIVE_ITEM, CHANGE_SPACE)
│   │   ├── spaces.js           # SPACES enum (WORLD, ASH_HOUSE, GARY_HOUSE, OAK_LAB)
│   │   ├── world.js            # WORLD constants (ground, trees, spawn, fog, space list)
│   │   └── houses.js           # HOUSES registry (imports house configs)
│   ├── engine/
│   │   ├── Space.js            # Recursive scene node (exterior/interior/children)
│   │   ├── SpaceManager.js     # Context swap (clear + load)
│   │   ├── Teleporter.js       # Trigger/action teleporter (circular + rectangular)
│   │   └── index.js            # Barrel export
│   ├── house/
│   │   ├── AshHouse/
│   │   │   ├── config.js       # Full layout: exterior, interior, teleporters, actions
│   │   │   └── constants.js    # Building dimensions, staircase math, world origin
│   │   ├── GaryHouse/
│   │   │   ├── config.js       # Mirrored layout, blue roof, different flavor text
│   │   │   └── constants.js    # Mirrored dimensions, staircase math
│   │   └── OakLab/
│   │       ├── config.js       # Long 14x24 lab, flat roof, lab furniture, actions
│   │       └── constants.js    # Building dimensions, world origin
│   └── components/             # 28 component subdirectories
│       ├── shared.js           # addShadow() helper
│       ├── Bed/ TV/ Stairs/ Tree/ Plant/ Sink/ Cupboard/ DiningSet/
│       ├── ComputerDesk/ Table/ Chair/ KitchenCounter/ Pokeball/
│       ├── LabShelf/ LabMachine/ LabDesk/ LabPlant/
│       ├── Floor/ Walls/ Roof/ Door/ Window/ Banner/ Chimney/
│       ├── Mailbox/ Sign/ WindowBox/ Fence/ Grass/ Water/ Shelter/
│       └── (each: ComponentName.js + config.js)
└── docs/
    └── developer-guide/        # This documentation
```

## File Classification

| Category | Files |
|----------|-------|
| Entry Points | `index.html` → `src/main.js`, `editor.html` → `src/EditorApp.js` |
| Game Logic | `World.js`, `Player.js`, `Collision.js`, `main.js` (interaction) |
| Engine | `engine/Space.js`, `engine/SpaceManager.js`, `engine/Teleporter.js` |
| Config | `config/objTypes.js`, `config/colors.js`, `config/actions.js`, `config/spaces.js`, `config/world.js`, `config/houses.js` |
| House Data | `house/AshHouse/`, `house/GaryHouse/`, `house/OakLab/` (config.js + constants.js each) |
| Rendering | `components/` (28 component builders), `PartKit.js`, `HousePartBuilder.js` |
| Editor | `EditorApp.js`, `EditorPalette.js`, `EditorPlacement.js`, `EditorInspector.js`, `EditorCameraPan.js` |
| Input/Camera | `Input.js`, `CameraController.js` |
| Data Layer | `ModelStore.js` |
| Assets | `assets/adventurer.glb` |

## Module Dependency Graph

```
main.js
├── World.js
│   ├── engine/Space.js
│   ├── engine/SpaceManager.js
│   ├── engine/Teleporter.js
│   ├── config/* (OBJ, COLORS, SPACES, WORLD, HOUSES)
│   └── house/*/config.js (house layouts)
├── Player.js → Collision.js
├── Input.js
├── CameraController.js
└── config/actions.js

EditorApp.js
├── EditorPalette.js → ModelStore.js, EditorPlacement.js
├── EditorPlacement.js → PartKit.js, ModelStore.js, HousePartBuilder.js
├── EditorInspector.js → EditorPlacement.js
├── EditorCameraPan.js
└── PartKit.js
```
