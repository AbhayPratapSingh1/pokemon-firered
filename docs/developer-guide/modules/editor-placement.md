# EditorPlacement Module

**File:** `src/EditorPlacement.js` (114 lines)

## Purpose

Part placement on the 3D grid via raycasting.

## Responsibilities

- Handle pointer events (distinguish click from orbit drag)
- Raycast against ground + existing parts
- Place new parts at snapped positions
- Stack parts on top of existing ones
- Add parts to the Three.js scene

## Public Interface

```javascript
initPlacement(state)           // Attach event listeners
addPartToScene(state, part)   // Build mesh and add to scene
```

## Placement Logic

```
pointerup event
    │
    ├── Check drag threshold (5px)
    │   └── If exceeded: was orbit drag, ignore
    │
    ├── Raycast from camera through click point
    │   └── Targets: groundMesh + partsGroup.children
    │
    ├── No hit → deselect or no action
    │
    ├── Armed tool → placePart(state, hit)
    │   ├── snap position to 0.5 grid
    │   ├── Y = 0 (ground) or getTopY(hit.object) (stack)
    │   ├── Create part record
    │   ├── Push to state.parts
    │   └── addPartToScene()
    │
    └── No armed tool → selectPart(hit.object)
        └── Find partId from userData
```

## Part Scene Representation

```
Primitive part:
    mesh (THREE.Mesh)
    └── mesh.userData.partId = part.id

Reference part:
    wrapper (THREE.Group)
    ├── resolved mesh 1 (from referenced model)
    ├── resolved mesh 2
    └── ...
    └── wrapper.userData.partId = part.id
```

## Constants

| Constant | Value | Purpose |
|----------|-------|---------|
| `GRID_SNAP` | 0.5 | Position snapping grid |
| `CLICK_DRAG_THRESHOLD` | 5px | Click vs drag detection |
