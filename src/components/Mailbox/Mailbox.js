import * as THREE from "three";
import { addShadow } from "../shared.js";
import { MAILBOX_CONFIG } from "./config.js";

/**
 * Mailbox — a post with a small colored box on top.
 */
export function buildMailbox(group, x, z, y = 0) {
  const { postColor, postRadius, postHeight, boxColor, boxWidth, boxHeight, boxDepth, roughness } = MAILBOX_CONFIG;

  // Post
  const post = new THREE.Mesh(
    new THREE.CylinderGeometry(postRadius, postRadius, postHeight, 8),
    new THREE.MeshStandardMaterial({ color: postColor, roughness })
  );
  post.position.set(x, y + postHeight / 2, z);
  post.userData.collide = true;
  addShadow(post);
  group.add(post);

  // Box
  const box = new THREE.Mesh(
    new THREE.BoxGeometry(boxWidth, boxHeight, boxDepth),
    new THREE.MeshStandardMaterial({ color: boxColor, roughness })
  );
  box.position.set(x, y + postHeight + boxHeight / 2, z);
  box.userData.collide = true;
  addShadow(box);
  group.add(box);
}
