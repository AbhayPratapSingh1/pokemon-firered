import * as THREE from "three";
import { addShadow } from "../utils.js";
import { GARY_HOUSE_CONFIG } from "./config.js";
import { buildChimney } from "../../components/Chimney/Chimney.js";
import { buildMailbox } from "../../components/Mailbox/Mailbox.js";
import { buildFence } from "../../components/Fence/Fence.js";

/**
 * Gary's House — a square house with a pyramid roof, chimney, mailbox,
 * and small front fence. Similar structure to the player's house but
 * with a teal roof and cream walls.
 */
export function createGaryExterior({
  position,
  rotationY = 0,
  config = GARY_HOUSE_CONFIG,
} = {}) {
  const g = new THREE.Group();
  g.position.copy(position);
  g.rotation.y = rotationY;

  const {
    width, depth, wallHeight, roofHeight,
    wallColor, roofColor,
    doorColor, doorWidth, doorHeight,
    windowColor, windowWidth, windowHeight,
    hasChimney, hasMailbox, hasFence,
  } = config;

  // Walls
  const walls = new THREE.Mesh(
    new THREE.BoxGeometry(width, wallHeight, depth),
    new THREE.MeshStandardMaterial({ color: wallColor, roughness: 0.9 })
  );
  walls.position.y = wallHeight / 2;
  addShadow(walls);
  g.add(walls);

  // Pyramid roof
  const roofRadius = (Math.hypot(width, depth) / 2) * 1.05;
  const roof = new THREE.Mesh(
    new THREE.ConeGeometry(roofRadius, roofHeight, 4),
    new THREE.MeshStandardMaterial({ color: roofColor, roughness: 0.7 })
  );
  roof.rotation.y = Math.PI / 4;
  roof.position.y = wallHeight + roofHeight / 2;
  roof.userData.collide = true;
  addShadow(roof);
  g.add(roof);

  // Door
  const door = new THREE.Mesh(
    new THREE.BoxGeometry(doorWidth, doorHeight, 0.15),
    new THREE.MeshStandardMaterial({ color: doorColor, roughness: 0.8 })
  );
  door.position.set(0, doorHeight / 2, depth / 2 + 0.08);
  addShadow(door);
  g.add(door);

  // Windows (front face)
  const winMat = new THREE.MeshStandardMaterial({ color: windowColor, roughness: 0.4 });
  for (const dx of [-1.7, 1.7]) {
    const win = new THREE.Mesh(
      new THREE.BoxGeometry(windowWidth, windowHeight, 0.1),
      winMat
    );
    win.position.set(dx, wallHeight * 0.6, depth / 2 + 0.06);
    addShadow(win);
    g.add(win);
  }

  // Chimney
  if (hasChimney) {
    buildChimney(g, width * 0.3, -depth * 0.25, wallHeight + roofHeight * 0.5);
  }

  // Mailbox (in front of house)
  if (hasMailbox) {
    buildMailbox(g, width / 2 + 1.0, depth / 2 + 0.5, 0);
  }

  // Fence (two short segments flanking the front yard)
  if (hasFence) {
    buildFence(g, -width / 2 - 1.0, depth / 2 + 0.5, 0, 2);
    buildFence(g, width / 2 + 1.0, depth / 2 + 0.5, 0, 2);
  }

  return g;
}
