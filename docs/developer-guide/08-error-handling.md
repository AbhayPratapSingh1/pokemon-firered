# Error Handling

## Strategy

Minimal error handling — errors are caught, logged to console, and degraded gracefully. No user-facing error boundaries.

## Error Points

| Location | Error | Handling |
|----------|-------|----------|
| `Player.js:109` | GLTF model fails to load | Keep placeholder capsule, show error banner in HUD |
| `World.js:222` | Saved model fails to place in world | `console.error()`, skip placement |
| `ModelStore.js:6` | localStorage read fails | `console.error()`, return empty object |
| `ModelStore.js:111` | Model reference chain too deep | Throw → caught by `ModelLoader.js:22` |
| `ModelStore.js:114` | Circular model reference | Throw → caught by `ModelLoader.js:22` |
| `ModelStore.js:118` | Referenced model not found | `console.warn()`, skip |
| `ModelLoader.js:22` | Model resolution fails | `console.error()`, empty parts array |
| `ModelStore.js:70` | Invalid model JSON on import | Throw → caught by `EditorPalette.js:204` |
| `PartKit.js:59` | Unknown part type | Throw (uncaught) |
| `EditorPalette.js:127` | Load model into canvas | Confirm dialog before clearing |
| `EditorPalette.js:175` | Save model | Validate resolution before saving |

## Error Propagation Flow

```
ModelStore.resolveModelParts()
    │
    ├── Circular reference → throw Error
    ├── Depth exceeded → throw Error
    ├── Model not found → console.warn + skip
    │
    ▼
ModelLoader.buildModelGroup()
    │
    └── catch(err) → console.error + empty parts
    │
    ▼
World.placeDemoSavedModel()
    │
    └── catch(err) → console.error + skip
```

No errors propagate to the user beyond the console and the optional model-load error banner in play mode.
