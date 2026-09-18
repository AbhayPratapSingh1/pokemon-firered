import * as THREE from "three";
import { addShadow } from "../shared.js";
import {
  FLOOR_WIDTH, FLOOR_DEPTH, WALL_HEIGHT, FLOOR_SLAB_THICK,
  HALF_W, HALF_D,
  FLIGHT_B_X0, FLIGHT_A_X1, FLIGHT_A_X0, LANDING_Z0, LANDING_Z1,
} from "../../house/AshHouse/constants.js";
import { FLOOR_CONFIG } from "./config.js";

/**
 * Ground floor plane (receives shadows).
 */
export function buildGroundFloor(group) {
  const groundFloor = new THREE.Mesh(
    new THREE.PlaneGeometry(FLOOR_WIDTH, FLOOR_DEPTH),
    new THREE.MeshStandardMaterial({ color: FLOOR_CONFIG.floorColor, roughness: 1 })
  );
  groundFloor.rotation.x = -Math.PI / 2;
  groundFloor.receiveShadow = true;
  group.add(groundFloor);
}

/**
 * Mid-level floor slab: floor 2's floor / floor 1's ceiling. Tiled as 5
 * rectangles around the L-shaped stairwell hole. Tagged cameraCollide (NOT
 * collide) so they appear in the camera raycaster but are excluded from
 * player collision.
 */
export function buildFloorSlab(group) {
  const { slabColor, slabCameraCollide } = FLOOR_CONFIG;
  const slabMaterial = new THREE.MeshStandardMaterial({ color: slabColor, roughness: 1 });
  const slabY = WALL_HEIGHT + FLOOR_SLAB_THICK / 2;

  function addSlab(x0, x1, z0, z1) {
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(x1 - x0, FLOOR_SLAB_THICK, z1 - z0), slabMaterial);
    mesh.position.set((x0 + x1) / 2, slabY, (z0 + z1) / 2);
    mesh.userData.cameraCollide = slabCameraCollide;
    group.add(addShadow(mesh));
  }

  addSlab(-HALF_W, FLIGHT_B_X0, -HALF_D, HALF_D);
  addSlab(FLIGHT_B_X0, HALF_W, 0, HALF_D);
  addSlab(FLIGHT_B_X0, FLIGHT_A_X1, -HALF_D, LANDING_Z0);
  addSlab(FLIGHT_A_X1, HALF_W, -HALF_D, 0);
  addSlab(FLIGHT_B_X0, FLIGHT_A_X0, LANDING_Z1, 0);
}
