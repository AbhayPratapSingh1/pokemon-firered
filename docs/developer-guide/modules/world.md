# World Module

**File:** `src/World.js`

## Purpose

Central orchestrator that builds the entire game world: BUILDERS registry (29 object builders), Space hierarchy from house configs, teleporter resolution, and obstacle generation.

## Responsibilities

- Register all 29 OBJ type builders in `BUILDERS` registry
- Build root World Space with ground and trees
- For each house config: build exterior, interior, obstacles, interactables, teleporters
- Resolve teleporter targets via `SPACE_LOOKUP`
- Build world obstacles (tree trunks + house wall collision boxes)

## Public Interface

```javascript
createWorld(scene) → { world, spaceManager, allTeleporters, worldObstacles }
```

Also exports `SPACE_LOOKUP` — dictionary mapping space name strings to Space instances.

## Key Exports

| Export | Type | Purpose |
|--------|------|---------|
| `createWorld` | Function | Main entry — builds everything, returns systems |
| `SPACE_LOOKUP` | Object | Maps space names → Space instances |

## Internal Functions

### Builders

| Function | Purpose |
|----------|---------|
| `registerBuilders()` | Populates `BUILDERS` with all 29 OBJ type builders |
| `buildTree(mesh, x, z, y)` | Creates tree trunk + leaf canopy |

### Space Building

| Function | Purpose |
|----------|---------|
| `buildExteriorObjects(objects)` | Maps object configs → THREE.Group via BUILDERS |
| `buildInteriorObjects(objects, origin)` | Same + offsets by origin, sets collide/action userData |
| `buildTeleporters(configs)` | Creates Teleporter instances from config |
| `resolveTeleportTargets(teleporters)` | Wires teleporter.target via SPACE_LOOKUP |
| `buildWorldSpace()` | Assembles root World Space + all house spaces |

### Obstacles

| Function | Purpose |
|----------|---------|
| `buildWorldObstacles(world)` | Tree trunks + manual house wall collision boxes |

## BUILDERS Registry

Maps OBJ type strings to builder functions:

```javascript
BUILDERS[OBJ.GROUND_FLOOR] = (mesh, cfg) => { ... };
BUILDERS[OBJ.WALLS] = (mesh, cfg) => { ... };
BUILDERS[OBJ.TABLE] = (mesh, cfg) => { ... };
// ... 29 total
```

Each builder receives a `THREE.Group` and a config object, creating geometry and adding it to the group.

## HOUSE Builder Config

The HOUSE exterior builder supports:

| Option | Default | Description |
|--------|---------|-------------|
| `width` | 6 | Building width (X) |
| `depth` | 6 | Building depth (Z) |
| `wallHeight` | 3 | Wall height |
| `roofHeight` | 2.2 | Roof height (ignored if flatRoof) |
| `wallColor` | WALL_DEFAULT | Wall material color |
| `roofColor` | ROOF_DEFAULT | Roof material color |
| `flatRoof` | false | Box roof instead of pyramid |
| `windows` | [] | Array of `{x, y, z, width, height}` |

## Space Hierarchy

```
world (Space "WORLD")
  interior: [ground, trees]
  children:
    houseSpace (Space "ASH_HOUSE")
      exterior: [house shell at (-5, 0, -8)]
      interior: [furniture at origin (300, 0, 300)]
    houseSpace (Space "GARY_HOUSE")
      exterior: [house shell at (5, 0, -8)]
      interior: [furniture at origin (400, 0, 300)]
    houseSpace (Space "OAK_LAB")
      exterior: [lab shell at (0, 0, 25)]
      interior: [lab furniture at origin (500, 0, 300)]
  teleporters: [entry/exit for each house]
```

## Obstacle Structure

```javascript
obstacles = [
  { mesh: child, box: THREE.Box3, canStandOn: false },  // furniture
  { mesh: child, box: THREE.Box3, canStandOn: true },   // stair steps
  { mesh: null, box: THREE.Box3 },                       // house walls
  ...
]
```
