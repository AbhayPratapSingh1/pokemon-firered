import * as THREE from "three";

// ============================================================================
// ACTIONS
// ============================================================================

export const ACTIONS = {
  MESSAGE: "MESSAGE",
  TELEPORT: "TELEPORT",
  GIVE_ITEM: "GIVE_ITEM",
  DIALOGUE: "DIALOGUE",
  ANIMATION: "ANIMATION",
  CHANGE_SPACE: "CHANGE_SPACE",
};

// ============================================================================
// OBJECT TYPES
// ============================================================================

export const OBJ = {
  // Structure
  HOUSE: "house",
  GROUND_FLOOR: "groundFloor",
  FLOOR_SLAB: "floorSlab",
  FLOOR_WITH_HOLE: "floorWithHole",
  WALLS: "walls",
  ROOF: "roof",
  CEILING: "ceiling",
  DOOR_FRAME: "doorFrame",
  WINDOW: "window",
  STAIRS: "stairs",
  STAIR_STEP: "stairStep",

  // Furniture
  TV: "tv",
  BED: "bed",
  SINK: "sink",
  CUPBOARD: "cupboard",
  DINING_SET: "diningSet",
  PLANT: "plant",
  COMPUTER_DESK: "computerDesk",
  TABLE: "table",
  KITCHEN_COUNTER: "kitchenCounter",
  VISUAL_STAIRS: "visualStairs",
  CHAIR: "chair",

  // Nature
  TREE: "tree",
  GRASS: "grass",
  WATER: "water",

  // Structure (decorative)
  BANNER: "banner",
  SHELTER: "shelter",
  CHIMNEY: "chimney",
  MAILBOX: "mailbox",
  SIGN: "sign",
  WINDOW_BOX: "windowBox",
  FENCE: "fence",

  // Lab
  LAB_SHELF: "labShelf",
  LAB_MACHINE: "labMachine",
  LAB_DESK: "labDesk",
  LAB_PLANT: "labPlant",
  POKEBALL: "pokeball",
};

// ============================================================================
// SPACE NAMES
// ============================================================================

export const SPACES = {
  WORLD: "WORLD",
  ASH_HOUSE: "ASH_HOUSE",
  GARY_HOUSE: "GARY_HOUSE",
  OAK_LAB: "OAK_LAB",
};

// ============================================================================
// DIRECTIONS
// ============================================================================

export const DIRECTIONS = {
  NORTH: { name: "NORTH", doorSign: -1, rotation: Math.PI },
  SOUTH: { name: "SOUTH", doorSign: 1, rotation: 0 },
  EAST: { name: "EAST", doorSign: 0, rotation: -Math.PI / 2 },
  WEST: { name: "WEST", doorSign: 0, rotation: Math.PI / 2 },
};

// ============================================================================
// COLLISION
// ============================================================================

export const COLLISION = {
  RADIUS: 0.45,
  HEIGHT: 1.8,
  HEAD_HEIGHT: 1.55,
  CAMERA_MARGIN: 0.25,
  CAMERA_MIN_HEIGHT: 0.5,
  STEP_SNAP_SMOOTHING: 18,
  STEP_SNAP_MAX_GAP: 0.5,
  STEP_SNAP_EPSILON: 0.01,
};

// ============================================================================
// PHYSICS
// ============================================================================

export const PHYSICS = {
  WALK_SPEED: 3.2,
  SPRINT_MULTIPLIER: 1.8,
  ACCELERATION: 12,
  GRAVITY: -20,
  JUMP_SPEED: 8,
};

// ============================================================================
// WORLD
// ============================================================================

export const WORLD = {
  GROUND_SIZE: 200,
  TREE_COUNT: 0,
  TREE_RING_MIN: 30,
  TREE_RING_MAX: 70,
  SPAWN_POSITION: new THREE.Vector3(300, 0, 303),
  BACKGROUND_COLOR: 0x87ceeb,
  FOG_NEAR: 60,
  FOG_FAR: 160,

  // Spaces to include in the world — add new space names here
  objects: [
    SPACES.ASH_HOUSE,
  ],
};

// ============================================================================
// COLORS
// ============================================================================

export const COLORS = {
  WOOD_DARK: 0x8b4513,
  WOOD_LIGHT: 0xdeb887,
  WOOD_MEDIUM: 0xc2a267,
  FABRIC_WHITE: 0xffffff,
  FABRIC_BLUE: 0xadd8e6,
  FABRIC_RED: 0xff6b6b,
  METAL_GRAY: 0x888888,
  METAL_DARK: 0x444444,
  GRASS_GREEN: 0x3a7d44,
  TREE_GREEN: 0x3f7d43,
  TREE_TRUNK: 0x6b4423,
  WALL_DEFAULT: 0xead9b0,
  ROOF_DEFAULT: 0xb5432b,
  DOOR_DEFAULT: 0x3d2b1f,
  WINDOW_DEFAULT: 0xa9d6e5,
  TELEPORT_ENTRY: 0x00e5ff,
  TELEPORT_EXIT: 0xff9100,
};

// ============================================================================
// HOUSES — Complete Definitions
// ============================================================================

export const HOUSES = {
  ASH_HOUSE: {
    name: "Ash's House",
    exterior: {
      position: [-5, 0, -8],
      facing: DIRECTIONS.SOUTH,
      objects: [
        {
          type: OBJ.HOUSE,
          position: [0, 0, 0],
          config: {
            width: 6, depth: 6, wallHeight: 3, roofHeight: 2.2,
            wallColor: COLORS.WALL_DEFAULT, roofColor: COLORS.ROOF_DEFAULT,
            windows: [],
          },
        },
      ],
    },
    interior: {
      origin: [300, 0, 300],
      objects: [
        { type: OBJ.GROUND_FLOOR, position: [0, 0, 0], config: { width: 12, depth: 10 } },
        { type: OBJ.WALLS, position: [0, 0, 0], collide: true, config: { width: 12, depth: 10, height: 6.0 } },
        { type: OBJ.DOOR_FRAME, position: [0, 0, 5.0] },
        // Back wall (north): sink, almera, TV
        { type: OBJ.SINK, position: [-5, 0, -4.5], collide: true },
        { type: OBJ.CUPBOARD, position: [-3, 0, -4.5], collide: true },
        { type: OBJ.TV, position: [0, 0, -4.5], collide: true },
        // Center: table + 4 chairs
        { type: OBJ.TABLE, position: [0, 0, 0.5], collide: true }, 
        { type: OBJ.CHAIR, position: [0, 0, -0.5], rotation: 0, collide: true }, // top
        { type: OBJ.CHAIR, position: [0, 0, 1.5], rotation: Math.PI, collide: true }, // bottom
        { type: OBJ.CHAIR, position: [-1, 0, 0.5], rotation: Math.PI / 2, collide: true }, // left
        { type: OBJ.CHAIR, position: [1, 0, 0.5], rotation: -Math.PI / 2, collide: true }, // right
        // Front wall: plants flanking door
        { type: OBJ.PLANT, position: [-3, 0, 4], collide: true },
        { type: OBJ.PLANT, position: [3, 0, 4], collide: true },
        // Top right corner: straight stairs going up
        { type: OBJ.STAIRS, position: [5.1, 0, 0], collide: true, config: { stepsPerFlight: 12, stepWidth: 1.5, stepDepth: 0.3, stepHeight: 0.2, wallHeight: 1.0, sideWalls: false, direction: 1 } },
        // Landing platform at top of first stairs
        { type: OBJ.FLOOR_SLAB, position: [5.1, 2.325, -4.2], config: { width: 1.5, depth: 1.5, thickness: 0.15 } },
        // Second flight: west from landing (rotation π/2 makes direction:1 go west, 14 steps)
        { type: OBJ.STAIRS, position: [4.2, 2.2, -4.2], rotation: Math.PI / 2, collide: true, config: { stepsPerFlight: 14, stepWidth: 1.5, stepDepth: 0.3, stepHeight: 0.2, wallHeight: 1.0, sideWalls: false, direction: 1 } },
        // First floor ground with staircase cutout
        { type: OBJ.FLOOR_WITH_HOLE, position: [0,4.75, 0], config: { thickness: 0.15, outerX1: -6, outerX2: 6, outerZ1: -5, outerZ2: 5, holeX1:0.25, holeX2: 6, holeZ1: -5, holeZ2: -3.35 } },
        // Ceiling
        { type: OBJ.CEILING, position: [0, 6.0, 0] },
      ],
    },
    teleporters: [
      {
        triggerSpace: "WORLD",
        triggerPosition: [-5, 0, -5.0],
        triggerRadius: 0.3,
        targetSpace: "ASH_HOUSE",
        spawnPosition: [300, 0, 303.8],
        spawnOrientation: 0,
      },
      {
        triggerSpace: "ASH_HOUSE",
        triggerPosition: [300, 0, 304.95],
        triggerRadius: 0.3,
        targetSpace: "WORLD",
        spawnPosition: [-5, 0, -4.5],
        spawnOrientation: 0,
      },
    ],
  },
};
