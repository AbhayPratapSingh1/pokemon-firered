# EditorPalette Module

**File:** `src/EditorPalette.js` (218 lines)

## Purpose

Tool selection UI and saved model list management for the editor.

## Responsibilities

- Render tool cards (Box, Wall, Roof, Cylinder) with size/color inputs
- Arm/disarm placement tools
- Render saved model cards with Place/Load/Export/Delete actions
- Wire toolbar buttons (New, Save, Save As, Export, Import)

## Public Interface

```javascript
initPalette(state)                    // Initialize all UI
refreshSavedModelsList(state)         // Re-render model list
```

## Tool Definitions

```javascript
TOOL_DEFS = [
  { type: "box",      label: "Box",      sizeFields: ["w", "h", "d"] },
  { type: "wall",     label: "Wall",     sizeFields: ["w", "h", "d"] },
  { type: "roof",     label: "Roof",     sizeFields: ["w", "d", "height"] },
  { type: "cylinder", label: "Cylinder", sizeFields: ["radius", "height"] },
]
```

## Armed Tool State

```javascript
// Primitive tool:
state.armedTool = { kind: "primitive", type: "box", size: {w,h,d}, color: 0xRRGGBB }

// Reference tool:
state.armedTool = { kind: "ref", refModelId: "m_abc123" }
```

## UI Elements

| Element | ID | Purpose |
|---------|-----|---------|
| Tool list | `#tool-list` | Container for tool cards |
| Saved models | `#saved-models-list` | Container for model cards |
| New button | `#btn-new` | Clear canvas |
| Save button | `#btn-save` | Save/overwrite model |
| Export button | `#btn-export` | Download as JSON |
| Import input | `#import-file` | Upload JSON file |
| Back link | `#back-link` | Navigate to play mode |

## Implementation

- Tool list rendering: `src/EditorPalette.js:33-89`
- Model list rendering: `src/EditorPalette.js:91-152`
- Toolbar wiring: `src/EditorPalette.js:154-208`
