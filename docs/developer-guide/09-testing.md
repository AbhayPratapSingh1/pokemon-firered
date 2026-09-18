# Testing

## Current State

**No test suite exists.** There are no test files, no test framework configuration, no test runner.

## Manual Verification

The project relies on manual testing via the browser:

1. Start dev server: `./dev.sh`
2. Open `http://localhost:8934`
3. Test play mode: movement, jumping, collision, house entry/exit, stairs, interactions
4. Test editor mode: tool selection, part placement, inspector, save/load/export/import
5. Test model persistence: build model in editor → refresh page → model should appear in game world

## Debug Tools

- **Staircase debug HUD** — `#debug-stair` element in play mode shows collision region, ground height, and colliding obstacles
- **Browser DevTools** — Three.js scene graph inspection via `renderer.info`
- **Console logging** — Error/warning messages from model loading and persistence

## What Would Need Testing

If tests were added:

| Area | Test Type | Key Behaviors |
|------|-----------|---------------|
| `Collision.js` | Unit | AABB push-out logic (pure function) |
| `ModelStore.js` | Unit | CRUD operations, reference resolution, circular detection |
| `PartKit.js` | Unit | Mesh creation for each part type |
| `Player.js` | Integration | Movement physics, ground clamping, animation state |
| `PlayerHouseInterior.js` | Integration | Door teleport, ground height computation, stair traversal |
| `EditorPlacement.js` | Integration | Grid snapping, part creation, raycasting |
