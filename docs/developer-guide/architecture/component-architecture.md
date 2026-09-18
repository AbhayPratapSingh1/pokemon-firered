# Component Architecture

## Play Mode Components

```
┌─────────────────────────────────────────────────────────┐
│                     main.js                              │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────┐ │
│  │  InputManager│  │  Player     │  │  CameraController│ │
│  │  (Input.js)  │  │  (Player.js)│  │  (CameraCtrl.js) │ │
│  └──────┬──────┘  └──────┬──────┘  └────────┬────────┘ │
│         │                 │                   │          │
│         │    ┌────────────▼──────────┐        │          │
│         └───►│     Player.update()   │◄───────┘          │
│              │  Movement, Physics,   │                   │
│              │  Animation, Collision │                   │
│              └───────────┬──────────┘                   │
│                          │                               │
│  ┌───────────────────────▼──────────────────────┐      │
│  │           World + House Interior               │      │
│  │                                                │      │
│  │  ┌──────────┐  ┌─────────────────────────┐   │      │
│  │  │ World.js  │  │ PlayerHouseInterior.js   │   │      │
│  │  │ Obstacles │  │ Interior obstacles        │   │      │
│  │  │ Ground    │  │ Door triggers             │   │      │
│  │  └──────────┘  │ Staircase ground height   │   │      │
│  │                 └─────────────────────────┘   │      │
│  └────────────────────────────────────────────────┘      │
│                                                          │
│  ┌─────────────────────────────────────────────┐        │
│  │        InteractionManager.js                  │        │
│  │  Proximity detection, E-key prompts/messages  │        │
│  └─────────────────────────────────────────────┘        │
└─────────────────────────────────────────────────────────┘
```

## Editor Mode Components

```
┌─────────────────────────────────────────────────────────┐
│                    EditorApp.js                           │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  ┌──────────────┐  ┌────────────────┐                   │
│  │ EditorPalette │  │ EditorPlacement │                   │
│  │ Tool selection│  │ Raycast + grid  │                   │
│  │ Model list    │  │ Part creation   │                   │
│  └──────┬───────┘  └───────┬────────┘                   │
│         │                   │                            │
│         │    ┌──────────────▼──────────────┐            │
│         └───►│        state object          │◄──────┐   │
│              │  scene, camera, parts[],     │       │   │
│              │  armedTool, selectedPartId   │       │   │
│              └──────────────┬───────────────┘       │   │
│                             │                        │   │
│  ┌──────────────────────────▼────────────────────┐  │   │
│  │           EditorInspector.js                    │  │   │
│  │  Position, rotation, scale, size, color editing │  │   │
│  └────────────────────────────────────────────────┘  │   │
│                                                      │   │
│  ┌──────────────────────────────────────────────┐   │   │
│  │        EditorCameraPan.js                     │   │   │
│  │  WASD panning (camera + orbit target)         │   │   │
│  └──────────────────────────────────────────────┘   │   │
└─────────────────────────────────────────────────────────┘
```

## Component Communication

| Source | Target | Mechanism |
|--------|--------|-----------|
| InputManager | Player | Reads `input.forward`, `input.sprint`, etc. |
| Player | CameraController | `player.position`, `player.headHeight` |
| Player | InteractionManager | `player.position.distanceTo()` |
| PlayerHouseInterior | Player | `player.position` (door teleport), `getGroundHeight()` |
| EditorPalette | EditorPlacement | `state.armedTool` (shared state) |
| EditorPlacement | EditorInspector | `state.selectedPartId`, `state.onSelectPart` callback |
| EditorInspector | EditorPlacement | `addPartToScene()` (rebuild on edit) |
| All editor modules | ModelStore | `listModels()`, `saveModel()`, etc. |
