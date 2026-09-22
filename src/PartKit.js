import * as THREE from "three";
import { HOUSE_PART_BUILDERS } from "./HousePartBuilder.js";
import { addShadow } from "./components/shared.js";

/** Box primitive, base sitting at local y=0. */
export function createBoxPart({ size = { w: 1, h: 1, d: 1 }, color = 0xb08968 } = {}) {
  const material = new THREE.MeshStandardMaterial({ color, roughness: 0.85 });
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(size.w, size.h, size.d), material);
  mesh.position.y = size.h / 2;
  return addShadow(mesh);
}

/** Thin/tall box preset. */
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
  return addShadow(mesh);
}

/** Cylinder primitive, base sitting at local y=0. */
export function createCylinderPart({ size = { radius: 0.5, height: 1.5 }, color = 0x9c8b6e } = {}) {
  const material = new THREE.MeshStandardMaterial({ color, roughness: 0.85 });
  const mesh = new THREE.Mesh(
    new THREE.CylinderGeometry(size.radius, size.radius, size.height, 12),
    material
  );
  mesh.position.y = size.height / 2;
  return addShadow(mesh);
}

/** Primitive part builders (placed via the old palette). */
const PRIMITIVE_BUILDERS = {
  box: createBoxPart,
  wall: createWallPart,
  roof: createRoofPart,
  cylinder: createCylinderPart,
};

/**
 * Builds a mesh (or group) for one resolved part record, applying its
 * position/rotationY/scale. Supports both primitive types and house
 * furniture types (house_tv, house_bed, etc.).
 */
export function buildPartMesh(part) {
  // House furniture parts return a THREE.Group
  const houseBuilder = HOUSE_PART_BUILDERS[part.type];
  if (houseBuilder) {
    const group = houseBuilder();
    group.position.x += part.position?.x ?? 0;
    group.position.y += part.position?.y ?? 0;
    group.position.z += part.position?.z ?? 0;
    group.rotation.y += part.rotationY ?? 0;
    const scale = part.scale ?? 1;
    if (scale !== 1) group.scale.multiplyScalar(scale);
    return group;
  }

  // Primitive parts return a single mesh
  const builder = PRIMITIVE_BUILDERS[part.type];
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
