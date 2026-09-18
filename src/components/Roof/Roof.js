import * as THREE from "three";
import { FLOOR_WIDTH, FLOOR_DEPTH, BUILDING_TOTAL_HEIGHT } from "../../house/AshHouse/constants.js";
import { ROOF_CONFIG } from "./config.js";

/**
 * Roof ceiling plane at the top of the building. Tagged collide for camera
 * occlusion. A flat plane never overlaps the player's AABB in Y, so it is
 * harmless as a player collision obstacle.
 */
export function buildRoof(group) {
  const roofCeiling = new THREE.Mesh(
    new THREE.PlaneGeometry(FLOOR_WIDTH, FLOOR_DEPTH),
    new THREE.MeshStandardMaterial({ color: ROOF_CONFIG.color, roughness: 1, side: THREE.DoubleSide })
  );
  roofCeiling.rotation.x = Math.PI / 2;
  roofCeiling.position.y = BUILDING_TOTAL_HEIGHT;
  roofCeiling.userData.collide = ROOF_CONFIG.collide;
  group.add(roofCeiling);
}
