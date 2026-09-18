import * as THREE from "three";
import { makeBox, at } from "../shared.js";
import { SINK_CONFIG } from "./config.js";

/**
 * Kitchen sink: counter block + basin on top.
 */
export function buildSink(group, x, z, y = 0) {
  const { counter, basin } = SINK_CONFIG;

  const counterMesh = makeBox(counter.w, counter.h, counter.d, counter.color, { collide: counter.collide });
  at(counterMesh, x, y + SINK_CONFIG.counterY, z);
  group.add(counterMesh);

  const basinMesh = makeBox(basin.w, basin.h, basin.d, basin.color);
  at(basinMesh, x, y + SINK_CONFIG.basinY, z);
  group.add(basinMesh);
}

export function getSinkInteractable(x, z, y = 0) {
  const { interactable } = SINK_CONFIG;
  return {
    name: "Sink",
    prompt: interactable.prompt,
    position: new THREE.Vector3(x, y + interactable.heightOffset, z),
    message: interactable.message,
  };
}
