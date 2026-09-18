import * as THREE from "three";
import { addShadow } from "../shared.js";
import { TREE_CONFIG } from "./config.js";

/**
 * Simple tree — a cylinder trunk topped with a cone canopy.
 * Total height ~4m (2-3 person heights).
 */
export function buildTree(group, x, z, y = 0) {
  const { trunkColor, trunkRadius, trunkHeight, canopyColor, canopyRadius, canopyHeight, canopySegments, roughness } = TREE_CONFIG;

  // Trunk
  const trunk = new THREE.Mesh(
    new THREE.CylinderGeometry(trunkRadius * 0.7, trunkRadius, trunkHeight, 8),
    new THREE.MeshStandardMaterial({ color: trunkColor, roughness })
  );
  trunk.position.set(x, y + trunkHeight / 2, z);
  trunk.userData.collide = true;
  addShadow(trunk);
  group.add(trunk);

  // Canopy (cone)
  const canopy = new THREE.Mesh(
    new THREE.ConeGeometry(canopyRadius, canopyHeight, canopySegments),
    new THREE.MeshStandardMaterial({ color: canopyColor, roughness })
  );
  canopy.position.set(x, y + trunkHeight + canopyHeight / 2, z);
  addShadow(canopy);
  group.add(canopy);
}
