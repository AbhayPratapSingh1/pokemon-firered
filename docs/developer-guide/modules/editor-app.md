# EditorApp Module

**File:** `src/EditorApp.js` (97 lines)

## Purpose

Editor mode entry point — bootstraps the renderer, scene, camera, and initializes all editor subsystems.

## Responsibilities

- Create WebGL renderer, scene, camera
- Set up OrbitControls for mouse orbit/zoom
- Add hemisphere + directional lighting
- Create ground mesh + grid overlay
- Create `partsGroup` (container for placed parts)
- Initialize palette, placement, inspector, camera pan
- Run render loop

## Shared State Object

All editor modules communicate through a shared `state` object:

```javascript
state = {
  scene,           // THREE.Scene
  camera,          // THREE.PerspectiveCamera
  renderer,        // THREE.WebGLRenderer
  controls,        // OrbitControls
  groundMesh,      // THREE.Mesh (raycast target)
  partsGroup,      // THREE.Group (container for parts)
  parts,           // Array of part records
  armedTool,       // Currently selected tool or null
  selectedPartId,  // ID of selected part or null
  editingModelId,  // ID of model being edited or null
  onSelectPart,    // Callback: (partId) => void
  onDeselect,      // Callback: () => void
}
```

## Editor Render Loop

```
animate()
  ├── cameraPan.update(delta)   // WASD panning
  ├── controls.update()         // OrbitControls damping
  └── renderer.render()         // Draw frame
```
