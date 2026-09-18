import * as THREE from "three";

/**
 * Resolves collisions between a cylindrical player (approximated as an AABB)
 * and a list of obstacle bounding boxes, by pushing the player position out
 * along the axis of minimum penetration. Stateless/pure so it can be swapped
 * for a real physics engine later without touching Player.js's call site.
 *
 * @param {THREE.Vector3} position - player position (mutated in place)
 * @param {number} radius - player horizontal collision radius
 * @param {number} height - player collision height
 * @param {{box: THREE.Box3}[]} obstacles
 */
export function resolveCollisions(position, radius, height, obstacles) {
  const playerBox = new THREE.Box3(
    new THREE.Vector3(position.x - radius, position.y, position.z - radius),
    new THREE.Vector3(position.x + radius, position.y + height, position.z + radius)
  );

  for (const { box } of obstacles) {
    if (!playerBox.intersectsBox(box)) continue;

    // Overlap extents along each axis.
    const overlapX = Math.min(playerBox.max.x, box.max.x) - Math.max(playerBox.min.x, box.min.x);
    const overlapZ = Math.min(playerBox.max.z, box.max.z) - Math.max(playerBox.min.z, box.min.z);
    const overlapY = Math.min(playerBox.max.y, box.max.y) - Math.max(playerBox.min.y, box.min.y);

    if (overlapY <= 0) continue;

    // Push out along the axis with the smallest overlap (minimum translation).
    if (overlapX < overlapZ) {
      const centerPlayer = position.x;
      const centerBox = (box.min.x + box.max.x) / 2;
      const push = centerPlayer < centerBox ? -overlapX : overlapX;
      position.x += push;
    } else {
      const centerPlayer = position.z;
      const centerBox = (box.min.z + box.max.z) / 2;
      const push = centerPlayer < centerBox ? -overlapZ : overlapZ;
      position.z += push;
    }

    // Update playerBox for subsequent obstacle checks this frame.
    playerBox.min.set(position.x - radius, position.y, position.z - radius);
    playerBox.max.set(position.x + radius, position.y + height, position.z + radius);
  }
}
