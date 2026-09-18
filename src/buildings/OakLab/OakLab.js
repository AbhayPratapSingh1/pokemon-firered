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
 * Oak's Lab — exact FireRed layout:
 *
 *   [SHELF]                                           <- north wall center
 *   [MACHINE-TL]                          [MACHINE-TR] <- north corners
 *              [PC DESK] [CHAIR]  [TABLE+BALLS]       <- center
 *   [SHELF-L]   [PLANT]        [PLANT]   [SHELF-R]   <- south wall
 *                    [DOORWAY]                         <- south center
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
    windowColor, roofThickness,
  } = config;

  // ===== SHELL =====

  // Floor
  const floorMat = new THREE.MeshStandardMaterial({ color: 0xd7ccc8, roughness: 0.9 });
  const floor = new THREE.Mesh(new THREE.BoxGeometry(width, 0.1, depth), floorMat);
  floor.position.y = 0.05;
  floor.receiveShadow = true;
  g.add(floor);

  // Wall material
  const wallMat = new THREE.MeshStandardMaterial({ color: wallColor, roughness: 0.85 });

  // North wall
  const backWall = new THREE.Mesh(new THREE.BoxGeometry(width, wallHeight, 0.2), wallMat);
  backWall.position.set(0, wallHeight / 2, -depth / 2);
  addShadow(backWall);
  g.add(backWall);

  // West wall
  const leftWall = new THREE.Mesh(new THREE.BoxGeometry(0.2, wallHeight, depth), wallMat);
  leftWall.position.set(-width / 2, wallHeight / 2, 0);
  addShadow(leftWall);
  g.add(leftWall);

  // East wall
  const rightWall = new THREE.Mesh(new THREE.BoxGeometry(0.2, wallHeight, depth), wallMat);
  rightWall.position.set(width / 2, wallHeight / 2, 0);
  addShadow(rightWall);
  g.add(rightWall);

  // South wall — two pillars with doorway gap
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

  // Roof
  const roof = new THREE.Mesh(
    new THREE.BoxGeometry(width + 1.0, roofThickness, depth + 1.0),
    new THREE.MeshStandardMaterial({ color: trimColor, roughness: 0.6 })
  );
  roof.position.y = wallHeight + roofThickness / 2;
  roof.userData.collide = true;
  addShadow(roof);
  g.add(roof);

  // Window on back wall
  const winMat = new THREE.MeshStandardMaterial({ color: windowColor, roughness: 0.3, transparent: true, opacity: 0.7 });
  const win = new THREE.Mesh(new THREE.BoxGeometry(1.5, 1.0, 0.05), winMat);
  win.position.set(0, wallHeight * 0.6, -depth / 2 + 0.12);
  g.add(win);

  // ===== INTERIOR =====

  // --- NORTH WALL: shelf (center), machines (top-left, top-right) ---
  buildLabShelf(g, 0, -depth / 2 + 0.5, 0);
  buildLabMachine(g, -width / 2 + 0.7, -depth / 2 + 0.7, 0);
  buildLabMachine(g, width / 2 - 0.7, -depth / 2 + 0.7, 0);

  // --- CENTER: PC desk + chair (left-center), table + pokeballs (right-center) ---
  buildLabDesk(g, -width / 4 - 0.5, -depth / 6, 0);

  // Chair (simple box)
  const chairMat = new THREE.MeshStandardMaterial({ color: 0xc62828, roughness: 0.8 });
  const chairSeat = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.05, 0.4), chairMat);
  chairSeat.position.set(-width / 4 - 0.5, 0.45, -depth / 6 + 0.6);
  addShadow(chairSeat);
  g.add(chairSeat);
  const chairBack = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.4, 0.05), chairMat);
  chairBack.position.set(-width / 4 - 0.5, 0.65, -depth / 6 + 0.8);
  addShadow(chairBack);
  g.add(chairBack);

  // Table with 3 Pokeballs
  buildTable(g, width / 4 + 0.5, -depth / 6, 0);
  buildPokeball(g, width / 4 + 0.15, -depth / 6, 0.75);
  buildPokeball(g, width / 4 + 0.5, -depth / 6, 0.75);
  buildPokeball(g, width / 4 + 0.85, -depth / 6, 0.75);

  // --- SOUTH WALL: shelf-left, shelf-right, plants flanking door ---
  buildLabShelf(g, -width / 2 + 1.0, depth / 2 - 0.5, 0);
  buildLabShelf(g, width / 2 - 1.0, depth / 2 - 0.5, 0);
  buildLabPlant(g, -doorWidth / 2 - 0.3, depth / 2 - 0.6, 0);
  buildLabPlant(g, doorWidth / 2 + 0.3, depth / 2 - 0.6, 0);

  return g;
}
