# Model Save/Load Flow

## Save Flow

```
User clicks "Save As Model" button
    │
    ▼
EditorPalette.js:160
    │
    ├── No parts? → alert("Nothing to save yet")
    │
    ├── Get existing name (if editing)
    │
    ├── Prompt for model name
    │
    ├── Validate: resolveModelParts(candidateId, modelsById)
    │   ├── Circular reference? → alert error, abort
    │   ├── Depth exceeded? → alert error, abort
    │   └── Valid → continue
    │
    ├── ModelStore.saveModel({ id, name, parts })
    │   ├── Generate ID if new: "m_" + timestamp + random
    │   ├── Set createdAt (preserve if updating)
    │   ├── Write to localStorage["townbuilder.models"]
    │   └── Return saved model record
    │
    ├── state.editingModelId = saved.id
    │
    └── renderSavedModelsList(state) → update sidebar
```

## Load Flow

```
User clicks "Load" on a saved model card
    │
    ▼
EditorPalette.js:126
    │
    ├── Confirm if canvas has parts
    │
    ├── clearCanvas(state)
    │   ├── Remove all children from partsGroup
    │   ├── Reset state.parts = []
    │   └── Reset state.editingModelId = null
    │
    ├── loadModelIntoCanvas(state, model)
    │   ├── For each part in model.parts:
    │   │   ├── state.parts.push(part)
    │   │   └── addPartToScene(state, part)
    │   └── state.editingModelId = model.id
    │
    └── Canvas shows loaded model
```

## Export Flow

```
User clicks "Export" button
    │
    ▼
EditorPalette.js:186
    │
    ├── No editingModelId? → alert("Save first")
    │
    └── ModelStore.exportModelToJSON(id)
        ├── getModel(id) → model record
        ├── JSON.stringify(model, null, 2)
        ├── Create Blob + object URL
        ├── Create <a> element, click, remove
        └── Browser downloads .json file
```

## Import Flow

```
User selects .json file via import input
    │
    ▼
EditorPalette.js:195
    │
    ├── Read file as text
    ├── ModelStore.importModelFromJSON(text)
    │   ├── JSON.parse(text)
    │   ├── Validate parts array exists
    │   └── saveModel({ name, parts }) → new model
    │
    ├── renderSavedModelsList(state)
    └── alert("Model imported")
```

## Implementation

- Save UI: `src/EditorPalette.js:160-184`
- Load UI: `src/EditorPalette.js:126-131`
- Export UI: `src/EditorPalette.js:186-192`
- Import UI: `src/EditorPalette.js:194-207`
- Storage: `src/ModelStore.js:32-44`
- Export: `src/ModelStore.js:53-65`
- Import: `src/ModelStore.js:68-74`
