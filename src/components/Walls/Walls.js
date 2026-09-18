import { makeBox, at } from "../shared.js";
import {
  HALF_W, HALF_D, DOOR_HALF_WIDTH, DOOR_HEIGHT, FLOOR_WIDTH, FLOOR_DEPTH,
  WALL_THICK, BUILDING_TOTAL_HEIGHT,
} from "../../house/AshHouse/constants.js";
import { WALLS_CONFIG } from "./config.js";

/**
 * Perimeter walls spanning the full building height. Includes the south wall
 * with a door opening (two side segments + lintel above).
 */
export function buildWalls(group) {
  const { color, collide } = WALLS_CONFIG;
  const h = BUILDING_TOTAL_HEIGHT;

  const northWall = makeBox(FLOOR_WIDTH + WALL_THICK, h, WALL_THICK, color, { collide });
  group.add(at(northWall, 0, h / 2, -HALF_D));

  const westWall = makeBox(WALL_THICK, h, FLOOR_DEPTH, color, { collide });
  group.add(at(westWall, -HALF_W, h / 2, 0));

  const eastWall = makeBox(WALL_THICK, h, FLOOR_DEPTH, color, { collide });
  group.add(at(eastWall, HALF_W, h / 2, 0));

  const southSegWidth = HALF_W - DOOR_HALF_WIDTH;

  const southLeft = makeBox(southSegWidth, h, WALL_THICK, color, { collide });
  at(southLeft, -(DOOR_HALF_WIDTH + southSegWidth / 2), h / 2, HALF_D);
  group.add(southLeft);

  const southRight = makeBox(southSegWidth, h, WALL_THICK, color, { collide });
  at(southRight, DOOR_HALF_WIDTH + southSegWidth / 2, h / 2, HALF_D);
  group.add(southRight);

  const lintelHeight = h - DOOR_HEIGHT;
  const southLintel = makeBox(DOOR_HALF_WIDTH * 2, lintelHeight, WALL_THICK, color, { collide });
  at(southLintel, 0, DOOR_HEIGHT + lintelHeight / 2, HALF_D);
  group.add(southLintel);
}
