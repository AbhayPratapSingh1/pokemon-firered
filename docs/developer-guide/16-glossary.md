# Glossary

| Term | Meaning | Where Used |
|------|---------|------------|
| **AABB** | Axis-Aligned Bounding Box — a box whose edges are parallel to the coordinate axes | `Collision.js`, all obstacle definitions |
| **Armed tool** | The currently selected editor tool ready for placement | `EditorPalette.js`, `EditorPlacement.js` |
| **Buildings** | Pre-built 3D geometry factories (houses, lab, trees, fences) | `Buildings.js` |
| **Collision box** | A `THREE.Box3` representing an obstacle's collision boundary | `World.js`, `PlayerHouseInterior.js` |
| **Crosshair** | The centered dot on screen indicating the camera's look direction | `index.html`, `style.css` |
| **Exclusion zone** | A rectangular area where trees cannot spawn | `World.js:191-197` |
| **Flight** | One straight section of the L-shaped staircase | `PlayerHouseInterior.js` (FLIGHT_A, FLIGHT_B) |
| **Floor slab** | The horizontal divider between the two interior floors | `PlayerHouseInterior.js:198-210` |
| **GLTF/GLB** | 3D model format used for the player character | `Player.js`, `assets/adventurer.glb` |
| **Ground height** | The walkable surface Y-coordinate at a given (X, Z) position | `PlayerHouseInterior.js:535` |
| **Ground snap** | The process of clamping the player's Y position to the ground height | `Player.js:193-222` |
| **House origin** | World-space position `(300, 0, 300)` where the interior is placed | `PlayerHouseInterior.js:91` |
| **Import map** | Browser feature mapping bare module specifiers to CDN URLs | `index.html`, `editor.html` |
| **Interactable** | An object the player can interact with by pressing E | `InteractionManager.js`, `PlayerHouseInterior.js:485-490` |
| **Landing** | The flat corner platform connecting the two staircase flights | `PlayerHouseInterior.js:62-65` |
| **Model** | A named collection of parts saved in the editor | `ModelStore.js` |
| **Model reference** | A part type (`ref`) that points to another saved model | `ModelStore.js:105-141` |
| **Obstacle** | Any object that blocks player movement, represented as `{ mesh, box }` | `World.js`, `Collision.js` |
| **OrbitControls** | Three.js addon for mouse-driven orbit/zoom camera | `EditorApp.js` |
| **Parapet** | A low wall guarding the exposed edge of an elevated staircase | `PlayerHouseInterior.js:224-242` |
| **Part** | A single primitive or reference placed in the editor | `PartKit.js`, `EditorPlacement.js` |
| **Placeholder** | A capsule mesh shown while the real player model loads | `Player.js:38-48` |
| **Pointer lock** | Browser API that captures the mouse for FPS-style look | `Input.js:41-45` |
| **Primitives** | Box, wall, roof, cylinder — the basic building blocks in the editor | `PartKit.js` |
| **Quantized height** | Discrete per-step height values (not a smooth ramp) for staircases | `PlayerHouseInterior.js:540-566` |
| **State object** | Shared mutable object passed between editor modules | `EditorApp.js:61-74` |
| **Step snap** | Smooth easing toward a stair tread height to avoid jerky climbing | `Player.js:196-213` |
| **Teleport** | Instant player repositioning (used for door transitions) | `PlayerHouseInterior.js:578-586` |
| **Trigger zone** | An AABB volume that triggers an action when the player enters it | `PlayerHouseInterior.js:437-504` |
| **Town layout** | The outdoor arrangement of buildings, paths, trees, and decorations | `World.js:142-203` |
