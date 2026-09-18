import * as THREE from "three";
import { addShadow } from "../shared.js";
import { LAB_DESK_CONFIG } from "./config.js";

/**
 * Lab desk — a desk with a computer monitor, used by Professor Oak.
 */
export function buildLabDesk(group, x, z, y = 0) {
  const { topColor, legColor, topWidth, topHeight, topDepth, legRadius, legHeight, monitorColor, screenColor, roughness } = LAB_DESK_CONFIG;

  // Desk top
  const top = new THREE.Mesh(
    new THREE.BoxGeometry(topWidth, topHeight, topDepth),
    new THREE.MeshStandardMaterial({ color: topColor, roughness })
  );
  top.position.set(x, y + legHeight + topHeight / 2, z);
  top.userData.collide = true;
  addShadow(top);
  group.add(top);

  // Legs
  const legMat = new THREE.MeshStandardMaterial({ color: legColor, roughness });
  const offsets = [
    [-topWidth / 2 + 0.05, -topDepth / 2 + 0.05],
    [ topWidth / 2 - 0.05, -topDepth / 2 + 0.05],
    [-topWidth / 2 + 0.05,  topDepth / 2 - 0.05],
    [ topWidth / 2 - 0.05,  topDepth / 2 - 0.05],
  ];
  for (const [dx, dz] of offsets) {
    const leg = new THREE.Mesh(new THREE.CylinderGeometry(legRadius, legRadius, legHeight, 6), legMat);
    leg.position.set(x + dx, y + legHeight / 2, z + dz);
    addShadow(leg);
    group.add(leg);
  }

  // Monitor
  const monitor = new THREE.Mesh(
    new THREE.BoxGeometry(0.5, 0.4, 0.05),
    new THREE.MeshStandardMaterial({ color: monitorColor, roughness: 0.5 })
  );
  monitor.position.set(x, y + legHeight + 0.25, z - topDepth / 3);
  addShadow(monitor);
  group.add(monitor);

  // Screen
  const screen = new THREE.Mesh(
    new THREE.BoxGeometry(0.42, 0.32, 0.02),
    new THREE.MeshStandardMaterial({ color: screenColor, emissive: screenColor, emissiveIntensity: 0.4, roughness: 0.2 })
  );
  screen.position.set(x, y + legHeight + 0.25, z - topDepth / 3 + 0.04);
  group.add(screen);
}
