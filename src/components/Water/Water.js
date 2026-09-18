import * as THREE from "three";
import { addShadow } from "../shared.js";
import { WATER_CONFIG } from "./config.js";

/**
 * Water plane — a semi-transparent blue slab that sits low to the ground.
 */
export function buildWater(group, x, z, y = 0) {
  const { color, opacity, width, depth, height, roughness, metalness } = WATER_CONFIG;

  const water = new THREE.Mesh(
    new THREE.BoxGeometry(width, height, depth),
    new THREE.MeshStandardMaterial({
      color,
      transparent: true,
      opacity,
      roughness,
      metalness,
    })
  );
  water.position.set(x, y + height / 2, z);
  water.receiveShadow = true;
  addShadow(water);
  group.add(water);
}
