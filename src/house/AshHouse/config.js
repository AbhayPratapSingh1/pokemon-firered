/**
 * Ash House layout configuration.
 * Defines furniture placement for each floor. Positions are local to the
 * house group (origin at 0,0,0 relative to HOUSE_ORIGIN).
 *
 * Each entry: { type: string, args: [...positional args] }
 * Supported types: tv, plant, cupboard, diningSet, sink, bed, computerDesk
 */

import { HALF_W, HALF_D, FLOOR2_HEIGHT } from "./constants.js";

export const GROUND_FLOOR_FURNITURE = [
  // TV: NW corner, screen facing south into room
  { type: "tv", args: [-HALF_W + 1.05, -HALF_D + 0.75, 0, "south"] },
  // Cupboard: west wall, mid-room
  { type: "cupboard", args: [-HALF_W + 0.6, -2.2, 0] },
  // Dining table + 4 chairs: center-west living area
  { type: "diningSet", args: [-2.0, 1.0, 0] },
  // Sink: south wall, clear of door and stairs
  { type: "sink", args: [2.4, HALF_D - 0.7, 0] },
  // Plants flanking the front door
  { type: "plant", args: [-1.2, HALF_D - 0.6, 0] },
  { type: "plant", args: [1.2, HALF_D - 0.6, 0] },
];

export const SECOND_FLOOR_FURNITURE = [
  // Bed: NW corner, headboard toward north wall
  { type: "bed", args: [-HALF_W + 1.85, -HALF_D + 1.15, FLOOR2_HEIGHT] },
  // Cupboard: south wall
  { type: "cupboard", args: [-0.7, HALF_D - 0.6, FLOOR2_HEIGHT] },
  // TV: west wall, south portion, screen facing east
  { type: "tv", args: [-HALF_W + 0.85, 1.5, FLOOR2_HEIGHT, "east"] },
  // Computer desk + PC: east wall, south of stairwell landing
  { type: "computerDesk", args: [HALF_W - 0.55, HALF_D - 2.3, FLOOR2_HEIGHT] },
];
