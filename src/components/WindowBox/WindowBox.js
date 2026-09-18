import * as THREE from "three";
import { addShadow } from "../shared.js";
import { WINDOW_BOX_CONFIG } from "./config.js";

/**
 * Window flower box — a small planter box with flowers, typically placed under a window.
 */
export function buildWindowBox(group, x, z, y = 0) {
  const { frameColor, flowerColor, leafColor, width, height, depth, roughness } = WINDOW_BOX_CONFIG;

  // Box frame
  const box = new THREE.Mesh(
    new THREE.BoxGeometry(width, height, depth),
    new THREE.MeshStandardMaterial({ color: frameColor, roughness })
  );
  box.position.set(x, y + height / 2, z);
  box.userData.collide = true;
  addShadow(box);
  group.add(box);

  // Flowers (small spheres)
  const flowerMat = new THREE.MeshStandardMaterial({ color: flowerColor, roughness: 0.7 });
  const leafMat = new THREE.MeshStandardMaterial({ color: leafColor, roughness: 0.8 });

  for (let i = -1; i <= 1; i++) {
    const leaf = new THREE.Mesh(new THREE.SphereGeometry(0.08, 6, 4), leafMat);
    leaf.position.set(x + i * 0.25, y + height + 0.06, z);
    group.add(leaf);

    const flower = new THREE.Mesh(new THREE.SphereGeometry(0.06, 6, 4), flowerMat);
    flower.position.set(x + i * 0.25, y + height + 0.12, z);
    group.add(flower);
  }
}
