# System Overview

## What Does the System Do?

**Open Ground** is a browser-based 3D game world with two modes:

1. **Play Mode** — Explore a small town with buildings, trees, paths, a pond, and a two-story house interior you can enter
2. **Editor Mode** — Build custom 3D models from primitive shapes, save them, and see them appear in the game world

## Who Uses It?

- **Players** — Navigate the 3D world using keyboard/mouse
- **Builders** — Create models using the editor, which are saved to localStorage

## Major Capabilities

| Capability | Description |
|------------|-------------|
| 3D World Rendering | Three.js-based renderer with shadows, fog, hemisphere + directional lighting |
| Player Movement | WASD/arrow keys, sprint (Shift), jump (Space), mouse look |
| Third-Person Camera | GTA-style camera with wall collision detection |
| Collision System | AABB-based obstacle push-out for buildings, furniture, walls |
| Building Interiors | Enter/exit the player's house via door teleport, walk up L-shaped stairs |
| Proximity Interactions | Press E near TV/sink/bed/PC to see messages |
| Model Editor | Place box/wall/roof/cylinder primitives, adjust position/rotation/scale/color |
| Model Persistence | Save/load/export/import models via localStorage + JSON files |
| Model Composition | Models can reference other models (nested references) |

## What Enters the System?

- Keyboard/mouse input (player controls)
- Editor tool selections + part placements
- Imported model JSON files

## What Leaves the System?

- Rendered 3D frames displayed in the browser
- Exported model JSON files (downloaded to disk)
- Saved models stored in localStorage

## External Systems

```
Browser
├── Three.js (CDN via import map)
├── localStorage (model persistence)
└── DOM (HUD, editor UI)

No server-side components — entirely client-side
```
