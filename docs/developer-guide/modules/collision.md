# Collision Module

**File:** `src/Collision.js` (47 lines)

## Purpose

Stateless AABB collision resolution — pushes the player out of obstacles along the minimum penetration axis.

## Public Interface

```javascript
resolveCollisions(position, radius, height, obstacles)
```

| Parameter | Type | Description |
|-----------|------|-------------|
| `position` | `THREE.Vector3` | Player position (mutated in place) |
| `radius` | `number` | Player horizontal collision radius |
| `height` | `number` | Player collision height |
| `obstacles` | `{box: THREE.Box3}[]` | Array of obstacle objects |

## Algorithm

```
1. Build player AABB from position + radius + height
2. For each obstacle box:
   a. Check intersection with player box
   b. If no intersection: skip
   c. Compute overlap on X, Y, Z axes
   d. If Y overlap ≤ 0: skip (player is above/below)
   e. Find axis with minimum overlap
   f. Push player out along that axis
   g. Update player box for next iteration
```

## Design Decisions

- **Pure function** — no state, no side effects beyond mutating `position`
- **Axis of minimum penetration** — standard collision resolution technique
- **Sequential updates** — player box updated after each push-out, so multiple collisions in one frame resolve correctly
- **No velocity modification** — only position is changed; velocity is handled by `Player.js`
