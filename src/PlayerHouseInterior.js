import * as THREE from "three";
import { COLLISION_RADIUS, COLLISION_HEIGHT } from "./Player.js";

/**
 * Player's house interior — a close recreation of the Pokémon FireRed/LeafGreen
 * protagonist house in Pallet Town: one room per floor, TV in the top-left
 * corner, stairs in the top-right corner, dining table + 4 chairs in the
 * ground-floor living area, and a top-left bed / bottom-right PC desk
 * upstairs. Built as low-poly blockout geometry (colored boxes) on purpose —
 * layout and proportions are the point, not asset fidelity.
 *
 * Sized up from a literal GBA room (per user feedback: the first pass felt
 * cramped and let the camera see past the walls) and built as a real stacked
 * two-story building — both floors share the same x/z footprint, one above
 * the other, connected by a walkable ramp rather than a teleport. Only the
 * outdoor<->ground-floor door is still a teleport (a separate physical
 * location, same as any "enter building" transition); everything inside the
 * house, including the stairs, is walked on foot.
 */

// --- Building footprint ----------------------------------------------------
// Roomy enough to move around furniture comfortably (GTA-interior scale)
// while keeping the FireRed corner-anchored furniture layout recognizable.
const FLOOR_WIDTH = 12;
const FLOOR_DEPTH = 10;
const WALL_HEIGHT = 3.6; // per-floor wall height
const FLOOR_SLAB_THICK = 0.3;
const FLOOR2_HEIGHT = WALL_HEIGHT + FLOOR_SLAB_THICK; // walking height of the 2nd floor
const BUILDING_TOTAL_HEIGHT = FLOOR2_HEIGHT + WALL_HEIGHT;
const WALL_THICK = 0.2;
const DOOR_HALF_WIDTH = 1.1;
const DOOR_HEIGHT = 2.4;
const HALF_W = FLOOR_WIDTH / 2;
const HALF_D = FLOOR_DEPTH / 2;

// --- L-shaped staircase, dimensioned from the player's own capsule --------
// (see Player.js: COLLISION_RADIUS 0.45m, COLLISION_HEIGHT 1.8m) rather than
// picked arbitrarily. NE corner of the room, matching the FireRed reference:
// flight 1 climbs north along the east wall, a square landing turns the
// player 90°, flight 2 climbs west along the north wall into the upstairs
// bedroom. Real individual stepped treads (getGroundHeight below returns a
// quantized, per-step height — not a smooth ramp), a flat landing at exactly
// the corner height, and parapet walls guarding both exposed open sides.
const MARGIN = 0.1; // clearance from the perimeter walls
const STAIR_WIDTH = COLLISION_RADIUS * 2 + 0.7; // capsule diameter (0.9m) + comfortable clearance
const STEP_HEIGHT = COLLISION_HEIGHT / 6; // 0.3m — a rise the per-frame ground-snap absorbs smoothly, far under the ~1.6m jump apex
const LANDING_SIZE = STAIR_WIDTH; // square corner platform, big enough to turn 90° without hugging a wall
const FLIGHT_A_STEPS = 6;
const FLIGHT_A_RISE = FLIGHT_A_STEPS * STEP_HEIGHT; // 1.8m
const FLIGHT_B_STEPS = 7;
const FLIGHT_B_RISE = FLIGHT_B_STEPS * STEP_HEIGHT; // 2.1m (1.8 + 2.1 = 3.9 = FLOOR2_HEIGHT)

// Flight A: runs north (-z) along the east wall, from the ground-floor room
// (z=0, open) up to the landing.
const FLIGHT_A_X1 = HALF_W - MARGIN;
const FLIGHT_A_X0 = FLIGHT_A_X1 - STAIR_WIDTH;
const FLIGHT_A_Z1 = 0; // bottom, open to the ground-floor room
const FLIGHT_A_Z0 = -(HALF_D - MARGIN - LANDING_SIZE); // top, meets the landing
const STEP_DEPTH_A = (FLIGHT_A_Z1 - FLIGHT_A_Z0) / FLIGHT_A_STEPS;

// Landing: square corner platform at the top of flight A / start of flight B.
const LANDING_X0 = FLIGHT_A_X0;
const LANDING_X1 = FLIGHT_A_X1;
const LANDING_Z1 = FLIGHT_A_Z0;
const LANDING_Z0 = LANDING_Z1 - LANDING_SIZE;

// Flight B: runs west (-x) along the north wall, from the landing up into
// the open floor-2 room.
const FLIGHT_B_Z0 = LANDING_Z0;
const FLIGHT_B_Z1 = LANDING_Z1;
const FLIGHT_B_X1 = LANDING_X0; // east end, meets the landing
const STEP_DEPTH_B = STEP_DEPTH_A; // consistent tread depth across both flights
const FLIGHT_B_X0 = FLIGHT_B_X1 - FLIGHT_B_STEPS * STEP_DEPTH_B; // west end, open to the floor-2 room

// Parapets: the two exposed long edges where a flight stands elevated over
// the floor-1 room below. The bottom of flight A (z>0) and the west end of
// flight B (x<FLIGHT_B_X0) are intentionally left open — those are the real
// entrance/exit points. The corner's other two sides sit within 0.1m of the
// real east/north exterior walls, which already block the player (capsule
// radius 0.45m can't fit through a 0.1m gap), so no extra parapet is needed
// there.
// Built per-step (see buildShell) rather than as one flat wall spanning the
// whole flight's height — any positive vertical overlap already blocks the
// player in resolveCollisions, so the parapet only needs to clear each
// tread by this much, not the full remaining rise to the ceiling.
const PARAPET_HEIGHT = 0.9;

// Remote, out-of-the-way world-space slot for the interior so it never
// overlaps the outdoor town and doesn't need a separate THREE.Scene/level
// system.
export const HOUSE_ORIGIN = new THREE.Vector3(300, 0, 300);

// FireRed-inspired palette, reusing hex values already established elsewhere
// in this project (Buildings.js/PartKit.js) where they overlap.
const COLORS = {
  floor: 0xe8d3a0,
  wall: 0xf5ecd7,
  ceiling: 0xd8c9a3,
  wood: 0x8a5a34,
  darkWood: 0x6b4423,
  stairWood: 0x9c8b6e,
  tvBody: 0x2b2b2b,
  tvScreen: 0x1a3d5c,
  sinkBody: 0xe6e6e6,
  sinkBasin: 0xbfc4c7,
  leafGreen: 0x3f7d43,
  potBrown: 0x8a5a34,
  bedFrame: 0x6b4423,
  blanket: 0xd62828,
  pillow: 0xffffff,
  pcBody: 0xe4ddc9,
  pcScreen: 0xd62828,
  doorFrame: 0x3d2b1f,
};

function addShadow(mesh) {
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  return mesh;
}

/** Box helper. `collide: true` tags it to become a collision obstacle once added to the scene. */
function makeBox(w, h, d, color, { collide = false, roughness = 0.85 } = {}) {
  const material = new THREE.MeshStandardMaterial({ color, roughness });
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), material);
  mesh.userData.collide = collide;
  return addShadow(mesh);
}

function at(mesh, x, y, z) {
  mesh.position.set(x, y, z);
  return mesh;
}

// --- Shell: perimeter walls (continuous, full building height), the door
// opening, the mid-level floor/ceiling slab, and the stairwell guard wall. --

function buildShell(group) {
  const groundFloor = new THREE.Mesh(
    new THREE.PlaneGeometry(FLOOR_WIDTH, FLOOR_DEPTH),
    new THREE.MeshStandardMaterial({ color: COLORS.floor, roughness: 1 })
  );
  groundFloor.rotation.x = -Math.PI / 2;
  groundFloor.receiveShadow = true;
  group.add(groundFloor);

  const roofCeiling = new THREE.Mesh(
    new THREE.PlaneGeometry(FLOOR_WIDTH, FLOOR_DEPTH),
    new THREE.MeshStandardMaterial({ color: COLORS.ceiling, roughness: 1, side: THREE.DoubleSide })
  );
  roofCeiling.rotation.x = Math.PI / 2;
  roofCeiling.position.y = BUILDING_TOTAL_HEIGHT;
  // Not a real physics obstacle (a flat plane never overlaps the player's
  // AABB in Y), but tagged collide so the camera raycast treats it as an
  // occluder and can't see/clip through the roof from upstairs.
  roofCeiling.userData.collide = true;
  group.add(roofCeiling);

  // Perimeter walls span the FULL building height (both floors at once) —
  // there is no seam at the floor-2 boundary, so the staircase never has to
  // duck under/through a wall edge partway up.
  const northWall = makeBox(FLOOR_WIDTH + WALL_THICK, BUILDING_TOTAL_HEIGHT, WALL_THICK, COLORS.wall, { collide: true });
  group.add(at(northWall, 0, BUILDING_TOTAL_HEIGHT / 2, -HALF_D));

  const westWall = makeBox(WALL_THICK, BUILDING_TOTAL_HEIGHT, FLOOR_DEPTH, COLORS.wall, { collide: true });
  group.add(at(westWall, -HALF_W, BUILDING_TOTAL_HEIGHT / 2, 0));

  const eastWall = makeBox(WALL_THICK, BUILDING_TOTAL_HEIGHT, FLOOR_DEPTH, COLORS.wall, { collide: true });
  group.add(at(eastWall, HALF_W, BUILDING_TOTAL_HEIGHT / 2, 0));

  // South wall: two solid side segments flanking the door, plus a lintel
  // above the door opening so the wall stays solid above door height.
  const southSegWidth = HALF_W - DOOR_HALF_WIDTH;
  const southLeft = makeBox(southSegWidth, BUILDING_TOTAL_HEIGHT, WALL_THICK, COLORS.wall, { collide: true });
  at(southLeft, -(DOOR_HALF_WIDTH + southSegWidth / 2), BUILDING_TOTAL_HEIGHT / 2, HALF_D);
  group.add(southLeft);

  const southRight = makeBox(southSegWidth, BUILDING_TOTAL_HEIGHT, WALL_THICK, COLORS.wall, { collide: true });
  at(southRight, DOOR_HALF_WIDTH + southSegWidth / 2, BUILDING_TOTAL_HEIGHT / 2, HALF_D);
  group.add(southRight);

  const lintelHeight = BUILDING_TOTAL_HEIGHT - DOOR_HEIGHT;
  const southLintel = makeBox(DOOR_HALF_WIDTH * 2, lintelHeight, WALL_THICK, COLORS.wall, { collide: true });
  at(southLintel, 0, DOOR_HEIGHT + lintelHeight / 2, HALF_D);
  group.add(southLintel);

  const doorFrame = makeBox(DOOR_HALF_WIDTH * 2, 0.15, WALL_THICK * 1.5, COLORS.doorFrame);
  at(doorFrame, 0, DOOR_HEIGHT - 0.1, HALF_D);
  group.add(doorFrame);

  // Mid-level slab: floor 2's floor / floor 1's ceiling. Tiled as 5
  // rectangles around the L-shaped stairwell hole (flight A + landing +
  // flight B) so the stairs have full headroom and a sightline between
  // floors. Tagged collide for camera occlusion only — its Y-range sits
  // exactly flush with the floor-2 walking height computed by
  // getGroundHeight() below, so it never overlaps the player's AABB and
  // can't trap them (see resolveCollisions' overlapY<=0 skip).
  const slabMaterial = new THREE.MeshStandardMaterial({ color: COLORS.ceiling, roughness: 1 });
  const slabY = WALL_HEIGHT + FLOOR_SLAB_THICK / 2;
  function addSlab(x0, x1, z0, z1) {
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(x1 - x0, FLOOR_SLAB_THICK, z1 - z0), slabMaterial);
    at(mesh, (x0 + x1) / 2, slabY, (z0 + z1) / 2);
    mesh.userData.collide = true;
    group.add(addShadow(mesh));
  }
  addSlab(-HALF_W, FLIGHT_B_X0, -HALF_D, HALF_D); // west of the whole stairwell
  addSlab(FLIGHT_B_X0, HALF_W, 0, HALF_D); // south of the stairwell, east portion
  addSlab(FLIGHT_B_X0, FLIGHT_A_X1, -HALF_D, LANDING_Z0); // north sliver, above flight B
  addSlab(FLIGHT_A_X1, HALF_W, -HALF_D, 0); // east sliver, beside flight A/landing
  addSlab(FLIGHT_B_X0, FLIGHT_A_X0, LANDING_Z1, 0); // infill: west of flight A, south of flight B

  // Parapets: solid walls guarding the two long edges where a flight stands
  // elevated over the floor-1 room below it. Built as one segment PER STEP,
  // following the stair profile (per the brief: "the side protection should
  // follow the staircase geometry") rather than one flat wall running the
  // full height of the whole flight — a single flat wall would tower ~3m
  // over the lowest tread it guards, which is both unnecessary and (since
  // the corridor is only ~1.6m wide) puts a tall surface close enough to the
  // camera's collision raycast to jam it right up against the player while
  // climbing. Each segment only needs to clear its own tread by
  // PARAPET_HEIGHT to block the player (any positive vertical overlap in
  // resolveCollisions blocks equally well, however tall the wall is above
  // that).
  for (let i = 0; i < FLIGHT_A_STEPS; i++) {
    const treadTop = (i + 1) * STEP_HEIGHT;
    const segZ1 = FLIGHT_A_Z1 - STEP_DEPTH_A * i;
    const segZ0 = segZ1 - STEP_DEPTH_A;
    const segHeight = treadTop + PARAPET_HEIGHT;
    const seg = makeBox(WALL_THICK, segHeight, STEP_DEPTH_A, COLORS.wall, { collide: true });
    at(seg, FLIGHT_A_X0, segHeight / 2, (segZ0 + segZ1) / 2);
    group.add(seg);
  }

  for (let i = 0; i < FLIGHT_B_STEPS; i++) {
    const treadTop = FLIGHT_A_RISE + (i + 1) * STEP_HEIGHT;
    const segX1 = FLIGHT_B_X1 - STEP_DEPTH_B * i;
    const segX0 = segX1 - STEP_DEPTH_B;
    const segHeight = treadTop + PARAPET_HEIGHT;
    const seg = makeBox(STEP_DEPTH_B, segHeight, WALL_THICK, COLORS.wall, { collide: true });
    at(seg, (segX0 + segX1) / 2, segHeight / 2, FLIGHT_B_Z1);
    group.add(seg);
  }
}

// --- Furniture builders -----------------------------------------------------

/** `facing` is the compass direction the screen points into the room ("south" | "east"). */
function buildTV(group, x, z, y = 0, facing = "south") {
  const rotationY = facing === "east" ? -Math.PI / 2 : 0;
  const screenOffset = 0.18;
  const offsetX = facing === "east" ? screenOffset : 0;
  const offsetZ = facing === "south" ? screenOffset : 0;

  const stand = makeBox(0.9, 0.55, 0.5, COLORS.darkWood, { collide: true });
  stand.rotation.y = rotationY;
  at(stand, x, y + 0.275, z);
  group.add(stand);

  const body = makeBox(0.8, 0.55, 0.35, COLORS.tvBody, { collide: true });
  body.rotation.y = rotationY;
  at(body, x, y + 0.55 + 0.275, z);
  group.add(body);

  const screen = makeBox(0.6, 0.4, 0.05, COLORS.tvScreen);
  screen.rotation.y = rotationY;
  at(screen, x + offsetX, y + 0.55 + 0.275, z + offsetZ);
  group.add(screen);
}

function buildCupboard(group, x, z, y = 0) {
  const cupboard = makeBox(1.0, 2.1, 0.5, COLORS.darkWood, { collide: true });
  at(cupboard, x, y + 1.05, z);
  group.add(cupboard);

  const seam = makeBox(0.04, 2.0, 0.52, 0x4a2f1c);
  at(seam, x, y + 1.05, z);
  group.add(seam);
}

function buildDiningSet(group, centerX, centerZ, y = 0) {
  const table = makeBox(1.4, 0.72, 1.0, COLORS.wood, { collide: true });
  at(table, centerX, y + 0.36, centerZ);
  group.add(table);

  const chairPositions = [
    { x: centerX, z: centerZ - 0.85, rot: 0 },
    { x: centerX, z: centerZ + 0.85, rot: Math.PI },
    { x: centerX - 0.95, z: centerZ, rot: Math.PI / 2 },
    { x: centerX + 0.95, z: centerZ, rot: -Math.PI / 2 },
  ];
  for (const c of chairPositions) {
    const chair = makeBox(0.45, 0.45, 0.45, COLORS.wood, { collide: true });
    chair.rotation.y = c.rot;
    at(chair, c.x, y + 0.225, c.z);
    group.add(chair);
  }
}

function buildSink(group, x, z, y = 0) {
  const counter = makeBox(0.8, 0.85, 0.55, COLORS.sinkBody, { collide: true });
  at(counter, x, y + 0.425, z);
  group.add(counter);

  const basin = makeBox(0.55, 0.08, 0.35, COLORS.sinkBasin);
  at(basin, x, y + 0.85, z);
  group.add(basin);
}

function buildPlant(group, x, z, y = 0) {
  const pot = new THREE.Mesh(
    new THREE.CylinderGeometry(0.22, 0.18, 0.3, 8),
    new THREE.MeshStandardMaterial({ color: COLORS.potBrown, roughness: 0.9 })
  );
  pot.position.set(x, y + 0.15, z);
  pot.userData.collide = true;
  group.add(addShadow(pot));

  const leaves = new THREE.Mesh(
    new THREE.SphereGeometry(0.32, 8, 6),
    new THREE.MeshStandardMaterial({ color: COLORS.leafGreen, roughness: 0.8 })
  );
  leaves.position.set(x, y + 0.55, z);
  group.add(addShadow(leaves));
}

function buildBed(group, x, z, y = 0) {
  const frame = makeBox(1.5, 0.35, 2.1, COLORS.bedFrame, { collide: true });
  at(frame, x, y + 0.175, z);
  group.add(frame);

  const mattress = makeBox(1.4, 0.25, 2.0, COLORS.blanket, { collide: true });
  at(mattress, x, y + 0.35 + 0.125, z);
  group.add(mattress);

  const pillow = makeBox(0.55, 0.15, 0.4, COLORS.pillow);
  at(pillow, x, y + 0.35 + 0.25 + 0.075, z - 0.75);
  group.add(pillow);
}

/** Assumes the desk sits flush against the east wall, screen facing west into the room. */
function buildComputerDesk(group, x, z, y = 0) {
  const desk = makeBox(0.55, 0.7, 0.9, COLORS.wood, { collide: true });
  at(desk, x, y + 0.35, z);
  group.add(desk);

  const pcBody = makeBox(0.35, 0.35, 0.4, COLORS.pcBody, { collide: true });
  at(pcBody, x, y + 0.7 + 0.175, z - 0.1);
  group.add(pcBody);

  const pcScreen = makeBox(0.05, 0.24, 0.32, COLORS.pcScreen);
  at(pcScreen, x - 0.16, y + 0.7 + 0.3, z - 0.1);
  group.add(pcScreen);
}

/**
 * Visual L-shaped staircase: flight A (individual treads climbing north
 * along the east wall) -> square corner landing (flush with flight A's top
 * step and flight B's first step) -> flight B (individual treads climbing
 * west along the north wall, ending flush with the floor-2 slab). Each tread
 * is its own solid block from the floor up to that step's height, so
 * consecutive steps show a real riser face — not a single inclined ramp.
 * Purely visual/non-collidable: the actual walkable height (including the
 * landing) is computed by getGroundHeight() below, and the two parapet
 * walls (built in buildShell) provide the real collision on the exposed
 * sides.
 */
function buildStairsVisual(group) {
  const material = new THREE.MeshStandardMaterial({ color: COLORS.stairWood, roughness: 0.9 });
  const centerXA = (FLIGHT_A_X0 + FLIGHT_A_X1) / 2;
  const centerZB = (FLIGHT_B_Z0 + FLIGHT_B_Z1) / 2;

  for (let i = 0; i < FLIGHT_A_STEPS; i++) {
    const stepTopY = (i + 1) * STEP_HEIGHT;
    const stepZ = FLIGHT_A_Z1 - STEP_DEPTH_A * (i + 0.5);
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(STAIR_WIDTH, stepTopY, STEP_DEPTH_A), material);
    mesh.position.set(centerXA, stepTopY / 2, stepZ);
    group.add(addShadow(mesh));
  }

  // Landing: a flat platform exactly at flight A's top height, bridging into flight B.
  const landing = new THREE.Mesh(
    new THREE.BoxGeometry(LANDING_X1 - LANDING_X0, FLIGHT_A_RISE, LANDING_Z1 - LANDING_Z0),
    material
  );
  landing.position.set((LANDING_X0 + LANDING_X1) / 2, FLIGHT_A_RISE / 2, (LANDING_Z0 + LANDING_Z1) / 2);
  group.add(addShadow(landing));

  for (let i = 0; i < FLIGHT_B_STEPS; i++) {
    const stepTopY = FLIGHT_A_RISE + (i + 1) * STEP_HEIGHT;
    const stepX = FLIGHT_B_X1 - STEP_DEPTH_B * (i + 0.5);
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(STEP_DEPTH_B, stepTopY, STAIR_WIDTH), material);
    mesh.position.set(stepX, stepTopY / 2, centerZB);
    group.add(addShadow(mesh));
  }
}

// --- Floor assemblers --------------------------------------------------------

/**
 * Ground floor: TV (NW corner), cupboard (west wall), dining table + 4 chairs
 * (center-west living area), sink (south wall, clear of the door and stairs),
 * 2 plants flanking the door, staircase (NE corner), door on the south wall.
 */
function furnishGroundFloor(group) {
  buildTV(group, -HALF_W + 1.05, -HALF_D + 0.75);
  buildCupboard(group, -HALF_W + 0.6, -2.2);
  buildDiningSet(group, -2.0, 1.0);
  buildSink(group, 2.4, HALF_D - 0.7);
  buildPlant(group, -1.2, HALF_D - 0.6);
  buildPlant(group, 1.2, HALF_D - 0.6);
}

/**
 * Second floor (bedroom): bed (NW corner, headboard to north wall), cupboard
 * (south wall), TV (west wall, south portion), computer desk + PC (east
 * wall, south of the stairwell landing).
 */
function furnishSecondFloor(group) {
  const y = FLOOR2_HEIGHT;
  buildBed(group, -HALF_W + 1.85, -HALF_D + 1.15, y);
  buildCupboard(group, -0.7, HALF_D - 0.6, y);
  buildTV(group, -HALF_W + 0.85, 1.5, y, "east");
  buildComputerDesk(group, HALF_W - 0.55, HALF_D - 2.3, y);
}

function collectObstacles(group) {
  const obstacles = [];
  group.traverse((child) => {
    if (child.userData.collide) {
      obstacles.push({ mesh: child, box: new THREE.Box3().setFromObject(child) });
    }
  });
  return obstacles;
}

/** Axis-aligned trigger volume in world space. */
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

/**
 * Builds the two-story house, wires up the door trigger, and exposes:
 *  - update(delta, player): teleports the player in/out at the door.
 *  - getObstacles(outdoorObstacles): the active collision list.
 *  - getGroundHeight(x, z): the walkable surface height at that (x, z) —
 *    flat 0 outdoors, and (indoors) either flat floor-1, flat floor-2, or the
 *    interpolated stair ramp, depending on where the player is standing.
 *  - interactables: TV/sink/bed/PC proximity-interaction points.
 *
 * @param {THREE.Scene} scene
 * @param {THREE.Vector3} exteriorDoorWorldPos - world position of the house's
 *   exterior door (from World.js), used to place the outside-facing trigger
 *   and the spot the player returns to on exit.
 */
export function setupPlayerHouse(scene, exteriorDoorWorldPos) {
  const houseGroup = new THREE.Group();
  houseGroup.position.copy(HOUSE_ORIGIN);
  buildShell(houseGroup);
  furnishGroundFloor(houseGroup);
  furnishSecondFloor(houseGroup);
  buildStairsVisual(houseGroup);
  scene.add(houseGroup);

  // Box3.setFromObject() only calls updateWorldMatrix(false, false) on the
  // target — it does NOT recompute a stale parent's matrixWorld first. Since
  // this runs before the first render (nothing has updated houseGroup's
  // world matrix yet), every child's matrixWorld would still be identity
  // and every collision box would be computed near local (0,0,0) instead of
  // out at HOUSE_ORIGIN — i.e. completely unblocking the actual walls. Force
  // the whole subtree's world matrices up to date first so the boxes below
  // land where the house actually is.
  houseGroup.updateMatrixWorld(true);

  const interiorObstacles = collectObstacles(houseGroup);
  const interiorCollisionMeshes = interiorObstacles.map((o) => o.mesh);

  const interactables = [
    { name: "TV", prompt: "Press E to watch TV", position: new THREE.Vector3(HOUSE_ORIGIN.x - HALF_W + 1.05, 0.4, HOUSE_ORIGIN.z - HALF_D + 1.1), message: "It's a TV. Nothing interesting is on." },
    { name: "Sink", prompt: "Press E to use the sink", position: new THREE.Vector3(HOUSE_ORIGIN.x + 2.4, 0.4, HOUSE_ORIGIN.z + HALF_D - 1.0), message: "The sink is clean." },
    { name: "Bed", prompt: "Press E to sleep", position: new THREE.Vector3(HOUSE_ORIGIN.x - HALF_W + 1.85, FLOOR2_HEIGHT + 0.4, HOUSE_ORIGIN.z - HALF_D + 1.15), message: "It's your bed. You feel refreshed just looking at it." },
    { name: "PC", prompt: "Press E to use the PC", position: new THREE.Vector3(HOUSE_ORIGIN.x + HALF_W - 0.55, FLOOR2_HEIGHT + 0.4, HOUSE_ORIGIN.z + HALF_D - 2.3), message: "The PC hums quietly. No new mail." },
  ];

  // --- Door trigger zones (world space) ---
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
  // +1.2 (not -1.2): the door's +z side is *outside* the house (the yard/path
  // side), while -z is further into the building's footprint.
  const outsideSpawn = new THREE.Vector3(exteriorDoorWorldPos.x, 0, exteriorDoorWorldPos.z + 1.2);

  const TELEPORT_COOLDOWN = 0.6;

  const controller = {
    inside: false,
    cooldown: 0,
    currentFloor: 0, // 0 = ground, 1 = upstairs; only meaningful while inside
    interactables,

    getObstacles(outdoorObstacles) {
      return this.inside ? interiorObstacles : outdoorObstacles;
    },

    getCollisionMeshes(outdoorMeshes) {
      return this.inside ? interiorCollisionMeshes : outdoorMeshes;
    },

    /**
     * Walkable surface height at (worldX, worldZ) — flat 0 outdoors;
     * indoors, a genuine per-step quantized height across the L-shaped
     * staircase (flight A -> landing -> flight B), or flat floor-1/floor-2
     * height everywhere else in the house. Individual steps (not a smooth
     * ramp) so each tread is a real, distinct rise the walk-forward motion
     * climbs one at a time.
     */
    getGroundHeight: (worldX, worldZ) => {
      if (!controller.inside) return 0;
      const x = worldX - HOUSE_ORIGIN.x;
      const z = worldZ - HOUSE_ORIGIN.z;

      if (x >= FLIGHT_A_X0 && x <= FLIGHT_A_X1 && z >= FLIGHT_A_Z0 && z <= FLIGHT_A_Z1) {
        const run = FLIGHT_A_Z1 - z; // 0 at the bottom, growing toward the landing
        // +1: tread i (0-indexed, built in buildStairsVisual) spans run in
        // [i*depth, (i+1)*depth) at height (i+1)*STEP_HEIGHT — the first
        // tread is already one riser up. Using floor() without +1 here
        // previously returned tread i's height as i*STEP_HEIGHT (one step
        // short of the visual mesh), which both let the model's legs sink
        // into the tread ahead of it and, at the very last tread, meant the
        // walkable height topped out 0.3m short of the floor-2 slab's top —
        // putting the player's body inside the slab's thickness instead of
        // on top of it, which permanently blocked forward movement there.
        const stepIndex = Math.min(FLIGHT_A_STEPS, Math.floor(run / STEP_DEPTH_A) + 1);
        const height = stepIndex * STEP_HEIGHT;
        controller.currentFloor = height > FLOOR2_HEIGHT / 2 ? 1 : 0;
        return height;
      }
      if (x >= LANDING_X0 && x <= LANDING_X1 && z >= LANDING_Z0 && z <= LANDING_Z1) {
        controller.currentFloor = FLIGHT_A_RISE > FLOOR2_HEIGHT / 2 ? 1 : 0;
        return FLIGHT_A_RISE;
      }
      if (x >= FLIGHT_B_X0 && x <= FLIGHT_B_X1 && z >= FLIGHT_B_Z0 && z <= FLIGHT_B_Z1) {
        const run = FLIGHT_B_X1 - x; // 0 at the landing end, growing toward floor 2
        const stepIndex = Math.min(FLIGHT_B_STEPS, Math.floor(run / STEP_DEPTH_B) + 1); // see flight A's comment above
        const height = FLIGHT_A_RISE + stepIndex * STEP_HEIGHT;
        controller.currentFloor = height > FLOOR2_HEIGHT / 2 ? 1 : 0;
        return height;
      }

      return controller.currentFloor === 1 ? FLOOR2_HEIGHT : 0;
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

    /** Temporary diagnostic readout for the staircase bug report — see main.js's #debug-stair HUD. */
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
