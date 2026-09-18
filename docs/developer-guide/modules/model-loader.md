# ModelLoader Module

**File:** `src/ModelLoader.js` (34 lines)

## Purpose

Converts model data (from ModelStore) into real Three.js groups with collision boxes, ready to be added to the scene.

## Public Interface

```javascript
buildModelGroup(model, allModels, { position, rotationY }) → { group, box }
```

| Parameter | Type | Description |
|-----------|------|-------------|
| `model` | Object | Model record from ModelStore |
| `allModels` | Array | All models (for reference resolution) |
| `position` | THREE.Vector3 | World position for the group |
| `rotationY` | number | Y-axis rotation for the group |

| Return | Type | Description |
|--------|------|-------------|
| `group` | THREE.Group | Three.js group containing all part meshes |
| `box` | THREE.Box3 | Bounding box for collision |

## Flow

```
buildModelGroup(model, allModels, { position, rotationY })
  │
  ├── resolveModelParts(model.id, modelsById)
  │   └── Flatten all ref parts into primitives
  │
  ├── For each resolved part:
  │   └── buildPartMesh(part) → THREE.Mesh
  │       └── group.add(mesh)
  │
  ├── group.position.copy(position)
  ├── group.rotation.y = rotationY
  │
  └── box = new Box3().setFromObject(group)
```
