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
│   ├── Rendering (Three.js scene, renderer, camera, lights)
│   ├── Game Logic (player, world, collision, interaction)
│   ├── Editor Logic (palette, placement, inspector, camera pan)
│   └── Data Layer (ModelStore, ModelLoader, PartKit)
│
├── Level 3: Modules (src/*.js)
│   └── Each file is a self-contained module
│
└── Level 4: Classes / Functions
    └── Player, InputManager, CameraController, etc.
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
│  └────────┬─────────┘       └────────┬─────────┘        │
│           │                           │                   │
│  ┌────────▼──────────────────────────▼──────────┐       │
│  │              Three.js Renderer                │       │
│  └────────────────────────┬─────────────────────┘       │
│                           │                              │
│  ┌────────────────────────▼─────────────────────┐       │
│  │              Shared Modules                   │       │
│  │  PartKit.js  ModelStore.js  ModelLoader.js    │       │
│  └──────────────────────────────────────────────┘       │
│                                                          │
├─────────────────────────────────────────────────────────┤
│  External: Three.js CDN (import map)                     │
│  Storage: localStorage (models)                          │
└─────────────────────────────────────────────────────────┘
```

## Key Architectural Decisions

1. **No bundler** — ES modules loaded via browser import maps pointing to unpkg CDN
2. **Shared state object** — Editor modules communicate via a mutable `state` object
3. **Factory functions over classes** — Most geometry is created via functions (`createHouse`, `createTree`, etc.)
4. **Stateless collision** — `resolveCollisions()` is pure; can be swapped for a physics engine
5. **localStorage for persistence** — No server, no database; models live in the browser
6. **Remote interior** — Player's house interior is placed at `(300, 0, 300)` to avoid overlapping the outdoor town
