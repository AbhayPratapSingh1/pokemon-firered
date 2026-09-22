/**
 * Example: Recursive Space + Teleporter system usage.
 *
 * Structure:
 *   World (no exterior, interior = ground + houses)
 *   ├── AshHouse (exterior: walls/roof, interior: furniture)
 *   │   ├── TV (exterior: box, interior: animation) [action]
 *   │   └── Computer (exterior: monitor, interior: UI) [action]
 *   └── GaryHouse (exterior: walls/roof, interior: furniture)
 *
 * Entry types:
 * - trigger: auto on collision (door teleporter)
 * - action: manual on key press (TV, computer)
 */

import * as THREE from "three";
import { Space, SpaceManager, Teleporter } from "./engine/index.js";

// --- Build Spaces ---

function createWorldSpace() {
  const world = new Space({ name: "world" });

  // Ground
  const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(200, 200),
    new THREE.MeshStandardMaterial({ color: 0x3a7d44 })
  );
  ground.rotation.x = -Math.PI / 2;
  world.exterior.push(ground);

  return world;
}

function createHouseSpace(name, position, wallColor, roofColor) {
  const house = new Space({ name });

  // Exterior: walls + roof
  const walls = new THREE.Mesh(
    new THREE.BoxGeometry(6, 3, 6),
    new THREE.MeshStandardMaterial({ color: wallColor })
  );
  walls.position.y = 1.5;
  walls.position.copy(position);
  house.exterior.push(walls);

  const roof = new THREE.Mesh(
    new THREE.ConeGeometry(4.5, 2.2, 4),
    new THREE.MeshStandardMaterial({ color: roofColor })
  );
  roof.rotation.y = Math.PI / 4;
  roof.position.y = 4.1;
  roof.position.copy(position);
  house.exterior.push(roof);

  // Interior: furniture
  const bed = new THREE.Mesh(
    new THREE.BoxGeometry(1.5, 0.5, 2),
    new THREE.MeshStandardMaterial({ color: 0x8b4513 })
  );
  bed.position.set(-2, 0.25, -2);
  house.interior.push(bed);

  return house;
}

function createTVSpace() {
  const tv = new Space({ name: "tv" });

  // Exterior: TV box
  const tvBox = new THREE.Mesh(
    new THREE.BoxGeometry(1.2, 0.8, 0.1),
    new THREE.MeshStandardMaterial({ color: 0x222222 })
  );
  tvBox.position.set(0, 1.5, -2.9);
  tv.exterior.push(tvBox);

  // Interior: screen animation (simplified)
  const screen = new THREE.Mesh(
    new THREE.PlaneGeometry(1.1, 0.7),
    new THREE.MeshBasicMaterial({ color: 0x00ff00 })
  );
  screen.position.set(0, 1.5, 0);
  tv.interior.push(screen);

  return tv;
}

// --- Usage Example ---

export function setupGame(scene) {
  // Create spaces
  const world = createWorldSpace();
  const ashHouse = createHouseSpace("ashHouse", new THREE.Vector3(-14, 0, -14), 0xead9b0, 0xb5432b);
  const tv = createTVSpace();

  // Build hierarchy
  world.addChild(ashHouse);
  ashHouse.addChild(tv);

  // Create manager
  const sm = new SpaceManager(scene);
  sm.load(world);

  // Create teleporters
  const doorTeleporter = new Teleporter({
    type: "trigger",
    target: ashHouse,
    position: new THREE.Vector3(-14, 0, -11),
    orientation: Math.PI,
    radius: 1.5,
    exitPosition: new THREE.Vector3(-14, 0, -11),
    exitOrientation: 0,
  });

  const tvAction = new Teleporter({
    type: "action",
    target: tv,
    position: new THREE.Vector3(-14, 1.5, -16.9),
    orientation: 0,
    radius: 2.0,
    key: "e",
    exitPosition: new THREE.Vector3(-14, 0, -16),
    exitOrientation: Math.PI,
  });

  return { world, ashHouse, tv, sm, doorTeleporter, tvAction };
}

// --- Game Loop Integration ---

export function handleTeleport(sm, player, teleporter) {
  // Clear current space
  sm.clear();

  // Load target space
  sm.teleport(teleporter.target, teleporter);

  // Place player
  player.position.copy(teleporter.position);
  player.rotation.y = teleporter.orientation;
  player.velocity.set(0, 0, 0);
}
