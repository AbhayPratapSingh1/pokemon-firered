import * as THREE from "three";
import { COLLISION_RADIUS, COLLISION_HEIGHT } from "../../Player.js";
import { Teleporter } from "../../Teleporter.js";
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

  // --- Teleporters for door transitions ------------------------------------
  // Outside door → inside (near interior door)
  const teleportToInside = new Teleporter({
    from: { x: exteriorDoorWorldPos.x, z: exteriorDoorWorldPos.z + 0.8, radius: 1.0 },
    to:   { x: HOUSE_ORIGIN.x, z: HOUSE_ORIGIN.z + HALF_D - 1.2 },
    cooldown: 0.8,
    color: 0x00e5ff,
    showVisual: false,
  });

  // Inside door → outside (near exterior door)
  const teleportToOutside = new Teleporter({
    from: { x: HOUSE_ORIGIN.x, z: HOUSE_ORIGIN.z + HALF_D - 0.5, radius: 1.0 },
    to:   { x: exteriorDoorWorldPos.x, z: exteriorDoorWorldPos.z + 1.5 },
    cooldown: 0.8,
    color: 0xff9100,
    showVisual: false,
  });

  const TELEPORT_COOLDOWN = 0.8;

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

      if (!this.inside && teleportToInside.update(player, delta)) {
        this.inside = true;
        this.currentFloor = 0;
        this.cooldown = TELEPORT_COOLDOWN;
      } else if (this.inside && this.currentFloor === 0 && teleportToOutside.update(player, delta)) {
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
