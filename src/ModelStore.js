const STORAGE_KEY = "townbuilder.models";
const DEFAULT_MAX_DEPTH = 6;

function readAll() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch (err) {
    console.error("Failed to read models from localStorage:", err);
    return {};
  }
}

function writeAll(models) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(models));
}

function generateId(prefix) {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

/** All saved models, oldest first. */
export function listModels() {
  return Object.values(readAll()).sort((a, b) => a.createdAt - b.createdAt);
}

export function getModel(id) {
  return readAll()[id] || null;
}

/** Creates or overwrites (when `id` is given) a saved model. Returns the saved record. */
export function saveModel({ id, name, parts }) {
  const models = readAll();
  const modelId = id || generateId("m");
  const model = {
    id: modelId,
    name: name || "Untitled",
    createdAt: models[modelId]?.createdAt ?? Date.now(),
    parts,
  };
  models[modelId] = model;
  writeAll(models);
  return model;
}

export function deleteModel(id) {
  const models = readAll();
  delete models[id];
  writeAll(models);
}

/** Triggers a browser download of the model as a .json file. */
export function exportModelToJSON(id) {
  const model = getModel(id);
  if (!model) return;
  const blob = new Blob([JSON.stringify(model, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${model.name.replace(/\s+/g, "_") || "model"}.json`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

/** Parses a model JSON string and saves it under a fresh id (avoids collisions). */
export function importModelFromJSON(jsonString) {
  const parsed = JSON.parse(jsonString);
  if (!parsed || !Array.isArray(parsed.parts)) {
    throw new Error("Invalid model JSON — expected an object with a `parts` array.");
  }
  return saveModel({ name: parsed.name, parts: parsed.parts });
}

/** Composes a child local transform into a parent world transform (Y-axis rotation + uniform scale only). */
function composeTransform(parent, child) {
  const cos = Math.cos(parent.rotationY);
  const sin = Math.sin(parent.rotationY);
  const cx = (child.position?.x ?? 0) * parent.scale;
  const cz = (child.position?.z ?? 0) * parent.scale;
  const rotatedX = cx * cos + cz * sin;
  const rotatedZ = -cx * sin + cz * cos;

  return {
    position: {
      x: parent.position.x + rotatedX,
      y: parent.position.y + (child.position?.y ?? 0) * parent.scale,
      z: parent.position.z + rotatedZ,
    },
    rotationY: parent.rotationY + (child.rotationY ?? 0),
    scale: parent.scale * (child.scale ?? 1),
  };
}

const IDENTITY_TRANSFORM = { position: { x: 0, y: 0, z: 0 }, rotationY: 0, scale: 1 };

/**
 * Recursively flattens a model's `ref` parts into concrete primitive parts,
 * composing transforms, starting from an optional root transform (used when
 * resolving a single placed reference instance rather than a whole model).
 * Throws on a circular or excessively deep reference chain rather than
 * looping forever — callers should catch and degrade gracefully.
 */
export function resolveModelParts(modelId, allModelsById, rootTransform = IDENTITY_TRANSFORM, options = {}) {
  const maxDepth = options.maxDepth ?? DEFAULT_MAX_DEPTH;
  const modelsById = allModelsById || Object.fromEntries(listModels().map((m) => [m.id, m]));

  function resolve(id, transform, visited, depth) {
    if (depth > maxDepth) {
      throw new Error(`Model reference chain too deep (over ${maxDepth} levels) — possible circular reference.`);
    }
    if (visited.has(id)) {
      throw new Error(`Circular model reference detected involving "${modelsById[id]?.name ?? id}".`);
    }
    const model = modelsById[id];
    if (!model) {
      console.warn(`resolveModelParts: model ${id} not found, skipping.`);
      return [];
    }

    const nextVisited = new Set(visited).add(id);
    const resolved = [];

    for (const part of model.parts) {
      const worldTransform = composeTransform(transform, {
        position: part.position,
        rotationY: part.rotationY,
        scale: part.scale,
      });

      if (part.type === "ref") {
        resolved.push(...resolve(part.refModelId, worldTransform, nextVisited, depth + 1));
      } else {
        resolved.push({ ...part, position: worldTransform.position, rotationY: worldTransform.rotationY, scale: worldTransform.scale });
      }
    }
    return resolved;
  }

  return resolve(modelId, rootTransform, new Set(), 0);
}
