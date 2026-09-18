import * as THREE from "three";
import { addShadow } from "../shared.js";
import { PLANT_CONFIG } from "./config.js";

/**
 * Potted plant: cylinder pot + sphere leaves.
 */
export function buildPlant(group, x, z, y = 0) {
  const { pot, leaves } = PLANT_CONFIG;

  const potMesh = new THREE.Mesh(
    new THREE.CylinderGeometry(pot.radiusTop, pot.radiusBottom, pot.height, pot.segments),
    new THREE.MeshStandardMaterial({ color: pot.color, roughness: 0.9 })
  );
  potMesh.position.set(x, y + PLANT_CONFIG.potY, z);
  potMesh.userData.collide = pot.collide;
  group.add(addShadow(potMesh));

  const leavesMesh = new THREE.Mesh(
    new THREE.SphereGeometry(leaves.radius, leaves.widthSegments, leaves.heightSegments),
    new THREE.MeshStandardMaterial({ color: leaves.color, roughness: 0.8 })
  );
  leavesMesh.position.set(x, y + PLANT_CONFIG.leavesY, z);
  group.add(addShadow(leavesMesh));
}
