import * as THREE from "three";

const MAX_STEP_HEIGHT = 0.5;
const STEP_UP_EPSILON = 0.05;

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
        // Player feet at or above step surface → push up (stepping onto it)
        position.y = stepSurface;
      } else if (stepSurface - feetY <= MAX_STEP_HEIGHT) {
        // Player feet below surface but within step-up range → push up onto surface
        position.y = stepSurface;
      } else if (position.x > box.min.x && position.x < box.max.x &&
                 position.z > box.min.z && position.z < box.max.z) {
        // Player center is inside the box footprint → truly under it → head collision, push down
        position.y = boxBottom - height;
      } else {
        // Player feet too far below → push horizontally (hitting the side)
        if (overlapX < overlapZ) {
          const centerPlayer = position.x;
          const centerBox = (box.min.x + box.max.x) / 2;
          position.x += centerPlayer < centerBox ? -overlapX : overlapX;
        } else {
          const centerPlayer = position.z;
          const centerBox = (box.min.z + box.max.z) / 2;
          position.z += centerPlayer < centerBox ? -overlapZ : overlapZ;
        }
      }
    } else {
      // Tall object or not standable — horizontal-only push
      if (overlapX < overlapZ) {
        const centerPlayer = position.x;
        const centerBox = (box.min.x + box.max.x) / 2;
        position.x += centerPlayer < centerBox ? -overlapX : overlapX;
      } else {
        const centerPlayer = position.z;
        const centerBox = (box.min.z + box.max.z) / 2;
        position.z += centerPlayer < centerBox ? -overlapZ : overlapZ;
      }
    }

    playerBox.min.set(position.x - radius, position.y, position.z - radius);
    playerBox.max.set(position.x + radius, position.y + height, position.z + radius);
  }
}
