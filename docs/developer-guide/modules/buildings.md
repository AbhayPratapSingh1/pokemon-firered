# Buildings Module

**File:** `src/Buildings.js` (142 lines)

## Purpose

Factory functions that create Three.js geometry for town buildings and decorations.

## Public Interface

```javascript
createHouse({ position, rotationY, width, depth, wallHeight, roofHeight, wallColor, roofColor, doorColor })
  → THREE.Group    // Box walls + pyramid roof + door + windows

createLab({ position, rotationY, width, depth, wallHeight, wallColor, trimColor })
  → THREE.Group    // Rectangular walls + flat overhanging roof + door + windows

createTree({ position })
  → THREE.Group    // Cylinder trunk + cone canopy

createFenceSegment({ position, length, rotationY })
  → THREE.Mesh     // Thin box

createSignpost({ position, rotationY })
  → THREE.Group    // Cylinder post + box plaque
```

## Factory Functions

| Function | Geometry | Default Size |
|----------|----------|--------------|
| `createHouse` | Box walls + Cone roof + Box door + Box windows | 6×3×6 walls, 2.2 roof |
| `createLab` | Box walls + Box roof + Box door + Box windows | 12×3.5×8 walls |
| `createTree` | Cylinder trunk + Cone canopy | 1.2 trunk, 1.8 canopy |
| `createFenceSegment` | Box | 3×0.6×0.1 |
| `createSignpost` | Cylinder post + Box plaque | 1.2 post |

## Internal Helper

```javascript
addShadow(mesh) → mesh  // Sets castShadow + receiveShadow
```

All factory functions call `addShadow()` on every mesh they create.
