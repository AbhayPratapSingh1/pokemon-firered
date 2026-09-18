# PartKit Module

**File:** `src/PartKit.js` (69 lines)

## Purpose

Primitive part builders — factory functions that create Three.js meshes for each editor part type.

## Public Interface

```javascript
createBoxPart({ size, color })     // Box primitive
createWallPart({ size, color })    // Thin/tall box preset
createRoofPart({ size, color })    // 4-sided pyramid cone
createCylinderPart({ size, color }) // Cylinder primitive

buildPartMesh(part) → THREE.Mesh   // Main entry point
```

## Part Types

| Type | Builder | Default Size | Default Color |
|------|---------|--------------|---------------|
| `box` | `createBoxPart` | 1×1×1 | #b08968 |
| `wall` | `createWallPart` | 2×1.5×0.2 | #d9c8a9 |
| `roof` | `createRoofPart` | 2×2, height 1.2 | #b5432b |
| `cylinder` | `createCylinderPart` | radius 0.5, height 1.5 | #9c8b6e |

## buildPartMesh Logic

```javascript
buildPartMesh(part)
  ├── Look up builder by part.type in BUILDERS map
  ├── Call builder({ size: part.size, color: part.color })
  ├── Apply part.position offset
  ├── Apply part.rotationY
  └── Apply part.scale
```

## Internal Helper

```javascript
withShadow(mesh) → mesh  // Sets castShadow + receiveShadow
```
