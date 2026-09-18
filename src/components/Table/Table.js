import * as THREE from "three";
import { addShadow } from "../shared.js";
import { TABLE_CONFIG } from "./config.js";

/**
 * Simple table — a flat top supported by four legs.
 */
export function buildTable(group, x, z, y = 0) {
  const { topColor, legColor, topWidth, topHeight, topDepth, legRadius, legHeight, roughness } = TABLE_CONFIG;

  const material = new THREE.MeshStandardMaterial({ roughness });

  // Tabletop
  const top = new THREE.Mesh(
    new THREE.BoxGeometry(topWidth, topHeight, topDepth),
    new THREE.MeshStandardMaterial({ color: topColor, roughness })
  );
  top.position.set(x, y + legHeight + topHeight / 2, z);
  top.userData.collide = true;
  addShadow(top);
  group.add(top);

  // Four legs
  const legMat = new THREE.MeshStandardMaterial({ color: legColor, roughness });
  const offsets = [
    [-topWidth / 2 + 0.05, -topDepth / 2 + 0.05],
    [ topWidth / 2 - 0.05, -topDepth / 2 + 0.05],
    [-topWidth / 2 + 0.05,  topDepth / 2 - 0.05],
    [ topWidth / 2 - 0.05,  topDepth / 2 - 0.05],
  ];
  for (const [dx, dz] of offsets) {
    const leg = new THREE.Mesh(
      new THREE.CylinderGeometry(legRadius, legRadius, legHeight, 6),
      legMat
    );
    leg.position.set(x + dx, y + legHeight / 2, z + dz);
    leg.userData.collide = true;
    addShadow(leg);
    group.add(leg);
  }
}
