# System Architecture

## Architecture Levels

```
Level 0: System
│
├── Level 1: Two Independent Entry Points
│   ├── index.html + main.js (Play Mode)
│   └── editor.html + EditorApp.js (Editor Mode)
│
├── Level 2: Subsystems
│   ├── Engine (Space, SpaceManager, Teleporter)
│   ├── Config (objTypes, colors, actions, spaces, world, houses)
│   ├── Game Logic (player, world builders, collision, interaction)
│   ├── House Data (AshHouse, GaryHouse, OakLab configs)
│   ├── Components (28 THREE.js object builders)
│   ├── Editor Logic (palette, placement, inspector, camera pan)
│   └── Data Layer (ModelStore, PartKit, HousePartBuilder)
│
├── Level 3: Modules (src/*.js, src/config/*, src/engine/*, src/house/*)
│   └── Each file is a self-contained module
│
└── Level 4: Classes / Functions
    └── Player, InputManager, CameraController, Space, Teleporter, etc.
```

## System Diagram

```
┌─────────────────────────────────────────────────────────┐
│                     Browser                              │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  ┌──────────────────┐       ┌──────────────────┐        │
│  │   Play Mode       │       │   Editor Mode     │        │
│  │   (index.html)    │       │   (editor.html)   │        │
│  └────────┬─────────┘       └────────┬─────────┘        │
│           │                           │                   │
│  ┌────────▼─────────┐       ┌────────▼─────────┐        │
│  │   main.js         │       │   EditorApp.js    │        │
│  │   - game loop     │       │   - render loop   │        │
│  │   - interaction   │       │   - editor UI     │        │
│  │   - HUD           │       │                   │        │
│  └────────┬─────────┘       └────────┬─────────┘        │
│           │                           │                   │
│  ┌────────▼──────────────────────────▼──────────┐       │
│  │              Three.js Renderer                │       │
│  └────────────────────────┬─────────────────────┘       │
│                           │                              │
│  ┌────────────────────────▼─────────────────────┐       │
│  │              Engine Layer                     │       │
│  │  Space.js  SpaceManager.js  Teleporter.js    │       │
│  └────────────────────────┬─────────────────────┘       │
│                           │                              │
│  ┌────────────────────────▼─────────────────────┐       │
│  │              Config Layer                     │       │
│  │  objTypes  colors  actions  spaces  world     │       │
│  │  houses (imports house configs)               │       │
│  └────────────────────────┬─────────────────────┘       │
│                           │                              │
│  ┌────────────────────────▼─────────────────────┐       │
│  │              House Data                       │       │
│  │  AshHouse/  GaryHouse/  OakLab/               │       │
│  │  (config.js + constants.js each)              │       │
│  └──────────────────────────────────────────────┘       │
│                                                          │
├─────────────────────────────────────────────────────────┤
│  External: Three.js CDN (import map)                     │
│  Storage: localStorage (models)                          │
└─────────────────────────────────────────────────────────┘
```

## Key Architectural Decisions

1. **No bundler** — ES modules loaded via browser import maps pointing to unpkg CDN
2. **Config-driven houses** — Houses are data (config.js), not code; new houses require only a config file
3. **BUILDERS registry** — World.js maps OBJ type strings to builder functions; new objects need only a builder + config entry
4. **Recursive Space system** — Spaces have exterior/interior/children; SpaceManager swaps scene context
5. **Stateless collision** — `resolveCollisions()` is pure; can be swapped for a physics engine
6. **Remote interiors** — House interiors are placed at offset positions (300,0,300 / 400,0,300 / 500,0,300) to avoid overlapping the outdoor town
7. **Rectangular teleporter triggers** — Thin door-width zones placed outside thresholds prevent entry/exit loops
8. **Interactable pattern** — Any object with an `action` property is auto-collected as interactable
