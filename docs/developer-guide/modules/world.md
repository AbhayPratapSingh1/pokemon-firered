# World Module

**File:** `src/World.js` (238 lines)

## Purpose

Generates the outdoor town layout — ground plane, buildings, paths, trees, fences, pond, and the collision obstacle list.

## Responsibilities

- Create 200×200 green ground plane
- Place 3 buildings (player's house, neighbor's house, lab)
- Draw dirt paths from spawn to each building
- Scatter 16 trees in a ring (avoiding buildings)
- Add fence segments, signpost, and a pond
- Build collision obstacles (including 3-box door notch for player's house)
- Place the most recently saved model from the editor

## Public Interface

```javascript
createWorld(scene) → { ground, obstacles, size }
```

## Key Exports

| Export | Type | Purpose |
|--------|------|---------|
| `createWorld` | Function | Main entry point — builds everything |
| `PLAYERS_HOUSE_DOOR_POSITION` | Vector3 | World position of the player's house door |

## Internal Functions

| Function | Purpose |
|----------|---------|
| `createGround()` | Green plane (200×200) |
| `addPathSegment(scene, from, to, width)` | Visual dirt strip between two points |
| `addPond(scene, position, radius)` | Blue circle on ground |
| `scatterTrees(scene, obstacles, exclusionZones)` | Random tree placement in ring |
| `buildPlayersHouseObstacles(house)` | 3 collision boxes with door notch |
| `createTownLayout(scene)` | Assembles all town elements |
| `placeDemoSavedModel(scene, obstacles)` | Most recent saved model from editor |
| `isInsideExclusionZone(x, z, exclusionZones)` | Checks if position is in exclusion zone |

## Obstacle Structure

```javascript
obstacles = [
  { mesh: THREE.Group, box: THREE.Box3 },  // Each building/tree
  ...
]
```

## Layout Constants

| Constant | Value | Purpose |
|----------|-------|---------|
| `GROUND_SIZE` | 200 | Ground plane dimensions |
| `TREE_COUNT` | 16 | Number of trees |
| `TREE_RING_MIN` | 30 | Inner radius for tree ring |
| `TREE_RING_MAX` | 70 | Outer radius for tree ring |
| `PLAYERS_HOUSE_POSITION` | (-14, 0, -14) | Player's house location |
