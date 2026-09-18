import * as THREE from "three";
import { createHouse } from "./Buildings.js";
import { createOakLab } from "./buildings/OakLab/OakLab.js";
import { createGaryExterior } from "./buildings/GaryHouse/GaryHouse.js";
import { buildTree } from "./components/Tree/Tree.js";
import { listModels } from "./ModelStore.js";
import { buildModelGroup } from "./ModelLoader.js";
import { setupGaryHouse } from "./house/GaryHouse/GaryHouse.js";
import { Teleporter } from "./Teleporter.js";

const GROUND_SIZE = 200;
const TREE_COUNT = 16;
const TREE_RING_MIN = 30;
const TREE_RING_MAX = 70;

function randomRange(min, max) {
  return min + Math.random() * (max - min);
}

function createGround() {
  const geometry = new THREE.PlaneGeometry(GROUND_SIZE, GROUND_SIZE);
  const material = new THREE.MeshStandardMaterial({ color: 0x3a7d44, roughness: 1 });
  const ground = new THREE.Mesh(geometry, material);
  ground.rotation.x = -Math.PI / 2;
  ground.receiveShadow = true;
  return ground;
}

/** Flat rectangular dirt strip laid over the grass, purely visual. */
function addPathSegment(scene, from, to, width = 2.5) {
  const dx = to.x - from.x;
  const dz = to.z - from.z;
  const length = Math.hypot(dx, dz);
  const angle = Math.atan2(dx, dz);

  const material = new THREE.MeshStandardMaterial({ color: 0xc2a267, roughness: 1 });
  const path = new THREE.Mesh(new THREE.PlaneGeometry(width, length), material);
  path.rotation.x = -Math.PI / 2;
  path.rotation.z = -angle;
  path.position.set((from.x + to.x) / 2, 0.02, (from.z + to.z) / 2);
  path.receiveShadow = true;
  scene.add(path);
}

function addPond(scene, position, radius = 5) {
  const material = new THREE.MeshStandardMaterial({ color: 0x3a86c8, roughness: 0.3 });
  const pond = new THREE.Mesh(new THREE.CircleGeometry(radius, 24), material);
  pond.rotation.x = -Math.PI / 2;
  pond.position.set(position.x, 0.02, position.z);
  scene.add(pond);
}

/** Checks if (x,z) is too close to any building footprint or the spawn clearing. */
function isInsideExclusionZone(x, z, exclusionZones) {
  for (const zone of exclusionZones) {
    if (Math.abs(x - zone.x) < zone.halfW && Math.abs(z - zone.z) < zone.halfD) return true;
  }
  return false;
}

function scatterTrees(scene, obstacles, exclusionZones) {
  for (let i = 0; i < TREE_COUNT; i++) {
    let x = 0;
    let z = 0;
    let attempts = 0;
    do {
      const angle = randomRange(0, Math.PI * 2);
      const radius = randomRange(TREE_RING_MIN, TREE_RING_MAX);
      x = Math.cos(angle) * radius;
      z = Math.sin(angle) * radius;
      attempts++;
    } while (isInsideExclusionZone(x, z, exclusionZones) && attempts < 20);

    // Build tree using new Tree component (wraps in its own group)
    const treeGroup = new THREE.Group();
    treeGroup.position.set(x, 0, z);
    buildTree(treeGroup, 0, 0, 0);
    scene.add(treeGroup);

    // Collide with the trunk only, not the canopy, so players can walk under trees.
    const trunkRadius = 0.25;
    const box = new THREE.Box3(
      new THREE.Vector3(x - trunkRadius, 0, z - trunkRadius),
      new THREE.Vector3(x + trunkRadius, 1.5, z + trunkRadius)
    );
    obstacles.push({ mesh: treeGroup, box });
  }
}

/**
 * Original small-town layout inspired by classic top-down RPG towns: two
 * houses and a larger "lab" building around the player's spawn point, with
 * paths, fences, trees, and a pond. No trademarked names/art/map data used.
 */
const PLAYERS_HOUSE_POSITION = new THREE.Vector3(-14, 0, -14);
const PLAYERS_HOUSE_DEPTH = 6;
const PLAYERS_HOUSE_WIDTH = 6;
const PLAYERS_HOUSE_WALL_HEIGHT = 3;
const PLAYERS_HOUSE_ROOF_HEIGHT = 2.2;
const PLAYERS_HOUSE_DOOR_HALF_WIDTH = 1.0;
const PLAYERS_HOUSE_DOOR_NOTCH_DEPTH = 0.8;

// World-space position of the player's house door (matches createHouse()'s
// door placement: centered on x, on the +z/south face). Used to align the
// FireRed interior's entrance trigger with the exterior door.
export const PLAYERS_HOUSE_DOOR_POSITION = new THREE.Vector3(
  PLAYERS_HOUSE_POSITION.x,
  0,
  PLAYERS_HOUSE_POSITION.z + PLAYERS_HOUSE_DEPTH / 2
);

/**
 * Unlike the other decorative buildings (solid box obstacle), the player's
 * house needs a walkable door opening so the interior trigger zone in
 * PlayerHouseInterior.js is reachable. createHouse() itself still renders a
 * single solid wall box (unchanged, shared with the other buildings) — here
 * we instead build the *collision* as three boxes that leave a notch open at
 * the door, rather than one box covering the whole footprint.
 */
function buildPlayersHouseObstacles(house) {
  const { x: px, z: pz } = PLAYERS_HOUSE_POSITION;
  const halfW = PLAYERS_HOUSE_WIDTH / 2;
  const halfD = PLAYERS_HOUSE_DEPTH / 2;
  const totalHeight = PLAYERS_HOUSE_WALL_HEIGHT + PLAYERS_HOUSE_ROOF_HEIGHT;
  const gapHalf = PLAYERS_HOUSE_DOOR_HALF_WIDTH;
  const notchDepth = PLAYERS_HOUSE_DOOR_NOTCH_DEPTH;

  const westBox = new THREE.Box3(
    new THREE.Vector3(px - halfW, 0, pz - halfD),
    new THREE.Vector3(px - gapHalf, totalHeight, pz + halfD)
  );
  const eastBox = new THREE.Box3(
    new THREE.Vector3(px + gapHalf, 0, pz - halfD),
    new THREE.Vector3(px + halfW, totalHeight, pz + halfD)
  );
  // Middle strip (spans the door's x-range) solid everywhere except the
  // shallow notch cut in from the south face, which is the door opening.
  const middleBox = new THREE.Box3(
    new THREE.Vector3(px - gapHalf, 0, pz - halfD),
    new THREE.Vector3(px + gapHalf, totalHeight, pz + halfD - notchDepth)
  );

  return [
    { mesh: house, box: westBox },
    { mesh: house, box: eastBox },
    { mesh: house, box: middleBox },
  ];
}

/**
 * Generic door-notch collision for a building.
 * Creates 3 boxes: two side walls and a middle strip with door gap.
 * Supports rotation via rotationY (radians).
 */
function buildDoorNotchObstacles(mesh, position, width, depth, totalHeight, rotationY = 0, doorHalfWidth = 0.7) {
  const { x: px, z: pz } = position;
  const halfW = width / 2;
  const halfD = depth / 2;

  // Door is always on the +Z (south) face in local space.
  // After rotation, we need world-space collision boxes.
  const cos = Math.cos(rotationY);
  const sin = Math.sin(rotationY);

  // Local-space corner offsets from center (south face = +Z)
  // West wall: x from -halfW to -doorHalfWidth, z from -halfD to +halfD
  // East wall: x from +doorHalfWidth to +halfW, z from -halfD to +halfD
  // Middle:   x from -doorHalfWidth to +doorHalfWidth, z from -halfD to 0 (only back half, door open in front)

  function localToWorld(lx, ly, lz) {
    return new THREE.Vector3(
      px + lx * cos - lz * sin,
      ly,
      pz + lx * sin + lz * cos
    );
  }

  // For a 180° rotation (cos=-1, sin=0), local +Z becomes world -Z.
  // The door gap must be on the correct face.
  // We build collision in local space, then rotate the corners to world space.

  // Back wall (away from door): z = -halfD in local
  // Front wall (door side): z = +halfD in local

  // Middle box covers the full depth MINUS the door opening depth.
  // Door opening extends from the front face inward by ~1m.
  const doorDepth = 1.2;

  // West wall (full depth)
  const westMin = localToWorld(-halfW, 0, -halfD);
  const westMax = localToWorld(-doorHalfWidth, totalHeight, halfD);

  // East wall (full depth)
  const eastMin = localToWorld(doorHalfWidth, 0, -halfD);
  const eastMax = localToWorld(halfW, totalHeight, halfD);

  // Middle (back portion only — door gap is at front/+Z face)
  const midMin = localToWorld(-doorHalfWidth, 0, -halfD);
  const midMax = localToWorld(doorHalfWidth, totalHeight, halfD - doorDepth);

  // Ensure min < max for each box (rotation can flip axes)
  function fixBox(min, max) {
    return new THREE.Box3(
      new THREE.Vector3(
        Math.min(min.x, max.x),
        Math.min(min.y, max.y),
        Math.min(min.z, max.z)
      ),
      new THREE.Vector3(
        Math.max(min.x, max.x),
        Math.max(min.y, max.y),
        Math.max(min.z, max.z)
      )
    );
  }

  return [
    { mesh, box: fixBox(westMin, westMax) },
    { mesh, box: fixBox(eastMin, eastMax) },
    { mesh, box: fixBox(midMin, midMax) },
  ];
}

function createTownLayout(scene) {
  const obstacles = [];

  // Player's house (keeps special door notch collision from Buildings.js)
  const playersHouse = createHouse({
    position: PLAYERS_HOUSE_POSITION,
    rotationY: 0,
    wallColor: 0xead9b0,
    roofColor: 0xb5432b,
    depth: PLAYERS_HOUSE_DEPTH,
    width: PLAYERS_HOUSE_WIDTH,
    wallHeight: PLAYERS_HOUSE_WALL_HEIGHT,
    roofHeight: PLAYERS_HOUSE_ROOF_HEIGHT,
  });
  scene.add(playersHouse);
  obstacles.push(...buildPlayersHouseObstacles(playersHouse));

  // Gary's house exterior (chimney, mailbox, fence)
  const neighborsHouse = createGaryExterior({
    position: new THREE.Vector3(14, 0, -14),
    rotationY: 0,
  });
  scene.add(neighborsHouse);
  obstacles.push(...buildDoorNotchObstacles(
    neighborsHouse,
    new THREE.Vector3(14, 0, -14),
    6, 6, 5.2, 0, 0.7
  ));

  // Oak's lab (sign, windows, flat roof)
  const lab = createOakLab({
    position: new THREE.Vector3(0, 0, 16),
    rotationY: Math.PI,
  });
  scene.add(lab);
  obstacles.push(...buildDoorNotchObstacles(
    lab,
    new THREE.Vector3(0, 0, 16),
    10, 8, 3.55, Math.PI, 0.7
  ));

  // Paths connecting the spawn clearing to each building's door.
  const spawn = new THREE.Vector3(0, 0, 0);
  addPathSegment(scene, spawn, new THREE.Vector3(-14, 0, -10));
  addPathSegment(scene, spawn, new THREE.Vector3(14, 0, -10));
  addPathSegment(scene, spawn, new THREE.Vector3(0, 0, 11));

  // Keep spawn, buildings, and paths clear of randomly-scattered trees.
  const exclusionZones = [
    { x: 0, z: 0, halfW: 8, halfD: 8 },
    { x: -14, z: -14, halfW: 7, halfD: 7 },
    { x: 14, z: -14, halfW: 8, halfD: 8 },
    { x: 0, z: 16, halfW: 10, halfD: 8 },
    { x: 24, z: 6, halfW: 6, halfD: 6 },
  ];
  scatterTrees(scene, obstacles, exclusionZones);

  placeDemoSavedModel(scene, obstacles);

  // --- Interior controllers (teleporter-based) ---
  const garyHouseController = setupGaryHouseInterior(
    scene,
    new THREE.Vector3(14, 0, -14 + 3)  // Gary's door at +Z face
  );

  const oakLabController = setupOakLabInterior(
    scene,
    new THREE.Vector3(0, 0, 16 - 4)  // Oak's door at -Z face (rotated PI)
  );

  return {
    obstacles,
    garyHouseController,
    oakLabController,
  };
}

/**
 * Oak's Lab — interior is already rendered inside the building.
 * Uses teleporters to move player in/out through the door.
 */
function setupOakLabInterior(scene, doorWorldPos) {
  const LAB_ORIGIN = new THREE.Vector3(0, 0, 16);
  const LAB_WIDTH = 10;
  const LAB_DEPTH = 8;
  const LAB_HALF_D = LAB_DEPTH / 2;

  const teleportToInside = new Teleporter({
    from: { x: doorWorldPos.x, z: doorWorldPos.z - 0.8, radius: 1.0 },
    to:   { x: LAB_ORIGIN.x, z: LAB_ORIGIN.z - LAB_HALF_D + 1.5 },
    cooldown: 0.8,
    color: 0x00e5ff,
    showVisual: false,
  });

  const teleportToOutside = new Teleporter({
    from: { x: LAB_ORIGIN.x, z: LAB_ORIGIN.z - LAB_HALF_D + 0.5, radius: 1.0 },
    to:   { x: doorWorldPos.x, z: doorWorldPos.z - 1.5 },
    cooldown: 0.8,
    color: 0xff9100,
    showVisual: false,
  });

  const TELEPORT_COOLDOWN = 0.8;

  // Oak's lab interior is simple — no stairs, just flat floor.
  // We don't need to swap collision since the interior walls are already
  // inside the building geometry. Just handle teleportation.
  return {
    inside: false,
    cooldown: 0,
    currentFloor: 0,
    interactables: [],

    getObstacles(outdoorObstacles) {
      return outdoorObstacles;
    },

    getCollisionMeshes(outdoorMeshes) {
      return outdoorMeshes;
    },

    getGroundHeight: () => 0,

    update(delta, player) {
      if (this.cooldown > 0) {
        this.cooldown -= delta;
        return;
      }

      if (!this.inside && teleportToInside.update(player, delta)) {
        this.inside = true;
        this.cooldown = TELEPORT_COOLDOWN;
      } else if (this.inside && teleportToOutside.update(player, delta)) {
        this.inside = false;
        this.cooldown = TELEPORT_COOLDOWN;
      }
    },

    getDebugInfo() {
      return this.inside ? "inside oak lab" : "outside";
    },
  };
}

/**
 * Renders one saved model built in editor.html (the most recently saved),
 * if any exist in localStorage, as a proof that custom models built there
 * can be placed and collided with in the main game. No-op until the user
 * has actually built and saved something.
 */
function placeDemoSavedModel(scene, obstacles) {
  const savedModels = listModels();
  if (savedModels.length === 0) return;

  try {
    const demoModel = savedModels[savedModels.length - 1];
    const { group, box } = buildModelGroup(demoModel, savedModels, {
      position: new THREE.Vector3(24, 0, 6),
    });
    scene.add(group);
    obstacles.push({ mesh: group, box });
  } catch (err) {
    console.error("Failed to place saved model in the world:", err);
  }
}

/**
 * Builds the ground and the town layout, adds them to the scene, and
 * returns references (plus precomputed collision boxes) for game logic.
 */
export function createWorld(scene) {
  const ground = createGround();
  scene.add(ground);

  const { obstacles, garyHouseController, oakLabController } = createTownLayout(scene);

  return { ground, obstacles, size: GROUND_SIZE, garyHouseController, oakLabController };
}
