import { COLORS } from "../shared.js";

export const SINK_CONFIG = {
  counter: { w: 0.8, h: 0.85, d: 0.55, color: COLORS.sinkBody, collide: true },
  basin:   { w: 0.55, h: 0.08, d: 0.35, color: COLORS.sinkBasin },
  counterY: 0.425,
  basinY: 0.85,
  interactable: {
    prompt: "Press E to use the sink",
    message: "The sink is clean.",
    heightOffset: 0.4,
  },
};
