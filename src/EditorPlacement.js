import * as THREE from "three";
import { buildPartMesh } from "./PartKit.js";
import { resolveModelParts, listModels } from "./ModelStore.js";

const GRID_SNAP = 0.5;
const CLICK_DRAG_THRESHOLD = 5; // px — beyond this, treat as an orbit drag, not a click

function snap(value) {
  return Math.round(value / GRID_SNAP) * GRID_SNAP;
}

function findPartIdFromObject(object) {
  let obj = object;
  while (obj) {
    if (obj.userData?.partId) return obj.userData.partId;
    obj = obj.parent;
  }
  return null;
}

function getTopY(object) {
  let obj = object;
  while (obj && !obj.userData?.partId) obj = obj.parent;
  if (!obj) return 0;
  return new THREE.Box3().setFromObject(obj).max.y;
}

/**
 * Builds the live scene representation of a part record and adds it to
 * state.partsGroup. Primitive parts become one tagged mesh; "ref" parts are
 * resolved into their constituent primitives and grouped under one wrapper
 * tagged with the ref part's id, so the whole placed instance moves/selects/
 * deletes as a unit while the underlying data stays a compact reference.
 */
export function addPartToScene(state, part) {
  if (part.type === "ref") {
    const modelsById = Object.fromEntries(listModels().map((m) => [m.id, m]));
    const wrapper = new THREE.Group();
    try {
      const resolvedParts = resolveModelParts(part.refModelId, modelsById, {
        position: part.position,
        rotationY: part.rotationY,
        scale: part.scale,
      });
      for (const resolvedPart of resolvedParts) {
        wrapper.add(buildPartMesh(resolvedPart));
      }
    } catch (err) {
      console.error("Failed to resolve reference part:", err);
    }
    wrapper.userData.partId = part.id;
    state.partsGroup.add(wrapper);
  } else {
    const mesh = buildPartMesh(part);
    mesh.userData.partId = part.id;
    state.partsGroup.add(mesh);
  }
}

function placePart(state, hit) {
  const isGround = hit.object === state.groundMesh;
  const x = snap(hit.point.x);
  const z = snap(hit.point.z);
  const y = isGround ? 0 : getTopY(hit.object);

  const id = `p_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`;
  const base = { id, position: { x, y, z }, rotationY: 0, scale: 1 };

  const part =
    state.armedTool.kind === "ref"
      ? { ...base, type: "ref", refModelId: state.armedTool.refModelId }
      : { ...base, type: state.armedTool.type, size: { ...state.armedTool.size }, color: state.armedTool.color };

  state.parts.push(part);
  addPartToScene(state, part);
}

export function initPlacement(state) {
  const raycaster = new THREE.Raycaster();
  const pointer = new THREE.Vector2();
  const dom = state.renderer.domElement;
  let downPos = null;

  dom.addEventListener("pointerdown", (event) => {
    downPos = { x: event.clientX, y: event.clientY };
  });

  dom.addEventListener("pointerup", (event) => {
    if (!downPos) return;
    const dist = Math.hypot(event.clientX - downPos.x, event.clientY - downPos.y);
    downPos = null;
    if (dist > CLICK_DRAG_THRESHOLD) return; // was an orbit drag, not a click

    const rect = dom.getBoundingClientRect();
    pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    raycaster.setFromCamera(pointer, state.camera);

    const hits = raycaster.intersectObjects([state.groundMesh, ...state.partsGroup.children], true);
    if (hits.length === 0) {
      if (!state.armedTool) state.onDeselect?.();
      return;
    }

    const hit = hits[0];
    if (state.armedTool) {
      placePart(state, hit);
    } else {
      const partId = findPartIdFromObject(hit.object);
      if (partId) state.onSelectPart?.(partId);
      else state.onDeselect?.();
    }
  });
}
