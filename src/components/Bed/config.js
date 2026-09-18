import { COLORS } from "../shared.js";

export const BED_CONFIG = {
  frame:    { w: 1.5, h: 0.35, d: 2.1, color: COLORS.bedFrame, collide: true },
  mattress: { w: 1.4, h: 0.25, d: 2.0, color: COLORS.blanket, collide: true },
  pillow:   { w: 0.55, h: 0.15, d: 0.4, color: COLORS.pillow },
  frameY: 0.175,
  mattressYOffset: 0.35,
  pillowYOffset: 0.6,
  pillowDz: -0.75,
  interactable: {
    prompt: "Press E to sleep",
    message: "It's your bed. You feel refreshed just looking at it.",
    heightOffset: 0.4,
  },
};
