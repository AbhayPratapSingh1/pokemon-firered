# CameraController Module

**File:** `src/CameraController.js` (70 lines)

## Purpose

Third-person camera with GTA-style wall collision detection.

## Responsibilities

- Read mouse deltas for yaw/pitch
- Compute camera position on sphere behind player
- Raycast for wall collision (pull camera forward)
- Smooth follow (lerp when pulling back, snap when pushing in)
- Look at player head position

## Public Interface

```javascript
class CameraController {
  constructor(camera)                      // THREE.PerspectiveCamera
  update(delta, input, player, collisionMeshes)  // collisionMeshes = THREE.Object3D[]
  get yaw → number                         // Used by Player for input rotation
}
```

## Camera Constants

| Constant | Value | Purpose |
|----------|-------|---------|
| `MOUSE_SENSITIVITY` | 0.0025 | Mouse look sensitivity |
| `MIN_PITCH` | -0.6 rad | Max look-down angle |
| `MAX_PITCH` | 1.2 rad | Max look-up angle |
| `DISTANCE` | 3.5 | Desired camera distance from player |
| `FOLLOW_SMOOTHING` | 10 | Lerp speed for following |
| `MIN_HEIGHT_ABOVE_GROUND` | 0.5 | Camera floor |
| `CAMERA_COLLISION_MARGIN` | 0.25 | Buffer from wall |
| `MIN_CAMERA_DISTANCE` | 0.6 | Min distance when wall pushes camera |

## Camera Collision

```
1. Compute desired position (sphere behind player)
2. Raycast from look target toward desired position
3. If hit: pull camera to hit distance - margin
4. If wall pushes camera closer than current: snap instantly (no lerp)
5. If pulling back: lerp smoothly toward desired position
```
