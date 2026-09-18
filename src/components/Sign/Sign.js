import * as THREE from "three";
import { addShadow } from "../shared.js";
import { SIGN_CONFIG } from "./config.js";

/**
 * Signpost — a post with a flat plaque for displaying text.
 */
export function buildSign(group, x, z, y = 0) {
  const { postColor, postRadius, postHeight, plaqueColor, plaqueWidth, plaqueHeight, plaqueDepth, roughness } = SIGN_CONFIG;

  // Post
  const post = new THREE.Mesh(
    new THREE.CylinderGeometry(postRadius, postRadius, postHeight, 8),
    new THREE.MeshStandardMaterial({ color: postColor, roughness })
  );
  post.position.set(x, y + postHeight / 2, z);
  post.userData.collide = true;
  addShadow(post);
  group.add(post);

  // Plaque
  const plaque = new THREE.Mesh(
    new THREE.BoxGeometry(plaqueWidth, plaqueHeight, plaqueDepth),
    new THREE.MeshStandardMaterial({ color: plaqueColor, roughness })
  );
  plaque.position.set(x, y + postHeight - plaqueHeight / 2 - 0.1, z + plaqueDepth);
  addShadow(plaque);
  group.add(plaque);
}
