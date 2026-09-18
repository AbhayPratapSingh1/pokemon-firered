import { makeBox, at } from "../shared.js";
import { CUPBOARD_CONFIG } from "./config.js";

/**
 * Wooden cupboard/cabinet with a center seam detail.
 */
export function buildCupboard(group, x, z, y = 0) {
  const { body, seam, bodyY } = CUPBOARD_CONFIG;

  const cupboard = makeBox(body.w, body.h, body.d, body.color, { collide: body.collide });
  at(cupboard, x, y + bodyY, z);
  group.add(cupboard);

  const seamMesh = makeBox(seam.w, seam.h, seam.d, seam.color);
  at(seamMesh, x, y + bodyY, z);
  group.add(seamMesh);
}
