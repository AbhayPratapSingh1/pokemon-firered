# Configuration

## Development Server

```bash
./dev.sh [PORT]    # Default port: 8934
```

Uses Python's built-in HTTP server. Required because ES module imports and GLTF loading break when opened via `file://`.

## Import Map (Three.js CDN)

Defined in both `index.html` and `editor.html`:

```json
{
  "imports": {
    "three": "https://unpkg.com/three@0.169.0/build/three.module.js",
    "three/addons/": "https://unpkg.com/three@0.169.0/examples/jsm/"
  }
}
```

To upgrade Three.js, update both HTML files' import maps and verify compatibility.

## Game Constants

Defined in source files as top-level constants:

| Constant | File | Value | Purpose |
|----------|------|-------|---------|
| `GROUND_SIZE` | `World.js` | 200 | Outdoor ground plane size |
| `TREE_COUNT` | `World.js` | 16 | Number of randomly scattered trees |
| `WALK_SPEED` | `Player.js` | 3.2 | Base movement speed (m/s) |
| `SPRINT_MULTIPLIER` | `Player.js` | 1.8 | Sprint speed multiplier |
| `GRAVITY` | `Player.js` | -20 | Gravity acceleration (m/s²) |
| `JUMP_SPEED` | `Player.js` | 8 | Initial jump velocity |
| `COLLISION_RADIUS` | `Player.js` | 0.45 | Player collision capsule radius |
| `COLLISION_HEIGHT` | `Player.js` | 1.8 | Player collision capsule height |
| `INTERACT_RANGE` | `InteractionManager.js` | 1.6 | Max distance for E interactions |
| `DISTANCE` | `CameraController.js` | 3.5 | Camera distance from player |
| `HOUSE_ORIGIN` | `PlayerHouseInterior.js` | (300, 0, 300) | Interior world position |
| `GRID_SNAP` | `EditorPlacement.js` | 0.5 | Editor grid snap size |

## localStorage Key

| Key | File | Purpose |
|-----|------|---------|
| `townbuilder.models` | `ModelStore.js` | All saved models (JSON object keyed by model ID) |

## Model Reference Depth Limit

| Constant | File | Value | Purpose |
|----------|------|-------|---------|
| `DEFAULT_MAX_DEPTH` | `ModelStore.js` | 6 | Max nesting depth for model references |
