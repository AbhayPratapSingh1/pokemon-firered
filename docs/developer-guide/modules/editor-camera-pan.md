# EditorCameraPan Module

**File:** `src/EditorCameraPan.js` (67 lines)

## Purpose

WASD/Arrow-key camera panning for the editor, moving both camera and orbit target together.

## Responsibilities

- Track held keys (WASD / Arrows)
- Move camera + OrbitControls target in camera-relative direction
- Ignore input while typing in sidebar/inspector input fields

## Public Interface

```javascript
initCameraPan(state) → { update(delta) }
```

## Panning Logic

```
update(delta)
    │
    ├── Read held keys
    │
    ├── Compute input direction (x, z)
    │
    ├── Get camera forward (XZ plane)
    ├── Get camera right (cross product with up)
    │
    ├── Move = (forward × -z + right × x) × PAN_SPEED × delta
    │
    ├── state.camera.position.add(move)
    └── state.controls.target.add(move)
```

## Constants

| Constant | Value | Purpose |
|----------|-------|---------|
| `PAN_SPEED` | 14 | Units per second |
| `PAN_KEYS` | WASD + Arrows | Key codes for panning |
