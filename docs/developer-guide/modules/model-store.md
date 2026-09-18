# ModelStore Module

**File:** `src/ModelStore.js` (142 lines)

## Purpose

localStorage CRUD operations for saved models, plus model reference resolution.

## Public Interface

```javascript
listModels()                          // All models sorted by createdAt
getModel(id)                          // Single model by ID
saveModel({ id, name, parts })        // Create or update
deleteModel(id)                       // Remove
exportModelToJSON(id)                 // Trigger browser download
importModelFromJSON(jsonString)       // Parse and save
resolveModelParts(modelId, allModelsById, rootTransform, options)
                                      // Flatten ref parts into primitives
```

## Storage

- **Key:** `townbuilder.models`
- **Format:** `{ [modelId]: { id, name, createdAt, parts: [...] } }`

## Model Structure

```javascript
{
  id: "m_1abc_xyz",
  name: "My Model",
  createdAt: 1695000000000,
  parts: [
    {
      id: "p_1abc_xyz",
      type: "box",       // or "wall", "roof", "cylinder", "ref"
      position: { x: 0, y: 0, z: 0 },
      rotationY: 0,
      scale: 1,
      size: { w: 1, h: 1, d: 1 },
      color: 11577800
    },
    {
      id: "p_2def_abc",
      type: "ref",
      refModelId: "m_1abc_xyz",  // References another model
      position: { x: 2, y: 0, z: 0 },
      rotationY: 0,
      scale: 1
    }
  ]
}
```

## Reference Resolution

```javascript
resolveModelParts(modelId, allModelsById, rootTransform, options)
  // Recursively flattens "ref" parts into concrete primitives
  // Composes transforms (parent × child)
  // Detects circular references (throws)
  // Enforces max depth limit (default: 6)
```

## Transform Composition

```javascript
composeTransform(parent, child)
  // Rotates child position by parent.rotationY
  // Scales by parent.scale
  // Returns { position, rotationY, scale }
```
