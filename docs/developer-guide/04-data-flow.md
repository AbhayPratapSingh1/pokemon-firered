# Data Flow

## Model Data (Editor ↔ Game)

```
Editor UI                    ModelStore                  Game World
─────────                    ──────────                  ──────────
Tool selection ──────► armedTool state
Part placement ──────► part record ──────► localStorage ◄──── listModels()
Save button ──────────► saveModel() ──────► localStorage
Export button ────────► exportModelToJSON() ──► .json file download
Import .json file ────► importModelFromJSON() ──► localStorage

                                          buildModelGroup()
                                                │
                                                ▼
                                        THREE.Group + Box3
                                                │
                                                ▼
                                        scene.add(group)
```

## Part Record Structure

```json
{
  "id": "p_m1abc_xyz",
  "type": "box",
  "position": { "x": 2.0, "y": 0, "z": 1.5 },
  "rotationY": 0,
  "scale": 1,
  "size": { "w": 1, "h": 1, "d": 1 },
  "color": 11577800
}
```

For reference parts:
```json
{
  "id": "p_m2def_abc",
  "type": "ref",
  "refModelId": "m1abc_xyz",
  "position": { "x": 0, "y": 0, "z": 0 },
  "rotationY": 0,
  "scale": 1
}
```

## Player Position Data Flow

```
Keyboard Input
    │
    ▼
InputManager (forward/backward/left/right/sprint/jump)
    │
    ▼
Player.update()
    ├── inputVector × speed = targetVelocity
    ├── Smooth acceleration: velocity += (target - velocity) × (1 - e^(-ACCELERATION × dt))
    ├── Gravity integration: velocity.y += GRAVITY × dt
    ├── Position integration: position += velocity × dt
    ├── Ground clamp: position.y = getGroundHeight(x, z)
    │   ├── Outdoors: always 0
    │   └── Indoors: quantized stair height or floor level
    ├── Collision push-out: resolveCollisions(position, radius, height, obstacles)
    └── Animation selection: idle / walk / run
```

## Obstacle Data Structure

```
obstacles: Array<{ mesh: THREE.Object3D, box: THREE.Box3 }>
    │
    ├── World.js builds:
    │   ├── buildPlayersHouseObstacles() → 3 boxes (west, east, middle w/ door notch)
    │   ├── neighbor's house → 1 box
    │   ├── lab → 1 box
    │   └── scatterTrees() → 1 box per tree (trunk only)
    │
    └── PlayerHouseInterior.js builds:
        ├── Perimeter walls → N boxes
        ├── Furniture (TV, cupboard, table, chairs, sink, plants) → N boxes
        ├── Parapets → N boxes (one per stair step)
        └── Floor slab → tagged collide (camera occlusion only)
```
