import { COLORS } from "../shared.js";

export const PLANT_CONFIG = {
  pot: {
    radiusTop: 0.22,
    radiusBottom: 0.18,
    height: 0.3,
    segments: 8,
    color: COLORS.potBrown,
    collide: true,
  },
  leaves: {
    radius: 0.32,
    widthSegments: 8,
    heightSegments: 6,
    color: COLORS.leafGreen,
  },
  potY: 0.15,
  leavesY: 0.55,
};
