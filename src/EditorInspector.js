import * as THREE from "three";
import { addPartToScene } from "./EditorPlacement.js";

const HIGHLIGHT_COLOR = 0xffe066;
const POSITION_STEP = 0.5;
const ROTATE_STEP_DEG = 15;
const SCALE_STEP = 0.1;
const SIZE_STEP = 0.1;
const MIN_SIZE = 0.1;
const MIN_SCALE = 0.05;

const SIZE_FIELDS = {
  box: [["w", "Width"], ["h", "Height"], ["d", "Depth"]],
  wall: [["w", "Width"], ["h", "Height"], ["d", "Depth"]],
  roof: [["w", "Width"], ["d", "Depth"], ["height", "Height"]],
  cylinder: [["radius", "Radius"], ["height", "Height"]],
};

function hexToInt(hex) {
  return parseInt(hex.replace("#", ""), 16);
}

function intToHex(color) {
  return `#${(color ?? 0xffffff).toString(16).padStart(6, "0")}`;
}

function findObjectByPartId(group, partId) {
  for (const child of group.children) {
    if (child.userData.partId === partId) return child;
  }
  return null;
}

export function initInspector(state) {
  const panel = document.getElementById("editor-inspector");
  const body = document.getElementById("inspector-body");
  const deleteBtn = document.getElementById("btn-delete-part");

  let highlightHelper = null;

  function clearHighlight() {
    if (highlightHelper) {
      state.scene.remove(highlightHelper);
      highlightHelper.geometry.dispose();
      highlightHelper.material.dispose();
      highlightHelper = null;
    }
  }

  function showHighlight(partId) {
    clearHighlight();
    const object = findObjectByPartId(state.partsGroup, partId);
    if (!object) return;
    const box = new THREE.Box3().setFromObject(object);
    highlightHelper = new THREE.Box3Helper(box, HIGHLIGHT_COLOR);
    state.scene.add(highlightHelper);
  }

  function rebuildPart(part) {
    const object = findObjectByPartId(state.partsGroup, part.id);
    if (object) state.partsGroup.remove(object);
    addPartToScene(state, part);
    showHighlight(part.id);
  }

  /** A label + numeric input (editable directly, and via -/+ step buttons). */
  function addNumberField({ label, value, step, min, onChange }) {
    const row = document.createElement("div");
    row.className = "field-row";

    const span = document.createElement("span");
    span.textContent = label;
    row.appendChild(span);

    const minus = document.createElement("button");
    minus.type = "button";
    minus.textContent = "-";
    row.appendChild(minus);

    const input = document.createElement("input");
    input.type = "number";
    input.step = String(step);
    if (min !== undefined) input.min = String(min);
    input.value = String(Math.round(value * 100) / 100);
    row.appendChild(input);

    const plus = document.createElement("button");
    plus.type = "button";
    plus.textContent = "+";
    row.appendChild(plus);

    const commit = (nextValue) => {
      const clamped = min !== undefined ? Math.max(min, nextValue) : nextValue;
      input.value = String(Math.round(clamped * 100) / 100);
      onChange(clamped);
    };

    minus.addEventListener("click", () => commit(parseFloat(input.value) - step));
    plus.addEventListener("click", () => commit(parseFloat(input.value) + step));
    input.addEventListener("change", () => commit(parseFloat(input.value) || 0));

    body.appendChild(row);
  }

  function addColorField(part) {
    const row = document.createElement("div");
    row.className = "field-row";
    const span = document.createElement("span");
    span.textContent = "Color";
    row.appendChild(span);

    const input = document.createElement("input");
    input.type = "color";
    input.value = intToHex(part.color);
    input.className = "field-color-input";
    input.addEventListener("change", () => {
      part.color = hexToInt(input.value);
      rebuildPart(part);
    });
    row.appendChild(input);
    body.appendChild(row);
  }

  function renderInspector() {
    if (!state.selectedPartId) {
      panel.classList.add("hidden");
      return;
    }
    const part = state.parts.find((p) => p.id === state.selectedPartId);
    if (!part) {
      panel.classList.add("hidden");
      return;
    }
    panel.classList.remove("hidden");
    body.innerHTML = "";

    const title = document.createElement("div");
    title.className = "inspector-title";
    title.textContent = part.type === "ref" ? "Reference part" : `${part.type} part`;
    body.appendChild(title);

    const sectionLabel = (text) => {
      const el = document.createElement("div");
      el.className = "inspector-section";
      el.textContent = text;
      body.appendChild(el);
    };

    sectionLabel("Move");
    addNumberField({
      label: "X", value: part.position.x, step: POSITION_STEP,
      onChange: (v) => { part.position.x = v; rebuildPart(part); },
    });
    addNumberField({
      label: "Y", value: part.position.y, step: POSITION_STEP, min: 0,
      onChange: (v) => { part.position.y = v; rebuildPart(part); },
    });
    addNumberField({
      label: "Z", value: part.position.z, step: POSITION_STEP,
      onChange: (v) => { part.position.z = v; rebuildPart(part); },
    });
    addNumberField({
      label: "Rotate°", value: THREE.MathUtils.radToDeg(part.rotationY), step: ROTATE_STEP_DEG,
      onChange: (v) => { part.rotationY = THREE.MathUtils.degToRad(v); rebuildPart(part); },
    });

    sectionLabel("Resize");
    addNumberField({
      label: "Scale", value: part.scale ?? 1, step: SCALE_STEP, min: MIN_SCALE,
      onChange: (v) => { part.scale = v; rebuildPart(part); },
    });

    if (part.type !== "ref") {
      for (const [field, label] of SIZE_FIELDS[part.type]) {
        addNumberField({
          label, value: part.size[field], step: SIZE_STEP, min: MIN_SIZE,
          onChange: (v) => { part.size[field] = v; rebuildPart(part); },
        });
      }

      sectionLabel("Appearance");
      addColorField(part);
    }
  }

  state.onSelectPart = (partId) => {
    state.selectedPartId = partId;
    showHighlight(partId);
    renderInspector();
  };

  state.onDeselect = () => {
    state.selectedPartId = null;
    clearHighlight();
    renderInspector();
  };

  deleteBtn.addEventListener("click", () => {
    if (!state.selectedPartId) return;
    const object = findObjectByPartId(state.partsGroup, state.selectedPartId);
    if (object) state.partsGroup.remove(object);
    state.parts = state.parts.filter((p) => p.id !== state.selectedPartId);
    state.onDeselect();
  });

  renderInspector();
}
