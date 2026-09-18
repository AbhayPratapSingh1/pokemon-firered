import { makeBox, at } from "../shared.js";
import {
  HALF_W, HALF_D, DOOR_HALF_WIDTH, DOOR_HEIGHT,
  BUILDING_TOTAL_HEIGHT, WALL_THICK,
} from "../../house/AshHouse/constants.js";
import { DOOR_CONFIG } from "./config.js";

/**
 * Door frame: lintel across the top of the door opening on the south wall.
 */
export function buildDoorFrame(group, x = 0, z = HALF_D) {
  const { frameColor, frameH, frameDepthMultiplier } = DOOR_CONFIG;
  const doorFrame = makeBox(DOOR_HALF_WIDTH * 2, frameH, WALL_THICK * frameDepthMultiplier, frameColor);
  at(doorFrame, x, DOOR_HEIGHT - frameH / 2, z);
  group.add(doorFrame);
}
