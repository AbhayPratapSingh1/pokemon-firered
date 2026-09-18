import * as THREE from "three";
import { addShadow } from "../shared.js";
import { LAB_PLANT_CONFIG } from "./config.js";

/**
 * Lab plant — a potted plant with tall leaves, placed near the entrance.
 */
export function buildLabPlant(group, x, z, y = 0) {
  const { potColor, potRadius, potHeight, leafColor, leafCount, leafLength, roughness } = LAB_PLANT_CONFIG;

  // Pot (tapered cylinder)
  const pot = new THREE.Mesh(
    new THREE.CylinderGeometry(potRadius * 0.7, potRadius, potHeight, 8),
    new THREE.MeshStandardMaterial({ color: potColor, roughness })
  );
  pot.position.set(x, y + potHeight / 2, z);
  pot.userData.collide = true;
  addShadow(pot);
  group.add(pot);

  // Soil
  const soil = new THREE.Mesh(
    new THREE.CylinderGeometry(potRadius * 0.65, potRadius * 0.65, 0.05, 8),
    new THREE.MeshStandardMaterial({ color: 0x4e342e, roughness })
  );
  soil.position.set(x, y + potHeight, z);
  group.add(soil);

  // Leaves
  const leafMat = new THREE.MeshStandardMaterial({ color: leafColor, roughness: 0.7 });
  for (let i = 0; i < leafCount; i++) {
    const angle = (i / leafCount) * Math.PI * 2;
    const leaf = new THREE.Mesh(
      new THREE.BoxGeometry(0.08, leafLength, 0.02),
      leafMat
    );
    leaf.position.set(
      x + Math.cos(angle) * 0.1,
      y + potHeight + leafLength / 2,
      z + Math.sin(angle) * 0.1
    );
    leaf.rotation.x = -0.3;
    leaf.rotation.y = angle;
    addShadow(leaf);
    group.add(leaf);
  }
}
