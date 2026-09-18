import * as ModelStore from "./ModelStore.js";
import { addPartToScene } from "./EditorPlacement.js";

const TOOL_DEFS = [
  { type: "box", label: "Box", defaultSize: { w: 1, h: 1, d: 1 }, sizeFields: ["w", "h", "d"], defaultColor: "#b08968" },
  { type: "wall", label: "Wall", defaultSize: { w: 2, h: 1.5, d: 0.2 }, sizeFields: ["w", "h", "d"], defaultColor: "#d9c8a9" },
  { type: "roof", label: "Roof", defaultSize: { w: 2, d: 2, height: 1.2 }, sizeFields: ["w", "d", "height"], defaultColor: "#b5432b" },
  { type: "cylinder", label: "Cylinder", defaultSize: { radius: 0.5, height: 1.5 }, sizeFields: ["radius", "height"], defaultColor: "#9c8b6e" },
];

function hexToInt(hex) {
  return parseInt(hex.replace("#", ""), 16);
}

function clearCanvas(state) {
  while (state.partsGroup.children.length) {
    state.partsGroup.remove(state.partsGroup.children[0]);
  }
  state.parts = [];
  state.editingModelId = null;
  state.onDeselect?.();
}

function loadModelIntoCanvas(state, model) {
  clearCanvas(state);
  for (const part of model.parts) {
    state.parts.push(part);
    addPartToScene(state, part);
  }
  state.editingModelId = model.id;
}

function renderToolList(state) {
  const container = document.getElementById("tool-list");
  container.innerHTML = "";

  const clearArmedHighlight = () => {
    container.querySelectorAll(".tool-card.armed").forEach((el) => el.classList.remove("armed"));
  };

  for (const def of TOOL_DEFS) {
    const card = document.createElement("div");
    card.className = "tool-card";

    const title = document.createElement("div");
    title.className = "tool-card-title";
    title.textContent = def.label;
    card.appendChild(title);

    const sizeInputs = {};
    const sizeRow = document.createElement("div");
    sizeRow.className = "tool-size-row";
    for (const field of def.sizeFields) {
      const input = document.createElement("input");
      input.type = "number";
      input.min = "0.1";
      input.step = "0.1";
      input.value = String(def.defaultSize[field]);
      input.title = field;
      sizeInputs[field] = input;
      sizeRow.appendChild(input);
    }
    card.appendChild(sizeRow);

    const colorInput = document.createElement("input");
    colorInput.type = "color";
    colorInput.value = def.defaultColor;
    card.appendChild(colorInput);

    const armBtn = document.createElement("button");
    armBtn.type = "button";
    armBtn.textContent = "Place";
    armBtn.addEventListener("click", () => {
      const wasArmed = state.armedTool?.kind === "primitive" && state.armedTool.type === def.type;
      clearArmedHighlight();
      if (wasArmed) {
        state.armedTool = null;
        return;
      }
      const size = {};
      for (const field of def.sizeFields) size[field] = parseFloat(sizeInputs[field].value) || 0.1;
      state.armedTool = { kind: "primitive", type: def.type, size, color: hexToInt(colorInput.value) };
      card.classList.add("armed");
    });
    card.appendChild(armBtn);

    container.appendChild(card);
  }
}

function renderSavedModelsList(state) {
  const container = document.getElementById("saved-models-list");
  container.innerHTML = "";
  const models = ModelStore.listModels();

  if (models.length === 0) {
    const empty = document.createElement("div");
    empty.className = "empty-hint";
    empty.textContent = "No saved models yet.";
    container.appendChild(empty);
    return;
  }

  for (const model of models) {
    const card = document.createElement("div");
    card.className = "model-card";

    const name = document.createElement("span");
    name.textContent = `${model.name} (${model.parts.length})`;
    card.appendChild(name);

    const actions = document.createElement("div");
    actions.className = "model-card-actions";

    const placeBtn = document.createElement("button");
    placeBtn.type = "button";
    placeBtn.textContent = "Place";
    placeBtn.addEventListener("click", () => {
      state.armedTool = { kind: "ref", refModelId: model.id };
    });
    actions.appendChild(placeBtn);

    const loadBtn = document.createElement("button");
    loadBtn.type = "button";
    loadBtn.textContent = "Load";
    loadBtn.addEventListener("click", () => {
      if (state.parts.length > 0 && !confirm("Clear the current canvas and load this model for editing?")) return;
      loadModelIntoCanvas(state, model);
    });
    actions.appendChild(loadBtn);

    const exportBtn = document.createElement("button");
    exportBtn.type = "button";
    exportBtn.textContent = "Export";
    exportBtn.addEventListener("click", () => ModelStore.exportModelToJSON(model.id));
    actions.appendChild(exportBtn);

    const deleteBtn = document.createElement("button");
    deleteBtn.type = "button";
    deleteBtn.textContent = "Delete";
    deleteBtn.addEventListener("click", () => {
      if (!confirm(`Delete "${model.name}"? This can't be undone.`)) return;
      ModelStore.deleteModel(model.id);
      if (state.editingModelId === model.id) state.editingModelId = null;
      renderSavedModelsList(state);
    });
    actions.appendChild(deleteBtn);

    card.appendChild(actions);
    container.appendChild(card);
  }
}

function wireToolbar(state) {
  document.getElementById("btn-new").addEventListener("click", () => {
    if (state.parts.length > 0 && !confirm("Clear the current canvas and start a new model?")) return;
    clearCanvas(state);
  });

  document.getElementById("btn-save").addEventListener("click", () => {
    if (state.parts.length === 0) {
      alert("Nothing to save yet — place at least one part first.");
      return;
    }
    const existingName = state.editingModelId ? ModelStore.getModel(state.editingModelId)?.name : "";
    const name = prompt("Model name:", existingName || "");
    if (!name) return;

    try {
      const models = ModelStore.listModels();
      const candidateId = state.editingModelId || "candidate";
      const modelsById = Object.fromEntries(models.map((m) => [m.id, m]));
      modelsById[candidateId] = { id: candidateId, name, parts: state.parts };
      ModelStore.resolveModelParts(candidateId, modelsById);
    } catch (err) {
      alert(`Can't save: ${err.message}`);
      return;
    }

    const saved = ModelStore.saveModel({ id: state.editingModelId, name, parts: state.parts });
    state.editingModelId = saved.id;
    renderSavedModelsList(state);
    alert(`Saved "${saved.name}".`);
  });

  document.getElementById("btn-export").addEventListener("click", () => {
    if (!state.editingModelId) {
      alert("Save the model first, then export it.");
      return;
    }
    ModelStore.exportModelToJSON(state.editingModelId);
  });

  const importInput = document.getElementById("import-file");
  importInput.addEventListener("change", async () => {
    const file = importInput.files[0];
    if (!file) return;
    try {
      const text = await file.text();
      ModelStore.importModelFromJSON(text);
      renderSavedModelsList(state);
      alert("Model imported.");
    } catch (err) {
      alert(`Import failed: ${err.message}`);
    }
    importInput.value = "";
  });
}

export function initPalette(state) {
  renderToolList(state);
  renderSavedModelsList(state);
  wireToolbar(state);
}

export function refreshSavedModelsList(state) {
  renderSavedModelsList(state);
}
