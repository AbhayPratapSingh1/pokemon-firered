import { COLORS } from "../shared.js";

export const COMPUTER_DESK_CONFIG = {
  desk:     { w: 0.55, h: 0.7, d: 0.9, color: COLORS.wood, collide: true },
  pcBody:   { w: 0.35, h: 0.35, d: 0.4, color: COLORS.pcBody, collide: true },
  pcScreen: { w: 0.05, h: 0.24, d: 0.32, color: COLORS.pcScreen },
  deskY: 0.35,
  pcBodyYOffset: 0.7,
  pcScreenYOffset: 1.0,
  pcScreenDx: -0.16,
  pcBodyDz: -0.1,
  interactable: {
    prompt: "Press E to use the PC",
    message: "The PC hums quietly. No new mail.",
    heightOffset: 0.4,
  },
};
