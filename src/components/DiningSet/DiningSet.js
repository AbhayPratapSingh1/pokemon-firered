import { makeBox, at } from "../shared.js";
import { DINING_SET_CONFIG } from "./config.js";

/**
 * Dining table + 4 chairs arranged around it.
 */
export function buildDiningSet(group, centerX, centerZ, y = 0) {
  const { table: t, chair: c, chairOffsets } = DINING_SET_CONFIG;

  const table = makeBox(t.w, t.h, t.d, t.color, { collide: t.collide });
  at(table, centerX, y + t.h / 2, centerZ);
  group.add(table);

  for (const offset of chairOffsets) {
    const chair = makeBox(c.w, c.h, c.d, c.color, { collide: c.collide });
    chair.rotation.y = offset.rot;
    at(chair, centerX + (offset.dx || 0), y + c.h / 2, centerZ + (offset.dz || 0));
    group.add(chair);
  }
}
