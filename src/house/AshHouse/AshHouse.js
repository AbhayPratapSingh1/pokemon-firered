import * as THREE from "three";
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

function collectCameraMeshes(group) {
  const meshes = [];
  group.traverse((child) => {
    if (child.userData.collide || child.userData.cameraCollide) {
      meshes.push(child);
    }
  });
  return meshes;
}

// --- Trigger zone ----------------------------------------------------------

class Zone {
  constructor(minX, maxX, minZ, maxZ) {
    this.minX = minX;
    this.maxX = maxX;
    this.minZ = minZ;
    this.maxZ = maxZ;
  }
  contains(x, z) {
    return x >= this.minX && x <= this.maxX && z >= this.minZ && z <= this.maxZ;
  }
}

// --- Assembler -------------------------------------------------------------

/**
 * Builds the two-story house from component parts, wires up the door trigger,
 * and exposes the same controller API that PlayerHouseInterior.js had.
 *
 * @param {THREE.Scene} scene
 * @param {THREE.Vector3} exteriorDoorWorldPos
 * @returns {object} controller
 */
export function setupPlayerHouse(scene, exteriorDoorWorldPos) {
  const houseGroup = new THREE.Group();
  houseGroup.position.copy(HOUSE_ORIGIN);

  // --- Shell: structural elements ------------------------------------------
  buildGroundFloor(houseGroup);
  buildRoof(houseGroup);
  buildWalls(houseGroup);
  buildDoorFrame(houseGroup);
  buildFloorSlab(houseGroup);
  buildParapets(houseGroup);

  // --- Stairs (visual, non-collidable) -------------------------------------
  buildStairsVisual(houseGroup);

  // --- Furniture from config -----------------------------------------------
  for (const item of GROUND_FLOOR_FURNITURE) {
    BUILDERS[item.type](houseGroup, ...item.args);
  }
  for (const item of SECOND_FLOOR_FURNITURE) {
    BUILDERS[item.type](houseGroup, ...item.args);
  }

  scene.add(houseGroup);

  // Force world matrices so collision boxes land at HOUSE_ORIGIN, not (0,0,0).
  houseGroup.updateMatrixWorld(true);

  const interiorObstacles = collectObstacles(houseGroup);
  const interiorCollisionMeshes = collectCameraMeshes(houseGroup);

  // --- Interactables (world-space positions) --------------------------------
  const interactables = [
    getTVInteractable(HOUSE_ORIGIN.x - HALF_W + 1.05, HOUSE_ORIGIN.z - HALF_D + 1.1),
    getSinkInteractable(HOUSE_ORIGIN.x + 2.4, HOUSE_ORIGIN.z + HALF_D - 1.0),
    getBedInteractable(HOUSE_ORIGIN.x - HALF_W + 1.85, HOUSE_ORIGIN.z - HALF_D + 1.15, FLOOR2_HEIGHT),
    getPCInteractable(HOUSE_ORIGIN.x + HALF_W - 0.55, HOUSE_ORIGIN.z + HALF_D - 2.3, FLOOR2_HEIGHT),
  ];

  // --- Door trigger zones (world space) ------------------------------------
  const outsideDoorZone = new Zone(
    exteriorDoorWorldPos.x - 1.0,
    exteriorDoorWorldPos.x + 1.0,
    exteriorDoorWorldPos.z - 0.5,
    exteriorDoorWorldPos.z + 0.35
  );
  const insideExitZone = new Zone(
    HOUSE_ORIGIN.x - 1.0,
    HOUSE_ORIGIN.x + 1.0,
    HOUSE_ORIGIN.z + HALF_D - 0.5,
    HOUSE_ORIGIN.z + HALF_D + 0.2
  );

  const groundEntrySpawn = new THREE.Vector3(HOUSE_ORIGIN.x, 0, HOUSE_ORIGIN.z + HALF_D - 1.2);
  const outsideSpawn = new THREE.Vector3(exteriorDoorWorldPos.x, 0, exteriorDoorWorldPos.z + 1.2);

  const TELEPORT_COOLDOWN = 0.6;

  const controller = {
    inside: false,
    cooldown: 0,
    currentFloor: 0,
    interactables,

    getObstacles(outdoorObstacles) {
      return this.inside ? interiorObstacles : outdoorObstacles;
    },

    getCollisionMeshes(outdoorMeshes) {
      return this.inside ? interiorCollisionMeshes : outdoorMeshes;
    },

    getGroundHeight: (worldX, worldZ) => {
      if (!controller.inside) return 0;
      const x = worldX - HOUSE_ORIGIN.x;
      const z = worldZ - HOUSE_ORIGIN.z;
      return getGroundHeight(x, z, controller);
    },

    update(delta, player) {
      if (this.cooldown > 0) {
        this.cooldown -= delta;
        return;
      }
      const { x, z } = player.position;

      if (!this.inside && outsideDoorZone.contains(x, z)) {
        player.position.set(groundEntrySpawn.x, 0, groundEntrySpawn.z);
        this.inside = true;
        this.currentFloor = 0;
        this.cooldown = TELEPORT_COOLDOWN;
      } else if (this.inside && this.currentFloor === 0 && insideExitZone.contains(x, z)) {
        player.position.set(outsideSpawn.x, 0, outsideSpawn.z);
        this.inside = false;
        this.cooldown = TELEPORT_COOLDOWN;
      }
    },

    getDebugInfo(player) {
      if (!this.inside) return "outside";
      const x = player.position.x - HOUSE_ORIGIN.x;
      const z = player.position.z - HOUSE_ORIGIN.z;
      let region = "outside-hole";

      if (x >= FLIGHT_A_X0 && x <= FLIGHT_A_X1 && z >= FLIGHT_A_Z0 && z <= FLIGHT_A_Z1) region = "flightA";
      else if (x >= LANDING_X0 && x <= LANDING_X1 && z >= LANDING_Z0 && z <= LANDING_Z1) region = "landing";
      else if (x >= FLIGHT_B_X0 && x <= FLIGHT_B_X1 && z >= FLIGHT_B_Z0 && z <= FLIGHT_B_Z1) region = "flightB";

      const groundHeight = this.getGroundHeight(player.position.x, player.position.z);
      const playerBox = new THREE.Box3(
        new THREE.Vector3(player.position.x - COLLISION_RADIUS, player.position.y, player.position.z - COLLISION_RADIUS),
        new THREE.Vector3(player.position.x + COLLISION_RADIUS, player.position.y + COLLISION_HEIGHT, player.position.z + COLLISION_RADIUS)
      );
      const hits = interiorObstacles.filter((o) => o.box.intersectsBox(playerBox));

      return (
        `region=${region} floor=${this.currentFloor}\n` +
        `local x=${x.toFixed(2)} z=${z.toFixed(2)} y=${player.position.y.toFixed(2)}\n` +
        `groundHeight=${groundHeight.toFixed(2)}\n` +
        `colliding=${hits.length}: ` +
        hits.map((h) => `[${h.box.min.x.toFixed(2)},${h.box.min.z.toFixed(2)} - ${h.box.max.x.toFixed(2)},${h.box.max.z.toFixed(2)} y:${h.box.min.y.toFixed(2)}-${h.box.max.y.toFixed(2)}]`).join(" ")
      );
    },
  };

  return controller;
}

export { HOUSE_ORIGIN } from "./constants.js";
