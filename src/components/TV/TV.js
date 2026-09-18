import * as THREE from "three";
import { makeBox, at } from "../shared.js";
import { TV_CONFIG } from "./config.js";

/**
 * TV unit: stand + body + screen.
 */
export function buildTV(group, x, z, y = 0, facing = "south") {
  const { stand: s, body: b, screen: sc, screenOffset } = TV_CONFIG;
  const rotationY = facing === "east" ? -Math.PI / 2 : 0;
  const offsetX = facing === "east" ? screenOffset : 0;
  const offsetZ = facing === "south" ? screenOffset : 0;

  const stand = makeBox(s.w, s.h, s.d, s.color, { collide: s.collide });
  stand.rotation.y = rotationY;
  at(stand, x, y + s.h / 2, z);
  group.add(stand);

  const body = makeBox(b.w, b.h, b.d, b.color, { collide: b.collide });
  body.rotation.y = rotationY;
  at(body, x, y + s.h + b.h / 2, z);
  group.add(body);

  const screen = makeBox(sc.w, sc.h, sc.d, sc.color);
  screen.rotation.y = rotationY;
  at(screen, x + offsetX, y + s.h + b.h / 2, z + offsetZ);
  group.add(screen);
}

export function getTVInteractable(x, z, y = 0) {
  const { interactable } = TV_CONFIG;
  return {
    name: "TV",
    prompt: interactable.prompt,
    position: new THREE.Vector3(x, y + interactable.heightOffset, z),
    message: interactable.message,
  };
}
