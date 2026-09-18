import * as THREE from "three";
import { createHouse } from "./Buildings.js";
import { createOakLab } from "./buildings/OakLab/OakLab.js";
import { createGaryExterior } from "./buildings/GaryHouse/GaryHouse.js";
import { buildTree } from "./components/Tree/Tree.js";
import { listModels } from "./ModelStore.js";
import { buildModelGroup } from "./ModelLoader.js";
import { setupPlayerHouse } from "./PlayerHouseInterior.js";

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

// --- Building positions ----------------------------------------------------

const PLAYERS_HOUSE_POSITION = new THREE.Vector3(-14, 0, -14);
const PLAYERS_HOUSE_DEPTH = 6;
const PLAYERS_HOUSE_WIDTH = 6;
const PLAYERS_HOUSE_WALL_HEIGHT = 3;
const PLAYERS_HOUSE_ROOF_HEIGHT = 2.2;
const PLAYERS_HOUSE_DOOR_HALF_WIDTH = 1.0;
const PLAYERS_HOUSE_DOOR_NOTCH_DEPTH = 0.8;

const GARY_HOUSE_POSITION = new THREE.Vector3(14, 0, -14);
const OAK_LAB_POSITION = new THREE.Vector3(0, 0, 16);

// Door positions for each building
export const PLAYERS_HOUSE_DOOR_POSITION = new THREE.Vector3(
  PLAYERS_HOUSE_POSITION.x,
  0,
  PLAYERS_HOUSE_POSITION.z + PLAYERS_HOUSE_DEPTH / 2
);

const GARY_HOUSE_DOOR_POSITION = new THREE.Vector3(
  GARY_HOUSE_POSITION.x,
  0,
  GARY_HOUSE_POSITION.z + PLAYERS_HOUSE_DEPTH / 2
);

const OAK_LAB_DOOR_POSITION = new THREE.Vector3(
  OAK_LAB_POSITION.x,
  0,
  OAK_LAB_POSITION.z - 4  // North face (rotated PI)
);

// --- Collision helpers -----------------------------------------------------

function buildPlayersHouseObstacles(house, position, width, depth, wallHeight, roofHeight) {
  const { x: px, z: pz } = position;
  const halfW = width / 2;
  const halfD = depth / 2;
  const totalHeight = wallHeight + roofHeight;
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

function createTownLayout(scene) {
  const obstacles = [];

  // --- Player's House ---
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
  obstacles.push(...buildPlayersHouseObstacles(
    playersHouse, PLAYERS_HOUSE_POSITION,
    PLAYERS_HOUSE_WIDTH, PLAYERS_HOUSE_DEPTH,
    PLAYERS_HOUSE_WALL_HEIGHT, PLAYERS_HOUSE_ROOF_HEIGHT
  ));

  // --- Gary's House (exterior only, same dimensions as player's) ---
  const garyHouse = createGaryExterior({
    position: GARY_HOUSE_POSITION,
    rotationY: 0,
  });
  scene.add(garyHouse);
  obstacles.push(...buildPlayersHouseObstacles(
    garyHouse, GARY_HOUSE_POSITION,
    PLAYERS_HOUSE_WIDTH, PLAYERS_HOUSE_DEPTH,
    PLAYERS_HOUSE_WALL_HEIGHT, PLAYERS_HOUSE_ROOF_HEIGHT
  ));

  // --- Oak's Lab (exterior only) ---
  const oakLab = createOakLab({
    position: OAK_LAB_POSITION,
    rotationY: Math.PI,
  });
  scene.add(oakLab);
  obstacles.push(...buildPlayersHouseObstacles(
    oakLab, OAK_LAB_POSITION,
    10, 8, 3.2, 0.35
  ));

  // --- Paths ---
  const spawn = new THREE.Vector3(0, 0, 0);
  addPathSegment(scene, spawn, new THREE.Vector3(-14, 0, -10));
  addPathSegment(scene, spawn, new THREE.Vector3(14, 0, -10));
  addPathSegment(scene, spawn, new THREE.Vector3(0, 0, 11));

  // --- Trees ---
  const exclusionZones = [
    { x: 0, z: 0, halfW: 8, halfD: 8 },
    { x: -14, z: -14, halfW: 7, halfD: 7 },
    { x: 14, z: -14, halfW: 8, halfD: 8 },
    { x: 0, z: 16, halfW: 10, halfD: 8 },
    { x: 24, z: 6, halfW: 6, halfD: 6 },
  ];
  scatterTrees(scene, obstacles, exclusionZones);

  placeDemoSavedModel(scene, obstacles);

  // --- Interior controllers (all use Ash's House layout) ---
  const playerHouse = setupPlayerHouse(scene, PLAYERS_HOUSE_DOOR_POSITION);
  const garyHouseInterior = setupPlayerHouse(scene, GARY_HOUSE_DOOR_POSITION);
  const oakLabInterior = setupPlayerHouse(scene, OAK_LAB_DOOR_POSITION);

  return {
    obstacles,
    playerHouse,
    garyHouseInterior,
    oakLabInterior,
  };
}

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

export function createWorld(scene) {
  const ground = createGround();
  scene.add(ground);

  const { obstacles, playerHouse, garyHouseInterior, oakLabInterior } = createTownLayout(scene);

  return {
    ground,
    obstacles,
    size: GROUND_SIZE,
    playerHouse,
    garyHouseInterior,
    oakLabInterior,
  };
}
