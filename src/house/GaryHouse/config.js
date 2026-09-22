import { OBJ } from "../../config/objTypes.js";
import { COLORS } from "../../config/colors.js";
import { ACTIONS } from "../../config/actions.js";

const DIRECTIONS = {
  NORTH: { name: "NORTH", doorSign: -1, rotation: Math.PI },
  SOUTH: { name: "SOUTH", doorSign: 1, rotation: 0 },
  EAST: { name: "EAST", doorSign: 0, rotation: -Math.PI / 2 },
  WEST: { name: "WEST", doorSign: 0, rotation: Math.PI / 2 },
};

const ROOF_BLUE = 0x2b6bb5;

const msg = (prompt, message) => ({
  type: ACTIONS.MESSAGE,
  prompt,
  message,
});

export const GARY_HOUSE = {
  name: "Gary's House",
  exterior: {
    position: [5, 0, -8],
    facing: DIRECTIONS.SOUTH,
    objects: [
      {
        type: OBJ.HOUSE,
        position: [0, 0, 0],
        config: {
          width: 6, depth: 6, wallHeight: 3, roofHeight: 2.2,
          wallColor: COLORS.WALL_DEFAULT, roofColor: ROOF_BLUE,
          windows: [],
        },
      },
    ],
  },
  interior: {
    origin: [400, 0, 300],
    objects: [
      { type: OBJ.GROUND_FLOOR, position: [0, 0, 0], config: { width: 12, depth: 10 } },
      { type: OBJ.WALLS, position: [0, 0, 0], collide: true, config: { width: 12, depth: 10, height: 10.0 } },
      { type: OBJ.DOOR_FRAME, position: [0, 0, 5.0] },

      // --- Ground floor (south half) --- mirrored X ---

      // Sink (north wall, mirrored)
      {
        type: OBJ.SINK, position: [5, 0, -4.5], collide: true,
        action: msg("Examine sink", "A spotless sink. Gary's family is very particular about cleanliness."),
      },
      // Cupboard (north wall, mirrored)
      {
        type: OBJ.CUPBOARD, position: [3, 0, -4.5], collide: true,
        action: msg("Open cupboard", "Well-organized cupboard. Gary's mom labels everything."),
      },
      // TV (north wall)
      {
        type: OBJ.TV, position: [0, 0, -4.5], collide: true,
        action: msg("Watch TV", "A sports channel is showing the Pokémon League standings. Gary is ranked #1."),
      },
      // Table + 4 chairs (mirrored)
      {
        type: OBJ.TABLE, position: [0, 0, 0.5], collide: true,
        action: msg("Examine table", "An expensive mahogany dining table. The Oak family eats here."),
      },
      {
        type: OBJ.CHAIR, position: [0, 0, -0.5], rotation: 0, collide: true,
        action: msg("Examine chair", "A cushioned leather chair. Very comfortable."),
      },
      {
        type: OBJ.CHAIR, position: [0, 0, 1.5], rotation: Math.PI, collide: true,
        action: msg("Examine chair", "This chair has an embroidered 'O' on the back. Gary's seat."),
      },
      {
        type: OBJ.CHAIR, position: [1, 0, 0.5], rotation: Math.PI / 2, collide: true,
        action: msg("Examine chair", "A chair with a book on it. Looks like a Pokémon strategy guide."),
      },
      {
        type: OBJ.CHAIR, position: [-1, 0, 0.5], rotation: -Math.PI / 2, collide: true,
        action: msg("Examine chair", "A plain wooden chair. Probably for guests."),
      },
      // Plants flanking the door (mirrored)
      {
        type: OBJ.PLANT, position: [3, 0, 4], collide: true,
        action: msg("Examine plant", "A rare Bonsly in a ceramic pot. Very expensive."),
      },
      {
        type: OBJ.PLANT, position: [-3, 0, 4], collide: true,
        action: msg("Examine plant", "A tall, well-groomed fern. Must have a gardener."),
      },

      // --- Staircase (mirrored to left side, direction -1 = south then east) ---

      {
        type: OBJ.STAIRS, position: [-5.1, 0, 0], collide: true,
        config: { stepsPerFlight: 12, stepWidth: 1.5, stepDepth: 0.3, stepHeight: 0.2, wallHeight: 1.0, sideWalls: false, direction: -1 },
        action: msg("Look at stairs", "The stairs leading up to Gary's room. Very fancy."),
      },
      { type: OBJ.FLOOR_SLAB, position: [-5.1, 2.325, 4.2], config: { width: 1.5, depth: 1.5, thickness: 0.15 } },
      {
        type: OBJ.STAIRS, position: [-4.2, 2.2, 4.2], rotation: Math.PI / 2, collide: true,
        config: { stepsPerFlight: 14, stepWidth: 1.5, stepDepth: 0.3, stepHeight: 0.2, wallHeight: 1.0, sideWalls: false, direction: -1 },
      },

      // --- First floor (mirrored) ---

      { type: OBJ.FLOOR_WITH_HOLE, position: [0, 4.75, 0], config: { thickness: 0.15, outerX1: -6, outerX2: 6, outerZ1: -5, outerZ2: 5, holeX1: -6, holeX2: -0.25, holeZ1: 3.35, holeZ2: 5 } },
      { type: OBJ.RAILING, position: [-3.125, 4.975, 3.35], collide: true, config: { width: 5.75, height: 1.0, depth: 0.1 } },

      // Bed (east side, north wall — mirrored from west)
      {
        type: OBJ.BED, position: [4, 4.975, -4], collide: true,
        action: msg("Check bed", "A king-sized bed with silk sheets. Gary lives in luxury."),
      },
      // Computer desk (east wall — mirrored from west)
      {
        type: OBJ.COMPUTER_DESK, position: [5, 4.975, 0], rotation: -Math.PI / 2, collide: true,
        action: msg("Use computer", "Professor Oak's research PC. It's connected to the Pokémon Storage System."),
      },
      // TV (south-east corner)
      {
        type: OBJ.TV, position: [4, 4.975, 4.5], collide: true,
        action: msg("Watch TV", "It's showing Gary's victory montage from the Pokémon League. What a show-off."),
      },
      // Plants
      {
        type: OBJ.PLANT, position: [5, 4.975, 4], collide: true,
        action: msg("Examine plant", "A rare Cherrish Ball planter. Gary has taste."),
      },
      {
        type: OBJ.PLANT, position: [5, 4.975, -4], collide: true,
        action: msg("Examine plant", "A small plant with a name tag. 'Gary's Victory Fern'. Of course."),
      },
      // Table (center of right section)
      {
        type: OBJ.TABLE, position: [3, 4.975, 1], collide: true,
        action: msg("Examine table", "A polished desk with trophies and ribbons. Gary never lets you forget he's #1."),
      },

      { type: OBJ.CEILING, position: [0, 10.0, 0] },
    ],
  },
  teleporters: [
    {
      triggerSpace: "WORLD",
      triggerPosition: [5, 0, -6.0],
      triggerWidth: 1.8,
      triggerDepth: 0.1,
      targetSpace: "GARY_HOUSE",
      spawnPosition: [400, 0, 303.8],
      spawnOrientation: Math.PI,
    },
    {
      triggerSpace: "GARY_HOUSE",
      triggerPosition: [400, 0, 306.0],
      triggerWidth: 1.8,
      triggerDepth: 0.1,
      targetSpace: "WORLD",
      spawnPosition: [5, 0, -4.5],
      spawnOrientation: 0,
    },
  ],
};
