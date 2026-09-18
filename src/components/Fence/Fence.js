import * as THREE from "three";
import { addShadow } from "../shared.js";
import { FENCE_CONFIG } from "./config.js";

/**
 * Fence segment — posts connected by horizontal rails.
 */
export function buildFence(group, x, z, y = 0, length = 3) {
  const { color, postRadius, postHeight, railHeight, railCount, roughness } = FENCE_CONFIG;
  const material = new THREE.MeshStandardMaterial({ color, roughness });

  // Posts at each end
  for (const dx of [-length / 2, length / 2]) {
    const post = new THREE.Mesh(
      new THREE.CylinderGeometry(postRadius, postRadius, postHeight, 6),
      material
    );
    post.position.set(x + dx, y + postHeight / 2, z);
    post.userData.collide = true;
    addShadow(post);
    group.add(post);
  }

  // Horizontal rails
  for (let i = 0; i < railCount; i++) {
    const ry = postHeight * ((i + 1) / (railCount + 1));
    const rail = new THREE.Mesh(
      new THREE.BoxGeometry(length, railHeight, railHeight),
      material
    );
    rail.position.set(x, y + ry, z);
    addShadow(rail);
    group.add(rail);
  }
}
