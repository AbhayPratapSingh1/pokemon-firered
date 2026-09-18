import * as THREE from "three";
import { addShadow } from "../shared.js";
import { LAB_MACHINE_CONFIG } from "./config.js";

/**
 * Lab machine — a tall console with a glowing screen, used for Pokemon research.
 */
export function buildLabMachine(group, x, z, y = 0) {
  const { bodyColor, screenColor, accentColor, bodyWidth, bodyHeight, bodyDepth, screenWidth, screenHeight, roughness, metalness } = LAB_MACHINE_CONFIG;

  // Body
  const body = new THREE.Mesh(
    new THREE.BoxGeometry(bodyWidth, bodyHeight, bodyDepth),
    new THREE.MeshStandardMaterial({ color: bodyColor, roughness, metalness })
  );
  body.position.set(x, y + bodyHeight / 2, z);
  body.userData.collide = true;
  addShadow(body);
  group.add(body);

  // Screen
  const screen = new THREE.Mesh(
    new THREE.BoxGeometry(screenWidth, screenHeight, 0.05),
    new THREE.MeshStandardMaterial({ color: screenColor, emissive: screenColor, emissiveIntensity: 0.3, roughness: 0.2 })
  );
  screen.position.set(x, y + bodyHeight * 0.65, z + bodyDepth / 2 + 0.03);
  addShadow(screen);
  group.add(screen);

  // Accent strip
  const strip = new THREE.Mesh(
    new THREE.BoxGeometry(bodyWidth * 0.8, 0.05, bodyDepth * 0.1),
    new THREE.MeshStandardMaterial({ color: accentColor, roughness })
  );
  strip.position.set(x, y + bodyHeight * 0.3, z + bodyDepth / 2 + 0.03);
  group.add(strip);
}
