import * as THREE from "three";
import { addShadow } from "../utils.js";
import { OAK_LAB_CONFIG } from "./config.js";
import { buildSign } from "../../components/Sign/Sign.js";

/**
 * Oak's Lab — a larger rectangular research building with a flat overhanging
 * roof, wide door, row of windows, and a signpost out front.
 */
export function createOakLab({
  position,
  rotationY = 0,
  config = OAK_LAB_CONFIG,
} = {}) {
  const g = new THREE.Group();
  g.position.copy(position);
  g.rotation.y = rotationY;

  const {
    width, depth, wallHeight, wallColor, trimColor,
    doorColor, doorWidth, doorHeight,
    windowColor, windowWidth, windowHeight,
    roofThickness,
  } = config;

  // Walls
  const walls = new THREE.Mesh(
    new THREE.BoxGeometry(width, wallHeight, depth),
    new THREE.MeshStandardMaterial({ color: wallColor, roughness: 0.85 })
  );
  walls.position.y = wallHeight / 2;
  addShadow(walls);
  g.add(walls);

  // Flat overhanging roof
  const roof = new THREE.Mesh(
    new THREE.BoxGeometry(width + 0.8, roofThickness, depth + 0.8),
    new THREE.MeshStandardMaterial({ color: trimColor, roughness: 0.6 })
  );
  roof.position.y = wallHeight + roofThickness / 2;
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
  for (const dx of [-4, 4]) {
    const win = new THREE.Mesh(
      new THREE.BoxGeometry(windowWidth, windowHeight, 0.1),
      winMat
    );
    win.position.set(dx, wallHeight * 0.6, depth / 2 + 0.06);
    addShadow(win);
    g.add(win);
  }

  // Side windows
  for (const dz of [-2, 0, 2]) {
    const winL = new THREE.Mesh(new THREE.BoxGeometry(0.1, windowHeight, windowWidth), winMat);
    winL.position.set(-width / 2 - 0.06, wallHeight * 0.6, dz);
    addShadow(winL);
    g.add(winL);

    const winR = new THREE.Mesh(new THREE.BoxGeometry(0.1, windowHeight, windowWidth), winMat);
    winR.position.set(width / 2 + 0.06, wallHeight * 0.6, dz);
    addShadow(winR);
    g.add(winR);
  }

  // Sign out front
  buildSign(g, 0, depth / 2 + 2.5, 0);

  return g;
}
