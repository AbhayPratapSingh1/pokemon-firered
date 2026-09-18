# Developer Guide

## What is this project?

**Open Ground** — A 3D Pokémon-inspired game world with a built-in model editor.

- Built with **Three.js 0.169.0** (vanilla JS, ES modules, no bundler)
- Two modes: **Play** (3D adventure) and **Editor** (model builder)
- Models built in the editor appear in the game world
- Inspired by classic RPG towns (no trademarked content used)

## Start Here

1. Read [Codebase Map](00-codebase-map.md)
2. Read [System Overview](01-system-overview.md)
3. Read [System Architecture](02-system-architecture.md)
4. Read [Module Architecture](05-module-architecture.md)
5. Read [Runtime Flow](03-runtime-flow.md)
6. Read [Code Reading Guide](14-code-reading-guide.md)

## Architecture

- [System Architecture](02-system-architecture.md)
- [Component Architecture](architecture/component-architecture.md)
- [Deployment Architecture](architecture/deployment-architecture.md)

## Modules

- [World](modules/world.md) — Town layout, ground, obstacles
- [Player](modules/player.md) — Character movement, physics, animation
- [Input](modules/input.md) — Keyboard/mouse handling
- [Camera](modules/camera.md) — Third-person camera with collision
- [Collision](modules/collision.md) — AABB collision resolution
- [Buildings](modules/buildings.md) — Building geometry factories
- [PlayerHouseInterior](modules/player-house-interior.md) — Two-story interior
- [InteractionManager](modules/interaction-manager.md) — Proximity interactions
- [EditorApp](modules/editor-app.md) — Model editor entry point
- [PartKit](modules/part-kit.md) — Primitive part builders
- [ModelStore](modules/model-store.md) — localStorage persistence
- [ModelLoader](modules/model-loader.md) — Build Three.js groups from data

## Important Flows

- [Game Loop Flow](flows/game-loop.md)
- [Player Movement Flow](flows/player-movement.md)
- [Player House Teleport Flow](flows/player-house-teleport.md)
- [Editor Part Placement Flow](flows/editor-part-placement.md)
- [Model Save/Load Flow](flows/model-save-load.md)

## Development

### Setup

```bash
./dev.sh        # serves at http://localhost:8934
```

Or manually:

```bash
python3 -m http.server 8934
```

### Build

No build step — vanilla ES modules loaded directly by the browser via import maps.

### Run

1. Open `http://localhost:8934` in a browser
2. Click to lock pointer, WASD to move, mouse to look, E to interact
3. Navigate to `editor.html` via the "Build" link to use the model editor

### Test

No test suite currently exists.

### Debug

- `#debug-stair` HUD (top-right in play mode) shows staircase collision diagnostics
- Browser DevTools console for Three.js scene inspection
