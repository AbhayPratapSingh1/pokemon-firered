import * as THREE from "three";
import { makeBox, at } from "../shared.js";
import { BED_CONFIG } from "./config.js";

/**
 * Bed: frame + mattress + pillow.
 */
export function buildBed(group, x, z, y = 0) {
  const { frame: f, mattress: m, pillow: p } = BED_CONFIG;

  const frame = makeBox(f.w, f.h, f.d, f.color, { collide: f.collide });
  at(frame, x, y + BED_CONFIG.frameY, z);
  group.add(frame);

  const mattress = makeBox(m.w, m.h, m.d, m.color, { collide: m.collide });
  at(mattress, x, y + BED_CONFIG.mattressYOffset + m.h / 2, z);
  group.add(mattress);

  const pillow = makeBox(p.w, p.h, p.d, p.color);
  at(pillow, x, y + BED_CONFIG.pillowYOffset, z + BED_CONFIG.pillowDz);
  group.add(pillow);
}

export function getBedInteractable(x, z, y = 0) {
  const { interactable } = BED_CONFIG;
  return {
    name: "Bed",
    prompt: interactable.prompt,
    position: new THREE.Vector3(x, y + interactable.heightOffset, z),
    message: interactable.message,
  };
}
