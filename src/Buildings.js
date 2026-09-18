import * as THREE from "three";

function addShadow(mesh) {
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  return mesh;
}

/**
 * A small square house: box walls, a 4-sided pyramid roof, a door, and two
 * window accents on the front face. Purely original/generic geometry.
 */
export function createHouse({
  position,
  rotationY = 0,
  width = 6,
  depth = 6,
  wallHeight = 3,
  roofHeight = 2.2,
  wallColor = 0xead9b0,
  roofColor = 0xb5432b,
  doorColor = 0x3d2b1f,
}) {
  const group = new THREE.Group();
  group.position.copy(position);
  group.rotation.y = rotationY;

  const wallMaterial = new THREE.MeshStandardMaterial({ color: wallColor, roughness: 0.9 });
  const walls = new THREE.Mesh(new THREE.BoxGeometry(width, wallHeight, depth), wallMaterial);
  walls.position.y = wallHeight / 2;
  group.add(addShadow(walls));

  const roofMaterial = new THREE.MeshStandardMaterial({ color: roofColor, roughness: 0.7 });
  const roofRadius = (Math.hypot(width, depth) / 2) * 1.05;
  const roof = new THREE.Mesh(new THREE.ConeGeometry(roofRadius, roofHeight, 4), roofMaterial);
  roof.rotation.y = Math.PI / 4;
  roof.position.y = wallHeight + roofHeight / 2;
  group.add(addShadow(roof));

  const doorMaterial = new THREE.MeshStandardMaterial({ color: doorColor, roughness: 0.8 });
  const door = new THREE.Mesh(new THREE.BoxGeometry(1.1, 1.8, 0.15), doorMaterial);
  door.position.set(0, 0.9, depth / 2 + 0.08);
  group.add(addShadow(door));

  const windowMaterial = new THREE.MeshStandardMaterial({ color: 0xa9d6e5, roughness: 0.4 });
  for (const dx of [-1.7, 1.7]) {
    const win = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.8, 0.1), windowMaterial);
    win.position.set(dx, 1.7, depth / 2 + 0.06);
    group.add(addShadow(win));
  }

  return group;
}

/**
 * A larger rectangular "research lab" style building: light walls, a flat
 * overhanging roof in a trim color, a wide door, and a row of windows.
 */
export function createLab({
  position,
  rotationY = 0,
  width = 12,
  depth = 8,
  wallHeight = 3.5,
  wallColor = 0xf1f1f1,
  trimColor = 0xd62828,
}) {
  const group = new THREE.Group();
  group.position.copy(position);
  group.rotation.y = rotationY;

  const wallMaterial = new THREE.MeshStandardMaterial({ color: wallColor, roughness: 0.85 });
  const walls = new THREE.Mesh(new THREE.BoxGeometry(width, wallHeight, depth), wallMaterial);
  walls.position.y = wallHeight / 2;
  group.add(addShadow(walls));

  const roofMaterial = new THREE.MeshStandardMaterial({ color: trimColor, roughness: 0.6 });
  const roof = new THREE.Mesh(new THREE.BoxGeometry(width + 0.6, 0.4, depth + 0.6), roofMaterial);
  roof.position.y = wallHeight + 0.2;
  group.add(addShadow(roof));

  const doorMaterial = new THREE.MeshStandardMaterial({ color: 0x2b2b2b, roughness: 0.8 });
  const door = new THREE.Mesh(new THREE.BoxGeometry(1.6, 2.2, 0.15), doorMaterial);
  door.position.set(0, 1.1, depth / 2 + 0.08);
  group.add(addShadow(door));

  const windowMaterial = new THREE.MeshStandardMaterial({ color: 0xa9d6e5, roughness: 0.4 });
  for (const dx of [-4, 0, 4]) {
    const win = new THREE.Mesh(new THREE.BoxGeometry(1.1, 1, 0.1), windowMaterial);
    win.position.set(dx, 2.1, depth / 2 + 0.06);
    group.add(addShadow(win));
  }

  return group;
}

/** Cylinder trunk + cone canopy, cheap scenery for town edges/paths. */
export function createTree({ position }) {
  const group = new THREE.Group();
  group.position.copy(position);

  const trunkMaterial = new THREE.MeshStandardMaterial({ color: 0x6b4423, roughness: 0.9 });
  const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.2, 1.2, 6), trunkMaterial);
  trunk.position.y = 0.6;
  group.add(addShadow(trunk));

  const canopyMaterial = new THREE.MeshStandardMaterial({ color: 0x3f7d43, roughness: 0.8 });
  const canopy = new THREE.Mesh(new THREE.ConeGeometry(0.9, 1.8, 8), canopyMaterial);
  canopy.position.y = 1.2 + 0.9;
  group.add(addShadow(canopy));

  return group;
}

/** A thin low fence segment. */
export function createFenceSegment({ position, length = 3, rotationY = 0 }) {
  const material = new THREE.MeshStandardMaterial({ color: 0x9c8b6e, roughness: 0.9 });
  const fence = new THREE.Mesh(new THREE.BoxGeometry(length, 0.6, 0.1), material);
  fence.position.copy(position);
  fence.position.y = 0.3;
  fence.rotation.y = rotationY;
  return addShadow(fence);
}

/** A small post + plaque, decorative only. */
export function createSignpost({ position, rotationY = 0 }) {
  const group = new THREE.Group();
  group.position.copy(position);
  group.rotation.y = rotationY;

  const postMaterial = new THREE.MeshStandardMaterial({ color: 0x6b4423, roughness: 0.9 });
  const post = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 1.2, 6), postMaterial);
  post.position.y = 0.6;
  group.add(addShadow(post));

  const plaqueMaterial = new THREE.MeshStandardMaterial({ color: 0xdec9a3, roughness: 0.8 });
  const plaque = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.4, 0.08), plaqueMaterial);
  plaque.position.set(0, 1.05, 0.05);
  group.add(addShadow(plaque));

  return group;
}
