import * as THREE from "three";
import { makeBox, at, addShadow } from "../shared.js";
import {
  WALL_THICK, PARAPET_HEIGHT,
  FLIGHT_A_STEPS, FLIGHT_A_RISE, FLIGHT_A_X0, FLIGHT_A_X1, FLIGHT_A_Z0, FLIGHT_A_Z1, STEP_DEPTH_A,
  FLIGHT_B_STEPS, FLIGHT_B_X0, FLIGHT_B_X1, FLIGHT_B_Z0, FLIGHT_B_Z1, STEP_DEPTH_B,
  LANDING_X0, LANDING_X1, LANDING_Z0, LANDING_Z1,
  STAIR_WIDTH, STEP_HEIGHT, FLOOR2_HEIGHT,
} from "./constants.js";
import { STAIRS_CONFIG } from "../Stairs/config.js";

/**
 * Mirrored L-shaped staircase for Gary's House.
 * Flight A runs along the WEST wall (instead of east).
 * Flight B runs EAST along the north wall (instead of west).
 */
export function buildStairsVisual(group) {
  const material = new THREE.MeshStandardMaterial({ color: STAIRS_CONFIG.treadsColor, roughness: 0.9 });
  const centerXA = (FLIGHT_A_X0 + FLIGHT_A_X1) / 2;
  const centerZB = (FLIGHT_B_Z0 + FLIGHT_B_Z1) / 2;

  for (let i = 0; i < FLIGHT_A_STEPS; i++) {
    const stepTopY = (i + 1) * STEP_HEIGHT;
    const stepZ = FLIGHT_A_Z1 - STEP_DEPTH_A * (i + 0.5);
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(STAIR_WIDTH, stepTopY, STEP_DEPTH_A), material);
    mesh.position.set(centerXA, stepTopY / 2, stepZ);
    group.add(addShadow(mesh));
  }

  const landing = new THREE.Mesh(
    new THREE.BoxGeometry(LANDING_X1 - LANDING_X0, FLIGHT_A_RISE, LANDING_Z1 - LANDING_Z0),
    material
  );
  landing.position.set((LANDING_X0 + LANDING_X1) / 2, FLIGHT_A_RISE / 2, (LANDING_Z0 + LANDING_Z1) / 2);
  group.add(addShadow(landing));

  for (let i = 0; i < FLIGHT_B_STEPS; i++) {
    const stepTopY = FLIGHT_A_RISE + (i + 1) * STEP_HEIGHT;
    const stepX = FLIGHT_B_X0 + STEP_DEPTH_B * (i + 0.5);
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(STEP_DEPTH_B, stepTopY, STAIR_WIDTH), material);
    mesh.position.set(stepX, stepTopY / 2, centerZB);
    group.add(addShadow(mesh));
  }
}

/**
 * Mirrored parapet walls.
 */
export function buildParapets(group) {
  const { parapetColor, parapetCollide } = STAIRS_CONFIG;

  for (let i = 0; i < FLIGHT_A_STEPS; i++) {
    const treadTop = (i + 1) * STEP_HEIGHT;
    const segZ1 = FLIGHT_A_Z1 - STEP_DEPTH_A * i;
    const segZ0 = segZ1 - STEP_DEPTH_A;
    const segHeight = treadTop + PARAPET_HEIGHT;
    const seg = makeBox(WALL_THICK, segHeight, STEP_DEPTH_A, parapetColor, { collide: parapetCollide });
    at(seg, FLIGHT_A_X1, segHeight / 2, (segZ0 + segZ1) / 2);
    group.add(seg);
  }

  for (let i = 0; i < FLIGHT_B_STEPS; i++) {
    const treadTop = FLIGHT_A_RISE + (i + 1) * STEP_HEIGHT;
    const segX0 = FLIGHT_B_X0 + STEP_DEPTH_B * i;
    const segX1 = segX0 + STEP_DEPTH_B;
    const segHeight = treadTop + PARAPET_HEIGHT;
    const seg = makeBox(STEP_DEPTH_B, segHeight, WALL_THICK, parapetColor, { collide: parapetCollide });
    at(seg, (segX0 + segX1) / 2, segHeight / 2, FLIGHT_B_Z0);
    group.add(seg);
  }
}

/**
 * Returns the walkable surface height at local (x, z) for Gary's mirrored stairs.
 */
export function getGroundHeight(localX, localZ, state) {
  const x = localX;
  const z = localZ;

  if (x >= FLIGHT_A_X0 && x <= FLIGHT_A_X1 && z >= FLIGHT_A_Z0 && z <= FLIGHT_A_Z1) {
    const run = FLIGHT_A_Z1 - z;
    const stepIndex = Math.min(FLIGHT_A_STEPS, Math.floor(run / STEP_DEPTH_A) + 1);
    const height = stepIndex * STEP_HEIGHT;
    state.currentFloor = height > FLOOR2_HEIGHT / 2 ? 1 : 0;
    return height;
  }
  if (x >= LANDING_X0 && x <= LANDING_X1 && z >= LANDING_Z0 && z <= LANDING_Z1) {
    state.currentFloor = FLIGHT_A_RISE > FLOOR2_HEIGHT / 2 ? 1 : 0;
    return FLIGHT_A_RISE;
  }
  if (x >= FLIGHT_B_X0 && x <= FLIGHT_B_X1 && z >= FLIGHT_B_Z0 && z <= FLIGHT_B_Z1) {
    const run = x - FLIGHT_B_X0;
    const stepIndex = Math.min(FLIGHT_B_STEPS, Math.floor(run / STEP_DEPTH_B) + 1);
    const height = FLIGHT_A_RISE + stepIndex * STEP_HEIGHT;
    state.currentFloor = height > FLOOR2_HEIGHT / 2 ? 1 : 0;
    return height;
  }

  return state.currentFloor === 1 ? FLOOR2_HEIGHT : 0;
}
