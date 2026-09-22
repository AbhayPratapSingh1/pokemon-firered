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

## Config Files (`src/config/`)

All configuration is centralized in `src/config/`:

| File | Exports | Purpose |
|------|---------|---------|
| `objTypes.js` | `OBJ` | 28 object type string constants |
| `colors.js` | `COLORS` | 18 hex color constants for materials |
| `actions.js` | `ACTIONS` | 3 action types: MESSAGE, GIVE_ITEM, CHANGE_SPACE |
| `spaces.js` | `SPACES` | 4 space names: WORLD, ASH_HOUSE, GARY_HOUSE, OAK_LAB |
| `world.js` | `WORLD` | Ground size, tree count, spawn position, fog, space list |
| `houses.js` | `HOUSES` | Registry mapping space names to house configs |
| `index.js` | barrel | Re-exports all of the above |

## Game Constants

### Player (`src/Player.js`)

| Constant | Value | Purpose |
|----------|-------|---------|
| `COLLISION_RADIUS` | 0.45 | Player collision capsule radius |
| `COLLISION_HEIGHT` | 1.8 | Player collision capsule height |
| `WALK_SPEED` | 3.2 | Base movement speed (m/s) |
| `SPRINT_MULTIPLIER` | 1.8 | Sprint speed multiplier |
| `GRAVITY` | -20 | Gravity acceleration (m/s²) |
| `JUMP_SPEED` | 8 | Initial jump velocity |
| `MAX_STEP_UP` | 0.5 | Maximum step height for stair climbing |
| `STEP_SNAP_EPSILON` | 0.01 | Snap threshold for step surface |

### Camera (`src/CameraController.js`)

| Constant | Value | Purpose |
|----------|-------|---------|
| `DISTANCE` | 3.5 | Camera distance from player |
| Pitch range | [-0.6, 1.2] | Vertical look angle limits (radians) |
| Collision margin | 0.25 | Camera pull-in margin near walls |

### Interaction (`src/main.js`)

| Constant | Value | Purpose |
|----------|-------|---------|
| `INTERACT_RANGE` | 2.0 | Max distance for E interactions |
| `TELEPORT_GLOBAL_COOLDOWN` | 1.0 | Seconds after any teleport |
| `INPUT_LOCK_DURATION` | 0.2 | Input lock after teleport |
| `MESSAGE_DURATION` | 3.0 | seconds to show interaction message |

### World (`src/config/world.js`)

| Constant | Value | Purpose |
|----------|-------|---------|
| `GROUND_SIZE` | 800 | Outdoor ground plane size |
| `TREE_COUNT` | 0 | Number of randomly scattered trees (0 = disabled) |
| `SPAWN_POSITION` | (0, 0, 0) | Player starting position |
| `FOG_NEAR` | 60 | Distance fog start |
| `FOG_FAR` | 160 | Distance fog end |

### Collision (`src/Collision.js`)

| Constant | Value | Purpose |
|----------|-------|---------|
| `MAX_STEP_HEIGHT` | 0.5 | Maximum obstacle height for step-snap |
| `STEP_UP_EPSILON` | 0.05 | Snap threshold for step surface |

### Editor (`src/EditorPlacement.js`)

| Constant | Value | Purpose |
|----------|-------|---------|
| `GRID_SNAP` | 0.5 | Editor grid snap size |

## localStorage Key

| Key | File | Purpose |
|-----|------|---------|
| `townbuilder.models` | `ModelStore.js` | All saved models (JSON object keyed by model ID) |

## Model Reference Depth Limit

| Constant | File | Value | Purpose |
|----------|------|-------|---------|
| `DEFAULT_MAX_DEPTH` | `ModelStore.js` | 6 | Max nesting depth for model references |
