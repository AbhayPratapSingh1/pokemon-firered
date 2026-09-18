import * as THREE from "three";
import { buildPartMesh } from "./PartKit.js";
import { resolveModelParts, listModels } from "./ModelStore.js";

/**
 * Turns a saved model (built in editor.html) into a real in-game THREE.Group
 * plus its collision box, in the same `{ mesh, box }` shape World.js already
 * uses for hand-built buildings. `ref` parts (models built from other saved
 * models) are resolved recursively via ModelStore.resolveModelParts.
 */
export function buildModelGroup(model, allModels, { position = new THREE.Vector3(), rotationY = 0 } = {}) {
  const modelsById = allModels
    ? Object.fromEntries(allModels.map((m) => [m.id, m]))
    : Object.fromEntries(listModels().map((m) => [m.id, m]));

  const group = new THREE.Group();

  let parts = [];
  try {
    parts = resolveModelParts(model.id, modelsById);
  } catch (err) {
    console.error(`Failed to resolve model "${model.name}":`, err);
  }

  for (const part of parts) {
    group.add(buildPartMesh(part));
  }

  group.position.copy(position);
  group.rotation.y = rotationY;

  const box = new THREE.Box3().setFromObject(group);
  return { group, box };
}
