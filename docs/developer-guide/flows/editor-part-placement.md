# Editor Part Placement Flow

## Trigger

User clicks on the ground or an existing part with a tool armed.

## Flow

```
User clicks "Place" on a tool card
    │
    ▼
EditorPalette.js: arm button click handler
    └── state.armedTool = { kind: "primitive", type, size, color }
        └── Card gets "armed" CSS class
    │
    ▼
User clicks on the 3D canvas
    │
    ▼
EditorPlacement.js: pointerup handler
    │
    ├── Check drag threshold (5px) — skip if was orbit drag
    │
    ├── Raycast from camera through click point
    │   └── Intersects groundMesh + partsGroup children
    │
    ├── No hit?
    │   ├── No armed tool → deselect (onDeselect callback)
    │   └── Armed tool → no action
    │
    ├── Hit on ground or existing part?
    │   ├── Armed tool → placePart(state, hit)
    │   └── No armed tool → selectPart(partId)
    │
    ▼
placePart(state, hit)
    │
    ├── snap(x) → round to nearest 0.5
    ├── snap(z) → round to nearest 0.5
    │
    ├── Y position:
    │   ├── Hit ground → y = 0
    │   └── Hit existing part → y = getTopY(hit.object) (stack on top)
    │
    ├── Create part record:
    │   └── { id, type, position: {x,y,z}, rotationY: 0, scale: 1, size, color }
    │
    ├── state.parts.push(part)
    │
    └── addPartToScene(state, part)
        ├── If primitive:
        │   ├── buildPartMesh(part) → THREE.Mesh
        │   ├── mesh.userData.partId = part.id
        │   └── state.partsGroup.add(mesh)
        │
        └── If ref:
            ├── resolveModelParts() → flattened parts
            ├── Build each resolved part
            ├── Group under THREE.Group
            ├── group.userData.partId = part.id
            └── state.partsGroup.add(group)
```

## Grid Snapping

| Constant | Value | Purpose |
|----------|-------|---------|
| `GRID_SNAP` | 0.5 | Snap positions to 0.5 unit grid |
| `CLICK_DRAG_THRESHOLD` | 5px | Distinguish click from orbit drag |

## Implementation

- Tool arming: `src/EditorPalette.js:73-84`
- Placement: `src/EditorPlacement.js:60-76`
- Raycasting: `src/EditorPlacement.js:78-113`
- Part building: `src/PartKit.js:56-68`
- Scene addition: `src/EditorPlacement.js:35-58`
