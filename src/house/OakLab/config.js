import { OBJ } from "../../config/objTypes.js";
import { COLORS } from "../../config/colors.js";
import { ACTIONS } from "../../config/actions.js";

const DIRECTIONS = {
  NORTH: { name: "NORTH", doorSign: -1, rotation: Math.PI },
  SOUTH: { name: "SOUTH", doorSign: 1, rotation: 0 },
  EAST: { name: "EAST", doorSign: 0, rotation: -Math.PI / 2 },
  WEST: { name: "WEST", doorSign: 0, rotation: Math.PI / 2 },
};

const msg = (prompt, message) => ({
  type: ACTIONS.MESSAGE,
  prompt,
  message,
});

const LAB_WALL = 0xd0e8f0;
const LAB_ROOF = 0xb0c8d4;

export const OAK_LAB = {
  name: "Oak's Lab",
  exterior: {
    position: [0, 0, 25],
    facing: DIRECTIONS.SOUTH,
    objects: [
      {
        type: OBJ.HOUSE,
        position: [0, 0, 0],
        config: {
          width: 14, depth: 24, wallHeight: 5, roofHeight: 0,
          wallColor: LAB_WALL, roofColor: LAB_ROOF,
          flatRoof: true,
          windows: [],
        },
      },
    ],
  },
  interior: {
    origin: [500, 0, 300],
    objects: [
      { type: OBJ.GROUND_FLOOR, position: [0, 0, 0], config: { width: 14, depth: 24 } },
      { type: OBJ.WALLS, position: [0, 0, 0], collide: true, config: { width: 14, depth: 24, height: 5.0 } },
      { type: OBJ.DOOR_FRAME, position: [0, 0, 12.0] },

      // ============================================================
      //  NORTH (back wall) — z = -12
      // ============================================================

      // Bookshelf (north-west)
      {
        type: OBJ.LAB_SHELF, position: [-5, 0, -11], collide: true,
        action: msg("Browse books", "Rows of Pokémon research journals. Professor Oak has published dozens of papers."),
      },
      // Computer desk (north-center)
      {
        type: OBJ.COMPUTER_DESK, position: [0, 0, -11], rotation: Math.PI, collide: true,
        action: msg("Use PC", "Professor Oak's research computer. It's connected to the global Pokémon Storage System."),
      },
      // Large complex machine (north-east)
      {
        type: OBJ.LAB_MACHINE, position: [5, 0, -11], collide: true, scale: [1.5, 1.5, 1.5],
        action: msg("Examine machine", "A massive Pokémon analysis machine. It can measure a Pokémon's stats, DNA, and evolutionary potential."),
      },

      // ============================================================
      //  NORTH-CENTER — z = -8
      // ============================================================

      // Bookshelf (left)
      {
        type: OBJ.LAB_SHELF, position: [-5, 0, -7], collide: true,
        action: msg("Browse books", "Textbooks on Pokémon biology, evolution, and habitat studies."),
      },
      // Second bookshelf (left, behind first)
      {
        type: OBJ.LAB_SHELF, position: [-5, 0, -5], collide: true,
        action: msg("Browse books", "Older volumes on Pokémon breeding and genetics. Some pages are marked with sticky notes."),
      },

      // ============================================================
      //  CENTER — z = -2  (Pokemon table)
      // ============================================================

      {
        type: OBJ.TABLE, position: [0, 0, -2], collide: true, scale: [3, 1, 1.5],
        action: msg("Examine Poké Balls", "Three Poké Balls sit on the table. Inside are Bulbasaur, Charmander, and Squirtle — your future partner!"),
      },
      {
        type: OBJ.POKEBALL, position: [-1.2, 0.75, -2], collide: false,
        action: msg("Bulbasaur", "A Poké Ball containing Bulbasaur, the Grass-type starter."),
      },
      {
        type: OBJ.POKEBALL, position: [0, 0.75, -2], collide: false,
        action: msg("Charmander", "A Poké Ball containing Charmander, the Fire-type starter."),
      },
      {
        type: OBJ.POKEBALL, position: [1.2, 0.75, -2], collide: false,
        action: msg("Squirtle", "A Poké Ball containing Squirtle, the Water-type starter."),
      },

      // ============================================================
      //  SOUTH-CENTER — z = +4  (Lab desks)
      // ============================================================

      // Lab desk (left)
      {
        type: OBJ.LAB_DESK, position: [-3, 0, 4], rotation: Math.PI / 2, collide: true,
        action: msg("Examine desk", "One of the assistants' workstations. Notes about rare Pokémon sightings are scattered across it."),
      },
      // Lab desk (right)
      {
        type: OBJ.LAB_DESK, position: [3, 0, 4], rotation: -Math.PI / 2, collide: true,
        action: msg("Examine desk", "A desk stacked with research papers and a half-finished report on Mewtwo."),
      },

      // ============================================================
      //  SOUTH — z = +8  (Cabinets flanking entrance)
      // ============================================================

      // Small cabinet (left)
      {
        type: OBJ.CUPBOARD, position: [-4, 0, 8], collide: true,
        action: msg("Open cabinet", "Drawers full of Poké Balls, Potions, and other research supplies."),
      },
      // Small cabinet (right)
      {
        type: OBJ.CUPBOARD, position: [4, 0, 8], collide: true,
        action: msg("Open cabinet", "Storage for lab equipment. Most of it is too advanced to understand."),
      },

      // ============================================================
      //  ENTRANCE — z = +11  (Plants flanking door)
      // ============================================================

      {
        type: OBJ.PLANT, position: [-4, 0, 11], collide: true,
        action: msg("Examine plant", "A potted fern. It thrives in the lab's controlled environment."),
      },
      {
        type: OBJ.PLANT, position: [4, 0, 11], collide: true,
        action: msg("Examine plant", "A tall indoor plant. Professor Oak says plants help with air quality."),
      },

      // ============================================================
      //  EXTRA — Round observation machine (west side)
      // ============================================================

      {
        type: OBJ.LAB_MACHINE, position: [-5, 0, 1], collide: true,
        action: msg("Examine machine", "A round observation device. It monitors Pokémon in the surrounding area."),
      },

      // ============================================================
      //  WINDOW (north wall, right of bookshelf)
      // ============================================================

      {
        type: OBJ.WINDOW, position: [3, 3, -11.8],
      },

      { type: OBJ.CEILING, position: [0, 5.0, 0] },
    ],
  },
  teleporters: [
    // Entry: outside lab door in WORLD → inside lab
    {
      triggerSpace: "WORLD",
      triggerPosition: [0, 0, 39],
      triggerWidth: 1.8,
      triggerDepth: 0.1,
      targetSpace: "OAK_LAB",
      spawnPosition: [500, 0, 308],
      spawnOrientation: Math.PI,
    },
    // Exit: inside lab at door → outside lab
    {
      triggerSpace: "OAK_LAB",
      triggerPosition: [500, 0, 312],
      triggerWidth: 1.8,
      triggerDepth: 0.1,
      targetSpace: "WORLD",
      spawnPosition: [0, 0, 39],
      spawnOrientation: 0,
    },
  ],
};
