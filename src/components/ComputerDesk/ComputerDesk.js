import * as THREE from "three";
import { makeBox, at } from "../shared.js";
import { COMPUTER_DESK_CONFIG } from "./config.js";

/**
 * Computer desk with PC body and screen. Assumes the desk sits flush against
 * the east wall, screen facing west into the room.
 */
export function buildComputerDesk(group, x, z, y = 0) {
  const { desk: d, pcBody: pb, pcScreen: ps } = COMPUTER_DESK_CONFIG;

  const desk = makeBox(d.w, d.h, d.d, d.color, { collide: d.collide });
  at(desk, x, y + COMPUTER_DESK_CONFIG.deskY, z);
  group.add(desk);

  const pcBody = makeBox(pb.w, pb.h, pb.d, pb.color, { collide: pb.collide });
  at(pcBody, x, y + COMPUTER_DESK_CONFIG.pcBodyYOffset + pb.h / 2, z + COMPUTER_DESK_CONFIG.pcBodyDz);
  group.add(pcBody);

  const pcScreen = makeBox(ps.w, ps.h, ps.d, ps.color);
  at(pcScreen, x + COMPUTER_DESK_CONFIG.pcScreenDx, y + COMPUTER_DESK_CONFIG.pcScreenYOffset + ps.h / 2, z + COMPUTER_DESK_CONFIG.pcBodyDz);
  group.add(pcScreen);
}

export function getPCInteractable(x, z, y = 0) {
  const { interactable } = COMPUTER_DESK_CONFIG;
  return {
    name: "PC",
    prompt: interactable.prompt,
    position: new THREE.Vector3(x, y + interactable.heightOffset, z),
    message: interactable.message,
  };
}
