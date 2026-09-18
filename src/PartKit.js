import * as THREE from "three";

function withShadow(mesh) {
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  return mesh;
}

/** Box primitive, base sitting at local y=0. */
export function createBoxPart({ size = { w: 1, h: 1, d: 1 }, color = 0xb08968 } = {}) {
  const material = new THREE.MeshStandardMaterial({ color, roughness: 0.85 });
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(size.w, size.h, size.d), material);
  mesh.position.y = size.h / 2;
  return withShadow(mesh);
}

/** Thin/tall box preset — geometrically identical to a box, kept as a distinct tool for clarity. */
export function createWallPart({ size = { w: 2, h: 1.5, d: 0.2 }, color = 0xd9c8a9 } = {}) {
  return createBoxPart({ size, color });
}

/** 4-sided pyramid roof, base sitting at local y=0. */
export function createRoofPart({ size = { w: 2, d: 2, height: 1.2 }, color = 0xb5432b } = {}) {
  const material = new THREE.MeshStandardMaterial({ color, roughness: 0.7 });
  const radius = (Math.hypot(size.w, size.d) / 2) * 1.05;
  const mesh = new THREE.Mesh(new THREE.ConeGeometry(radius, size.height, 4), material);
  mesh.rotation.y = Math.PI / 4;
  mesh.position.y = size.height / 2;
  return withShadow(mesh);
}

/** Cylinder primitive, base sitting at local y=0. */
export function createCylinderPart({ size = { radius: 0.5, height: 1.5 }, color = 0x9c8b6e } = {}) {
  const material = new THREE.MeshStandardMaterial({ color, roughness: 0.85 });
  const mesh = new THREE.Mesh(
    new THREE.CylinderGeometry(size.radius, size.radius, size.height, 12),
    material
  );
  mesh.position.y = size.height / 2;
  return withShadow(mesh);
}

const BUILDERS = {
  box: createBoxPart,
  wall: createWallPart,
  roof: createRoofPart,
  cylinder: createCylinderPart,
};

/**
 * Builds a mesh for one resolved (non-"ref") part record, applying its
 * position/rotationY/scale. The single entry point reused by the editor and
 * by the game-side ModelLoader. Does NOT tag userData — callers decide how
 * placed instances are identified/grouped.
 */
export function buildPartMesh(part) {
  const builder = BUILDERS[part.type];
  if (!builder) {
    throw new Error(`Unknown part type: ${part.type}`);
  }
  const mesh = builder({ size: part.size, color: part.color });
  mesh.position.x += part.position?.x ?? 0;
  mesh.position.y += part.position?.y ?? 0;
  mesh.position.z += part.position?.z ?? 0;
  mesh.rotation.y += part.rotationY ?? 0;
  const scale = part.scale ?? 1;
  if (scale !== 1) mesh.scale.multiplyScalar(scale);
  return mesh;
}
