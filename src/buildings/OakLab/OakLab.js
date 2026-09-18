import * as THREE from "three";
import { addShadow } from "../utils.js";
import { OAK_LAB_CONFIG } from "./config.js";
import { buildTable } from "../../components/Table/Table.js";
import { buildPokeball } from "../../components/Pokeball/Pokeball.js";
import { buildLabShelf } from "../../components/LabShelf/LabShelf.js";
import { buildLabMachine } from "../../components/LabMachine/LabMachine.js";
import { buildLabDesk } from "../../components/LabDesk/LabDesk.js";
import { buildLabPlant } from "../../components/LabPlant/LabPlant.js";

/**
 * Oak's Lab — faithful recreation of Professor Oak's Laboratory from
 * Pokemon FireRed/LeafGreen. Interior visible through open front.
 *
 * Layout (top-down, facing south/entrance):
 *   [Shelf] [Machine] [Machine]     <- north wall
 *   [Desk+PC]    [Shelf]   [Shelf]
 *   [Table+3 Pokeballs]
 *   [Plant]              [Plant]
 *         [DOOR]
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

  // --- Floor ---
  const floorMat = new THREE.MeshStandardMaterial({ color: 0xd7ccc8, roughness: 0.9 });
  const floor = new THREE.Mesh(new THREE.BoxGeometry(width, 0.1, depth), floorMat);
  floor.position.y = 0.05;
  floor.receiveShadow = true;
  g.add(floor);

  // --- Back wall (north) ---
  const wallMat = new THREE.MeshStandardMaterial({ color: wallColor, roughness: 0.85 });
  const backWall = new THREE.Mesh(new THREE.BoxGeometry(width, wallHeight, 0.2), wallMat);
  backWall.position.set(0, wallHeight / 2, -depth / 2);
  addShadow(backWall);
  g.add(backWall);

  // --- Left wall (west) ---
  const leftWall = new THREE.Mesh(new THREE.BoxGeometry(0.2, wallHeight, depth), wallMat);
  leftWall.position.set(-width / 2, wallHeight / 2, 0);
  addShadow(leftWall);
  g.add(leftWall);

  // --- Right wall (east) ---
  const rightWall = new THREE.Mesh(new THREE.BoxGeometry(0.2, wallHeight, depth), wallMat);
  rightWall.position.set(width / 2, wallHeight / 2, 0);
  addShadow(rightWall);
  g.add(rightWall);

  // --- Front wall (south) — two side pillars, open center ---
  const pillarW = (width - doorWidth) / 2;
  const leftPillar = new THREE.Mesh(new THREE.BoxGeometry(pillarW, wallHeight, 0.2), wallMat);
  leftPillar.position.set(-width / 2 + pillarW / 2, wallHeight / 2, depth / 2);
  addShadow(leftPillar);
  g.add(leftPillar);

  const rightPillar = new THREE.Mesh(new THREE.BoxGeometry(pillarW, wallHeight, 0.2), wallMat);
  rightPillar.position.set(width / 2 - pillarW / 2, wallHeight / 2, depth / 2);
  addShadow(rightPillar);
  g.add(rightPillar);

  // Door frame top
  const frameTop = new THREE.Mesh(
    new THREE.BoxGeometry(doorWidth, wallHeight - doorHeight, 0.2),
    wallMat
  );
  frameTop.position.set(0, doorHeight + (wallHeight - doorHeight) / 2, depth / 2);
  addShadow(frameTop);
  g.add(frameTop);

  // Door (dark, slightly recessed)
  const door = new THREE.Mesh(
    new THREE.BoxGeometry(doorWidth, doorHeight, 0.1),
    new THREE.MeshStandardMaterial({ color: doorColor, roughness: 0.8 })
  );
  door.position.set(0, doorHeight / 2, depth / 2 - 0.05);
  addShadow(door);
  g.add(door);

  // --- Flat overhanging roof ---
  const roof = new THREE.Mesh(
    new THREE.BoxGeometry(width + 1.0, roofThickness, depth + 1.0),
    new THREE.MeshStandardMaterial({ color: trimColor, roughness: 0.6 })
  );
  roof.position.y = wallHeight + roofThickness / 2;
  roof.userData.collide = true;
  addShadow(roof);
  g.add(roof);

  // --- Window on back wall ---
  const winMat = new THREE.MeshStandardMaterial({ color: windowColor, roughness: 0.3, transparent: true, opacity: 0.7 });
  const win = new THREE.Mesh(new THREE.BoxGeometry(1.5, 1.0, 0.05), winMat);
  win.position.set(0, wallHeight * 0.6, -depth / 2 + 0.12);
  g.add(win);

  // ===== INTERIOR FURNITURE (FireRed layout) =====

  // --- North wall: shelf (top left), two machines (top left corner) ---
  buildLabShelf(g, -width / 2 + 1.5, -depth / 2 + 0.5, 0);
  buildLabMachine(g, -width / 2 + 0.6, -depth / 2 + 0.6, 0);
  buildLabMachine(g, -width / 2 + 1.6, -depth / 2 + 0.6, 0);

  // --- North wall: two more shelves (top right) ---
  buildLabShelf(g, width / 2 - 1.5, -depth / 2 + 0.5, 0);
  buildLabShelf(g, width / 2 - 3.5, -depth / 2 + 0.5, 0);

  // --- Center: desk with PC (left of center) ---
  buildLabDesk(g, -width / 4, -depth / 4, 0);

  // --- Center: table with 3 Pokeballs (right of center) ---
  buildTable(g, width / 4, -depth / 4, 0);
  buildPokeball(g, width / 4 - 0.35, -depth / 4, 0.75);
  buildPokeball(g, width / 4, -depth / 4, 0.75);
  buildPokeball(g, width / 4 + 0.35, -depth / 4, 0.75);

  // --- Entrance: two plants flanking the door ---
  buildLabPlant(g, -doorWidth / 2 - 0.5, depth / 2 - 0.5, 0);
  buildLabPlant(g, doorWidth / 2 + 0.5, depth / 2 - 0.5, 0);

  return g;
}
