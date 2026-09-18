import * as THREE from "three";
import { addShadow } from "../shared.js";
import { SHELTER_CONFIG } from "./config.js";

/**
 * Simple shelter / canopy — a flat roof slab supported by 4 corner poles.
 * Provides shade for a person standing underneath.
 */
export function buildShelter(group, x, z, y = 0) {
  const { roofColor, roofWidth, roofDepth, roofThickness, legColor, legRadius, legHeight, legCount, roughness } = SHELTER_CONFIG;

  // Roof slab
  const roof = new THREE.Mesh(
    new THREE.BoxGeometry(roofWidth, roofThickness, roofDepth),
    new THREE.MeshStandardMaterial({ color: roofColor, roughness })
  );
  roof.position.set(x, y + legHeight + roofThickness / 2, z);
  roof.userData.collide = true;
  addShadow(roof);
  group.add(roof);

  // Legs at the 4 corners
  const hw = roofWidth / 2 - legRadius * 2;
  const hd = roofDepth / 2 - legRadius * 2;
  const legPositions = [
    { dx: -hw, dz: -hd },
    { dx: hw, dz: -hd },
    { dx: -hw, dz: hd },
    { dx: hw, dz: hd },
  ];

  for (let i = 0; i < Math.min(legCount, legPositions.length); i++) {
    const { dx, dz } = legPositions[i];
    const leg = new THREE.Mesh(
      new THREE.CylinderGeometry(legRadius, legRadius, legHeight, 8),
      new THREE.MeshStandardMaterial({ color: legColor, roughness })
    );
    leg.position.set(x + dx, y + legHeight / 2, z + dz);
    leg.userData.collide = true;
    addShadow(leg);
    group.add(leg);
  }
}
