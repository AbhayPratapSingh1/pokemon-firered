/**
 * Gary House layout configuration (MIRROR of Ash's House).
 * All X-coordinates are negated compared to Ash's layout.
 *
 * Ash's layout from gate:  AAABBB
 * Gary's layout from gate: BBBAAA
 */

import { HALF_W, HALF_D, FLOOR2_HEIGHT } from "./constants.js";

export const GROUND_FLOOR_FURNITURE = [
  // TV: NE corner (mirrored from NW), screen facing south
  { type: "tv", args: [HALF_W - 1.05, -HALF_D + 0.75, 0, "south"] },
  // Cupboard: east wall (mirrored from west)
  { type: "cupboard", args: [HALF_W - 0.6, -2.2, 0] },
  // Dining table + chairs: center-east (mirrored from center-west)
  { type: "diningSet", args: [2.0, 1.0, 0] },
  // Sink: south wall, mirrored position
  { type: "sink", args: [-2.4, HALF_D - 0.7, 0] },
  // Plants flanking the front door
  { type: "plant", args: [-1.2, HALF_D - 0.6, 0] },
  { type: "plant", args: [1.2, HALF_D - 0.6, 0] },
];

export const SECOND_FLOOR_FURNITURE = [
  // Bed: NE corner (mirrored from NW)
  { type: "bed", args: [HALF_W - 1.85, -HALF_D + 1.15, FLOOR2_HEIGHT] },
  // Cupboard: south wall, mirrored position
  { type: "cupboard", args: [0.7, HALF_D - 0.6, FLOOR2_HEIGHT] },
  // TV: east wall (mirrored from west), screen facing west
  { type: "tv", args: [HALF_W - 0.85, 1.5, FLOOR2_HEIGHT, "west"] },
  // Computer desk: west wall (mirrored from east)
  { type: "computerDesk", args: [-HALF_W + 0.55, HALF_D - 2.3, FLOOR2_HEIGHT] },
];
