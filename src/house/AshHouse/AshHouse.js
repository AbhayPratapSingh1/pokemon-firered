import * as THREE from "three";
import { Space } from "../../engine/Space.js";
import { Teleporter } from "../../engine/Teleporter.js";
import { COLLISION_RADIUS, COLLISION_HEIGHT } from "../../Player.js";
import {
  HOUSE_ORIGIN, HALF_W, HALF_D, FLOOR2_HEIGHT,
  FLIGHT_A_X0, FLIGHT_A_X1, FLIGHT_A_Z0, FLIGHT_A_Z1,
  LANDING_X0, LANDING_X1, LANDING_Z0, LANDING_Z1,
  FLIGHT_B_X0, FLIGHT_B_X1, FLIGHT_B_Z0, FLIGHT_B_Z1,
} from "./constants.js";

// Components
import { buildGroundFloor, buildFloorSlab } from "../../components/Floor/Floor.js";
import { buildWalls } from "../../components/Walls/Walls.js";
import { buildRoof } from "../../components/Roof/Roof.js";
import { buildDoorFrame } from "../../components/Door/Door.js";
import { buildStairsVisual, buildParapets, getGroundHeight } from "../../components/Stairs/Stairs.js";
import { buildTV, getTVInteractable } from "../../components/TV/TV.js";
import { buildPlant } from "../../components/Plant/Plant.js";
import { buildCupboard } from "../../components/Cupboard/Cupboard.js";
import { buildDiningSet } from "../../components/DiningSet/DiningSet.js";
import { buildSink, getSinkInteractable } from "../../components/Sink/Sink.js";
import { buildBed, getBedInteractable } from "../../components/Bed/Bed.js";
import { buildComputerDesk, getPCInteractable } from "../../components/ComputerDesk/ComputerDesk.js";

// Layout config
import { GROUND_FLOOR_FURNITURE, SECOND_FLOOR_FURNITURE } from "./config.js";

// --- Component registry ----------------------------------------------------

const BUILDERS = {
  tv: buildTV,
  plant: buildPlant,
  cupboard: buildCupboard,
  diningSet: buildDiningSet,
  sink: buildSink,
  bed: buildBed,
  computerDesk: buildComputerDesk,
};

// --- Collision collection --------------------------------------------------

function collectObstacles(group) {
  const obstacles = [];
  group.traverse((child) => {
    if (child.userData.collide) {
      obstacles.push({ mesh: child, box: new THREE.Box3().setFromObject(child) });
    }
  });
  return obstacles;
}

// --- Space Builder ---------------------------------------------------------

/**
 * Creates a house Space with exterior and interior objects.
 *
 * @param {Object} opts
 * @param {string} opts.name - house name
 * @param {THREE.Vector3} opts.worldPosition - position in world
 * @param {number} opts.wallColor
 * @param {number} opts.roofColor
 * @param {number} opts.rotation - rotation in radians
 * @returns {Space} the house space
 */
export function createHouseSpace({
  name = "house",
  worldPosition = new THREE.Vector3(),
  wallColor = 0xead9b0,
  roofColor = 0xb5432b,
  rotation = 0,
} = {}) {
  const exterior = [];
  const interior = [];

  // --- Exterior: house shell (positioned at worldPosition) ---
  const shellGroup = new THREE.Group();
  shellGroup.position.copy(worldPosition);
  shellGroup.rotation.y = rotation;

  // Walls
  const wallMaterial = new THREE.MeshStandardMaterial({ color: wallColor, roughness: 0.9 });
  const walls = new THREE.Mesh(new THREE.BoxGeometry(6, 3, 6), wallMaterial);
  walls.position.y = 1.5;
  walls.castShadow = true;
  walls.receiveShadow = true;
  shellGroup.add(walls);

  // Roof
  const roofMaterial = new THREE.MeshStandardMaterial({ color: roofColor, roughness: 0.7 });
  const roofRadius = (Math.hypot(6, 6) / 2) * 1.05;
  const roof = new THREE.Mesh(new THREE.ConeGeometry(roofRadius, 2.2, 4), roofMaterial);
  roof.rotation.y = Math.PI / 4;
  roof.position.y = 4.1;
  roof.castShadow = true;
  shellGroup.add(roof);

  // Door
  const doorMaterial = new THREE.MeshStandardMaterial({ color: 0x3d2b1f, roughness: 0.8 });
  const door = new THREE.Mesh(new THREE.BoxGeometry(1.1, 1.8, 0.15), doorMaterial);
  door.position.set(0, 0.9, 3.08);
  shellGroup.add(door);

  // Windows
  const windowMaterial = new THREE.MeshStandardMaterial({ color: 0xa9d6e5, roughness: 0.4 });
  for (const dx of [-1.7, 1.7]) {
    const win = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.8, 0.1), windowMaterial);
    win.position.set(dx, 1.7, 3.06);
    shellGroup.add(win);
  }

  exterior.push(shellGroup);

  // --- Interior: furniture (positioned at HOUSE_ORIGIN for interior context) ---
  const interiorGroup = new THREE.Group();
  interiorGroup.position.copy(HOUSE_ORIGIN);

  // Build interior components
  buildGroundFloor(interiorGroup);
  buildRoof(interiorGroup);
  buildWalls(interiorGroup);
  buildDoorFrame(interiorGroup);
  buildFloorSlab(interiorGroup);
  buildParapets(interiorGroup);
  buildStairsVisual(interiorGroup);

  // Furniture
  for (const item of GROUND_FLOOR_FURNITURE) {
    BUILDERS[item.type](interiorGroup, ...item.args);
  }
  for (const item of SECOND_FLOOR_FURNITURE) {
    BUILDERS[item.type](interiorGroup, ...item.args);
  }

  interior.push(interiorGroup);

  // --- Collect obstacles ---
  interiorGroup.updateMatrixWorld(true);
  const obstacles = collectObstacles(interiorGroup);

  // --- Interactables ---
  const interactables = [
    getTVInteractable(HOUSE_ORIGIN.x - HALF_W + 1.05, HOUSE_ORIGIN.z - HALF_D + 1.1),
    getSinkInteractable(HOUSE_ORIGIN.x + 2.4, HOUSE_ORIGIN.z + HALF_D - 1.0),
    getBedInteractable(HOUSE_ORIGIN.x - HALF_W + 1.85, HOUSE_ORIGIN.z - HALF_D + 1.15, FLOOR2_HEIGHT),
    getPCInteractable(HOUSE_ORIGIN.x + HALF_W - 0.55, HOUSE_ORIGIN.z + HALF_D - 2.3, FLOOR2_HEIGHT),
  ];

  // --- Create Space ---
  const space = new Space({
    name,
    exterior,
    interior,
    data: {
      obstacles,
      interactables,
      worldPosition,
      groundHeight: (worldX, worldZ) => {
        const x = worldX - HOUSE_ORIGIN.x;
        const z = worldZ - HOUSE_ORIGIN.z;
        return getGroundHeight(x, z, { currentFloor: 0 });
      },
    },
  });

  return space;
}

/**
 * Creates door teleporters for a house space.
 *
 * @param {Space} houseSpace - the house space
 * @param {THREE.Vector3} doorWorldPosition - world position of the door
 * @param {number} doorDirection - 1 = south, -1 = north
 * @param {Space} worldSpace - the world space to return to
 * @returns {{ entry: Teleporter, exit: Teleporter }}
 */
export function createHouseTeleporters(houseSpace, doorWorldPosition, doorDirection, worldSpace) {
  // Entry: trigger near door OUTSIDE → player appears at room center
  const entry = new Teleporter({
    type: "trigger",
    target: houseSpace,
    triggerPosition: new THREE.Vector3(doorWorldPosition.x, 0, doorWorldPosition.z + doorDirection * 1.0),
    position: new THREE.Vector3(HOUSE_ORIGIN.x, 0, HOUSE_ORIGIN.z),
    orientation: Math.PI,
    radius: 1.2,
  });

  // Exit: trigger inside near door → player appears OUTSIDE, far from entry zone
  const exit = new Teleporter({
    type: "trigger",
    target: worldSpace,
    triggerPosition: new THREE.Vector3(HOUSE_ORIGIN.x, 0, HOUSE_ORIGIN.z + HALF_D - 1.0),
    position: new THREE.Vector3(doorWorldPosition.x, 0, doorWorldPosition.z - doorDirection * 3.0),
    orientation: 0,
    radius: 1.2,
  });

  return { entry, exit };
}

export { HOUSE_ORIGIN } from "./constants.js";
