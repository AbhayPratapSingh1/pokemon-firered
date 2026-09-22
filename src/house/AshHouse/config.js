import { OBJ } from "../../config/objTypes.js";
import { COLORS } from "../../config/colors.js";
import { ACTIONS } from "../../config/actions.js";

const DIRECTIONS = {
  NORTH: { name: "NORTH", doorSign: -1, rotation: Math.PI },
  SOUTH: { name: "SOUTH", doorSign: 1, rotation: 0 },
  EAST: { name: "EAST", doorSign: 0, rotation: -Math.PI / 2 },
  WEST: { name: "WEST", doorSign: 0, rotation: Math.PI / 2 },
};

// Action helper
const msg = (prompt, message) => ({
  type: ACTIONS.MESSAGE,
  prompt,
  message,
});

export const ASH_HOUSE = {
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
      { type: OBJ.WALLS, position: [0, 0, 0], collide: true, config: { width: 12, depth: 10, height: 10.0 } },
      { type: OBJ.DOOR_FRAME, position: [0, 0, 5.0] },

      // --- Ground floor (south half) ---

      // Sink (north wall)
      {
        type: OBJ.SINK, position: [-5, 0, -4.5], collide: true,
        action: msg("Examine sink", "A clean sink. Mom always reminds me to wash my hands before dinner."),
      },
      // Cupboard (north wall)
      {
        type: OBJ.CUPBOARD, position: [-3, 0, -4.5], collide: true,
        action: msg("Open cupboard", "The kitchen cupboard. It's stocked with Mom's favorite curry ingredients."),
      },
      // TV (north wall)
      {
        type: OBJ.TV, position: [0, 0, -4.5], collide: true,
        action: msg("Watch TV", "The news is reporting unusual Pokémon sightings near Viridian City."),
      },
      // Table + 4 chairs
      {
        type: OBJ.TABLE, position: [0, 0, 0.5], collide: true,
        action: msg("Examine table", "The family dining table. It's seen many of Mom's home-cooked meals."),
      },
      {
        type: OBJ.CHAIR, position: [0, 0, -0.5], rotation: 0, collide: true,
        action: msg("Examine chair", "A simple wooden chair. It's a bit hard, but sturdy."),
      },
      {
        type: OBJ.CHAIR, position: [0, 0, 1.5], rotation: Math.PI, collide: true,
        action: msg("Examine chair", "This chair has a cushion on it. Much more comfortable than the others."),
      },
      {
        type: OBJ.CHAIR, position: [-1, 0, 0.5], rotation: Math.PI / 2, collide: true,
        action: msg("Examine chair", "A wooden chair with a few scratches. Probably from Pikachu running around."),
      },
      {
        type: OBJ.CHAIR, position: [1, 0, 0.5], rotation: -Math.PI / 2, collide: true,
        action: msg("Examine chair", "There's a small indent on the seat. Mom's favorite spot to sit."),
      },
      // Plants flanking the door
      {
        type: OBJ.PLANT, position: [-3, 0, 4], collide: true,
        action: msg("Examine plant", "A healthy potted plant. Mom takes good care of it."),
      },
      {
        type: OBJ.PLANT, position: [3, 0, 4], collide: true,
        action: msg("Examine plant", "A fake plant. It looks real enough, but it never needs watering."),
      },

      // --- Staircase ---

      {
        type: OBJ.STAIRS, position: [5.1, 0, 0], collide: true,
        config: { stepsPerFlight: 12, stepWidth: 1.5, stepDepth: 0.3, stepHeight: 0.2, wallHeight: 1.0, sideWalls: false, direction: 1 },
        action: msg("Look at stairs", "The stairs leading up to my room. I should go check it out."),
      },
      { type: OBJ.FLOOR_SLAB, position: [5.1, 2.325, -4.2], config: { width: 1.5, depth: 1.5, thickness: 0.15 } },
      {
        type: OBJ.STAIRS, position: [4.2, 2.2, -4.2], rotation: Math.PI / 2, collide: true,
        config: { stepsPerFlight: 14, stepWidth: 1.5, stepDepth: 0.3, stepHeight: 0.2, wallHeight: 1.0, sideWalls: false, direction: 1 },
      },

      // --- First floor ---

      { type: OBJ.FLOOR_WITH_HOLE, position: [0, 4.75, 0], config: { thickness: 0.15, outerX1: -6, outerX2: 6, outerZ1: -5, outerZ2: 5, holeX1: 0.25, holeX2: 6, holeZ1: -5, holeZ2: -3.35 } },
      { type: OBJ.RAILING, position: [3.125, 4.975, -3.35], collide: true, config: { width: 5.75, height: 1.0, depth: 0.1 } },

      // Bed (west side, north wall)
      {
        type: OBJ.BED, position: [-4, 4.975, -4], collide: true,
        action: msg("Check bed", "My bed! Pikachu sometimes naps here when I'm away."),
      },
      // Computer desk (west wall)
      {
        type: OBJ.COMPUTER_DESK, position: [-5, 4.975, 0], rotation: Math.PI / 2, collide: true,
        action: msg("Use computer", "Professor Oak's old PC. It has a Pokémon Storage System installed. 'Bill's PC' is on the screen."),
      },
      // TV (south section, south wall)
      {
        type: OBJ.TV, position: [3, 4.975, 4.5], collide: true,
        action: msg("Watch TV", "It's showing reruns of the Pokémon League Conference. Ash vs Gary — what a battle!"),
      },
      // Plants
      {
        type: OBJ.PLANT, position: [5, 4.975, 4], collide: true,
        action: msg("Examine plant", "A small potted plant. It adds a nice touch to the room."),
      },
      {
        type: OBJ.PLANT, position: [-2, 4.975, -4.5], collide: true,
        action: msg("Examine plant", "This plant has grown a lot since I left for my journey. Mom must be watering it."),
      },
      // Table (center of south section)
      {
        type: OBJ.TABLE, position: [3, 4.975, 1], collide: true,
        action: msg("Examine table", "A study table with textbooks and a Pokédex reference guide. Time to study... or not."),
      },

      { type: OBJ.CEILING, position: [0, 10.0, 0] },
    ],
  },
  teleporters: [
      {
        triggerSpace: "WORLD",
        triggerPosition: [-5, 0, -6.0],
        triggerWidth: 1.8,
        triggerDepth: 0.1,
        targetSpace: "ASH_HOUSE",
        spawnPosition: [300, 0, 303.8],
        spawnOrientation: Math.PI,
      },
      {
        triggerSpace: "ASH_HOUSE",
        triggerPosition: [300, 0, 306.0],
        triggerWidth: 1.8,
        triggerDepth: 0.1,
        targetSpace: "WORLD",
        spawnPosition: [-5, 0, -4.5],
        spawnOrientation: 0,
      },
    ],
};
