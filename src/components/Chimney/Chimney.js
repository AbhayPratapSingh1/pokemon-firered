import * as THREE from "three";
import { addShadow } from "../shared.js";
import { CHIMNEY_CONFIG } from "./config.js";

/**
 * Simple chimney — a box that sits on top of a roof.
 */
export function buildChimney(group, x, z, y = 0) {
  const { color, width, height, depth, roughness } = CHIMNEY_CONFIG;

  const chimney = new THREE.Mesh(
    new THREE.BoxGeometry(width, height, depth),
    new THREE.MeshStandardMaterial({ color, roughness })
  );
  chimney.position.set(x, y + height / 2, z);
  chimney.userData.collide = true;
  addShadow(chimney);
  group.add(chimney);
}
