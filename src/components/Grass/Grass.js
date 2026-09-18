import * as THREE from "three";
import { addShadow } from "../shared.js";
import { GRASS_CONFIG } from "./config.js";

/**
 * Tall grass cluster — several blade-like quads radiating from a center point,
 * tall enough to cover half a person (~0.9m). Each blade is a thin, tapered box.
 */
export function buildGrass(group, x, z, y = 0) {
  const { color, height, width, depth, segments, leafCount, leafSpread, roughness } = GRASS_CONFIG;
  const material = new THREE.MeshStandardMaterial({ color, roughness, side: THREE.DoubleSide });

  for (let i = 0; i < leafCount; i++) {
    const angle = (i / leafCount) * Math.PI * 2 + (Math.random() - 0.5) * 0.3;
    const bladeH = height * (0.7 + Math.random() * 0.3);
    const bladeW = width * (0.6 + Math.random() * 0.4);

    const blade = new THREE.Mesh(
      new THREE.BoxGeometry(bladeW, bladeH, 0.02),
      material
    );
    blade.position.set(
      x + Math.cos(angle) * leafSpread,
      y + bladeH / 2,
      z + Math.sin(angle) * leafSpread
    );
    blade.rotation.y = angle;
    blade.rotation.x = (Math.random() - 0.5) * 0.15;
    blade.userData.collide = true;
    addShadow(blade);
    group.add(blade);
  }
}
