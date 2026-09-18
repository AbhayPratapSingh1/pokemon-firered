# EditorInspector Module

**File:** `src/EditorInspector.js` (207 lines)

## Purpose

Part property editing panel — allows editing position, rotation, scale, size, and color of selected parts.

## Responsibilities

- Show/hide inspector panel based on selection
- Render property fields for the selected part
- Highlight selected part with Box3Helper
- Rebuild part mesh on property change
- Delete selected part

## Public Interface

```javascript
initInspector(state)   // Set up callbacks and render initial state
```

## Properties Edited

| Property | Fields | Step | Notes |
|----------|--------|------|-------|
| Position | X, Y, Z | 0.5 | Y min: 0 |
| Rotation | Rotate° | 15° | Converted to/from radians |
| Scale | Scale | 0.1 | Min: 0.05 |
| Size | Per type | 0.1 | Min: 0.1 |
| Color | Color picker | — | Hex color input |

## Size Fields by Part Type

| Type | Fields |
|------|--------|
| box | Width, Height, Depth |
| wall | Width, Height, Depth |
| roof | Width, Depth, Height |
| cylinder | Radius, Height |

## Highlight

- Yellow Box3Helper (`#ffe066`) shown around selected part
- Cleared on deselect

## Delete

- Removes mesh from partsGroup
- Removes part record from state.parts
- Triggers deselect
