import * as THREE from "three";
import { COLLISION_RADIUS, COLLISION_HEIGHT } from "../../Player.js";

// --- Building footprint (same as Ash's House) --------------------------------
export const FLOOR_WIDTH = 12;
export const FLOOR_DEPTH = 10;
export const WALL_HEIGHT = 3.6;
export const FLOOR_SLAB_THICK = 0.3;
export const FLOOR2_HEIGHT = WALL_HEIGHT + FLOOR_SLAB_THICK;
export const BUILDING_TOTAL_HEIGHT = FLOOR2_HEIGHT + WALL_HEIGHT;
export const WALL_THICK = 0.2;
export const DOOR_HALF_WIDTH = 1.1;
export const DOOR_HEIGHT = 2.4;
export const HALF_W = FLOOR_WIDTH / 2;
export const HALF_D = FLOOR_DEPTH / 2;

// --- L-shaped staircase (MIRRORED: Flight A on west wall, Flight B runs east)
export const MARGIN = 0.1;
export const STAIR_WIDTH = COLLISION_RADIUS * 2 + 0.7;
export const STEP_HEIGHT = COLLISION_HEIGHT / 6;
export const LANDING_SIZE = STAIR_WIDTH;
export const FLIGHT_A_STEPS = 6;
export const FLIGHT_A_RISE = FLIGHT_A_STEPS * STEP_HEIGHT;
export const FLIGHT_B_STEPS = 7;
export const FLIGHT_B_RISE = FLIGHT_B_STEPS * STEP_HEIGHT;

// Flight A: runs north (-z) along the WEST wall (mirrored from east)
export const FLIGHT_A_X0 = -HALF_W + MARGIN;
export const FLIGHT_A_X1 = FLIGHT_A_X0 + STAIR_WIDTH;
export const FLIGHT_A_Z1 = 0;
export const FLIGHT_A_Z0 = -(HALF_D - MARGIN - LANDING_SIZE);
export const STEP_DEPTH_A = (FLIGHT_A_Z1 - FLIGHT_A_Z0) / FLIGHT_A_STEPS;

// Landing: NW corner (mirrored from NE)
export const LANDING_X0 = FLIGHT_A_X0;
export const LANDING_X1 = FLIGHT_A_X1;
export const LANDING_Z1 = FLIGHT_A_Z0;
export const LANDING_Z0 = LANDING_Z1 - LANDING_SIZE;

// Flight B: runs east (+x) along the north wall (mirrored from west)
export const FLIGHT_B_Z0 = LANDING_Z0;
export const FLIGHT_B_Z1 = LANDING_Z1;
export const FLIGHT_B_X0 = LANDING_X1;
export const STEP_DEPTH_B = STEP_DEPTH_A;
export const FLIGHT_B_X1 = FLIGHT_B_X0 + FLIGHT_B_STEPS * STEP_DEPTH_B;

// Parapets
export const PARAPET_HEIGHT = 0.9;

// --- World position --------------------------------------------------------
// Gary's House is at (14, 0, -14) in the world — interior lives here.
export const HOUSE_ORIGIN = new THREE.Vector3(14, 0, -14);

// Message shown when interacting with the door
export const HOUSE_MESSAGE = "This is Gary's House. His sister Daisy lives here.";
