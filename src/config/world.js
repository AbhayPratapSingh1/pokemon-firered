import * as THREE from "three";
import { SPACES } from "./spaces.js";

export const WORLD = {
  GROUND_SIZE: 800,
  TREE_COUNT: 0,
  TREE_RING_MIN: 30,
  TREE_RING_MAX: 70,
  SPAWN_POSITION: new THREE.Vector3(300, 0, 303),
  BACKGROUND_COLOR: 0x87ceeb,
  FOG_NEAR: 60,
  FOG_FAR: 160,

  // Spaces to include in the world — add new space names here
  objects: [
    SPACES.ASH_HOUSE,
    SPACES.GARY_HOUSE,
  ],
};
