# Development Workflow

## Quick Start

```bash
# 1. Navigate to project
cd pokemon/

# 2. Start dev server
./dev.sh

# 3. Open in browser
open http://localhost:8934
```

## Development Cycle

```
Edit src/*.js
    │
    ▼
Refresh browser (Cmd+Shift+R for hard refresh)
    │
    ▼
Test in play mode or editor mode
    │
    ▼
Check console for errors
    │
    ▼
Iterate
```

## No Build Step

Changes to any `src/*.js` file take effect on browser refresh. No compilation needed.

## File Editing Tips

| Task | Files to Edit |
|------|---------------|
| Change player speed | `src/Player.js` (WALK_SPEED, SPRINT_MULTIPLIER) |
| Add new building type | `src/Buildings.js` (add factory function) |
| Add new interaction | `src/PlayerHouseInterior.js` (add to interactables array) |
| Change world layout | `src/World.js` (createTownLayout function) |
| Add new editor tool | `src/EditorPalette.js` (add to TOOL_DEFS array) + `src/PartKit.js` (add builder) |
| Change collision behavior | `src/Collision.js` (resolveCollisions function) |
| Modify camera behavior | `src/CameraController.js` |

## Key Patterns to Follow

1. **Geometry factories** — Create new building/object types as factory functions in `Buildings.js` or `PartKit.js`
2. **Obstacle registration** — Add `{ mesh, box }` entries to the obstacles array for collision
3. **Editor tools** — Add to `TOOL_DEFS` in `EditorPalette.js` and corresponding builder in `PartKit.js`
4. **Interactions** — Add entries to the `interactables` array in `PlayerHouseInterior.js`
