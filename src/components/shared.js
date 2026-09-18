import * as THREE from "three";

// --- Color palette ---------------------------------------------------------
export const COLORS = {
  floor: 0xe8d3a0,
  wall: 0xf5ecd7,
  ceiling: 0xd8c9a3,
  wood: 0x8a5a34,
  darkWood: 0x6b4423,
  stairWood: 0x9c8b6e,
  tvBody: 0x2b2b2b,
  tvScreen: 0x1a3d5c,
  sinkBody: 0xe6e6e6,
  sinkBasin: 0xbfc4c7,
  leafGreen: 0x3f7d43,
  potBrown: 0x8a5a34,
  bedFrame: 0x6b4423,
  blanket: 0xd62828,
  pillow: 0xffffff,
  pcBody: 0xe4ddc9,
  pcScreen: 0xd62828,
  doorFrame: 0x3d2b1f,
};

// --- Shared utilities ------------------------------------------------------

export function addShadow(mesh) {
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  return mesh;
}

export function makeBox(w, h, d, color, { collide = false, roughness = 0.85 } = {}) {
  const material = new THREE.MeshStandardMaterial({ color, roughness });
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), material);
  mesh.userData.collide = collide;
  return addShadow(mesh);
}

export function at(mesh, x, y, z) {
  mesh.position.set(x, y, z);
  return mesh;
}
