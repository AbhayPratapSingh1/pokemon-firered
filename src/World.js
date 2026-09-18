import * as THREE from "three";
import { createHouse, createLab, createTree, createFenceSegment, createSignpost } from "./Buildings.js";
import { listModels } from "./ModelStore.js";
import { buildModelGroup } from "./ModelLoader.js";

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

    const tree = createTree({ position: new THREE.Vector3(x, 0, z) });
    scene.add(tree);

    // Collide with the trunk only, not the canopy, so players can walk under trees.
    const trunkRadius = 0.25;
    const box = new THREE.Box3(
      new THREE.Vector3(x - trunkRadius, 0, z - trunkRadius),
      new THREE.Vector3(x + trunkRadius, 1.2, z + trunkRadius)
    );
    obstacles.push({ mesh: tree, box });
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

function createTownLayout(scene) {
  const obstacles = [];

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

  const neighborsHouse = createHouse({
    position: new THREE.Vector3(14, 0, -14),
    rotationY: 0,
    wallColor: 0xe8e2d6,
    roofColor: 0x2a9d8f,
  });
  scene.add(neighborsHouse);
  obstacles.push({ mesh: neighborsHouse, box: new THREE.Box3().setFromObject(neighborsHouse) });

  const lab = createLab({
    position: new THREE.Vector3(0, 0, 16),
    rotationY: Math.PI,
  });
  scene.add(lab);
  obstacles.push({ mesh: lab, box: new THREE.Box3().setFromObject(lab) });

  // Paths connecting the spawn clearing to each building's door.
  const spawn = new THREE.Vector3(0, 0, 0);
  addPathSegment(scene, spawn, new THREE.Vector3(-14, 0, -10));
  addPathSegment(scene, spawn, new THREE.Vector3(14, 0, -10));
  addPathSegment(scene, spawn, new THREE.Vector3(0, 0, 11));

  // Short fence runs flanking each house yard (path-facing side left open).
  scene.add(createFenceSegment({ position: new THREE.Vector3(-17.5, 0, -10.5), length: 3, rotationY: Math.PI / 2 }));
  scene.add(createFenceSegment({ position: new THREE.Vector3(-10.5, 0, -10.5), length: 3, rotationY: Math.PI / 2 }));
  scene.add(createFenceSegment({ position: new THREE.Vector3(10.5, 0, -10.5), length: 3, rotationY: Math.PI / 2 }));
  scene.add(createFenceSegment({ position: new THREE.Vector3(17.5, 0, -10.5), length: 3, rotationY: Math.PI / 2 }));

  scene.add(createSignpost({ position: new THREE.Vector3(3, 0, 10.5), rotationY: Math.PI / 6 }));

  addPond(scene, new THREE.Vector3(32, 0, -30), 5);

  // Keep spawn, buildings, and paths clear of randomly-scattered trees.
  const exclusionZones = [
    { x: 0, z: 0, halfW: 8, halfD: 8 },
    { x: -14, z: -14, halfW: 7, halfD: 7 },
    { x: 14, z: -14, halfW: 7, halfD: 7 },
    { x: 0, z: 16, halfW: 9, halfD: 7 },
    { x: 24, z: 6, halfW: 6, halfD: 6 },
  ];
  scatterTrees(scene, obstacles, exclusionZones);

  placeDemoSavedModel(scene, obstacles);

  return obstacles;
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

  const obstacles = createTownLayout(scene);

  return { ground, obstacles, size: GROUND_SIZE };
}
