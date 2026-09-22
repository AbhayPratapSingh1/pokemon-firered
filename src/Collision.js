import * as THREE from "three";

const MAX_STEP_HEIGHT = 0.5;
const STEP_UP_EPSILON = 0.05;

function pushHorizontally(position, box, overlapX, overlapZ) {
  if (overlapX < overlapZ) {
    const centerBox = (box.min.x + box.max.x) / 2;
    position.x += position.x < centerBox ? -overlapX : overlapX;
  } else {
    const centerBox = (box.min.z + box.max.z) / 2;
    position.z += position.z < centerBox ? -overlapZ : overlapZ;
  }
}

export function resolveCollisions(position, radius, height, obstacles) {
  const playerBox = new THREE.Box3(
    new THREE.Vector3(position.x - radius, position.y, position.z - radius),
    new THREE.Vector3(position.x + radius, position.y + height, position.z + radius)
  );

  for (const { box, canStandOn } of obstacles) {
    if (!playerBox.intersectsBox(box)) continue;

    const overlapX = Math.min(playerBox.max.x, box.max.x) - Math.max(playerBox.min.x, box.min.x);
    const overlapZ = Math.min(playerBox.max.z, box.max.z) - Math.max(playerBox.min.z, box.min.z);
    const overlapY = Math.min(playerBox.max.y, box.max.y) - Math.max(playerBox.min.y, box.min.y);

    if (overlapY <= 0) continue;

    const objectHeight = box.max.y - box.min.y;

    if (canStandOn && objectHeight <= MAX_STEP_HEIGHT) {
      const feetY = position.y;
      const stepSurface = box.max.y;
      const boxBottom = box.min.y;

      if (feetY >= stepSurface - STEP_UP_EPSILON) {
        position.y = stepSurface;
      } else if (stepSurface - feetY <= MAX_STEP_HEIGHT) {
        position.y = stepSurface;
      } else if (position.x > box.min.x && position.x < box.max.x &&
                 position.z > box.min.z && position.z < box.max.z) {
        position.y = boxBottom - height;
      } else {
        pushHorizontally(position, box, overlapX, overlapZ);
      }
    } else {
      pushHorizontally(position, box, overlapX, overlapZ);
    }

    playerBox.min.set(position.x - radius, position.y, position.z - radius);
    playerBox.max.set(position.x + radius, position.y + height, position.z + radius);
  }
}
