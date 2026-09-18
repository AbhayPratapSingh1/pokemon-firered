import { COLORS } from "../shared.js";

export const TV_CONFIG = {
  stand: { w: 0.9, h: 0.55, d: 0.5, color: COLORS.darkWood, collide: true },
  body:  { w: 0.8, h: 0.55, d: 0.35, color: COLORS.tvBody, collide: true },
  screen:{ w: 0.6, h: 0.4, d: 0.05, color: COLORS.tvScreen },
  screenOffset: 0.18,
  interactable: {
    prompt: "Press E to watch TV",
    message: "It's a TV. Nothing interesting is on.",
    heightOffset: 0.4,
  },
};
