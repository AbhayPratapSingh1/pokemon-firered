import { COLORS } from "../shared.js";

export const DINING_SET_CONFIG = {
  table: { w: 1.4, h: 0.72, d: 1.0, color: COLORS.wood, collide: true },
  chair: { w: 0.45, h: 0.45, d: 0.45, color: COLORS.wood, collide: true },
  chairOffsets: [
    { dz: -0.85, rot: 0 },
    { dz:  0.85, rot: Math.PI },
    { dx: -0.95, rot: Math.PI / 2 },
    { dx:  0.95, rot: -Math.PI / 2 },
  ],
};
