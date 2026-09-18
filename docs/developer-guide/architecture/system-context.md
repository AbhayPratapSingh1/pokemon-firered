# System Context

## System Context Diagram

```
┌──────────────────────────────────────────────────────┐
│                    User / Browser                      │
│                                                        │
│  ┌────────────────┐        ┌────────────────┐         │
│  │  Player         │        │  Builder        │         │
│  │  (WASD/mouse)   │        │  (editor UI)    │         │
│  └───────┬────────┘        └───────┬────────┘         │
└──────────┼──────────────────────────┼─────────────────┘
           │                          │
           ▼                          ▼
┌──────────────────────────────────────────────────────┐
│                   Open Ground                          │
│                                                        │
│  ┌─────────────────┐    ┌─────────────────┐          │
│  │   Play Mode      │    │   Editor Mode    │          │
│  │   3D world       │    │   Model builder  │          │
│  └────────┬────────┘    └────────┬────────┘          │
│           │                      │                     │
│           └──────────┬───────────┘                     │
│                      │                                 │
│           ┌──────────▼──────────┐                     │
│           │   Shared Modules     │                     │
│           │   PartKit, ModelStore│                     │
│           │   ModelLoader        │                     │
│           └──────────┬──────────┘                     │
└──────────────────────┼────────────────────────────────┘
                       │
           ┌───────────▼───────────┐
           │   Three.js (CDN)       │
           │   + Browser APIs       │
           │   (localStorage, DOM)  │
           └───────────────────────┘
```

## Actors

| Actor | Interaction | Mode |
|-------|-------------|------|
| Player | WASD movement, mouse look, E interact | Play |
| Builder | Tool selection, part placement, save/load | Editor |

## External Dependencies

| Dependency | Type | Purpose |
|------------|------|---------|
| Three.js 0.169.0 | CDN library | 3D rendering, scene graph, animation, controls |
| localStorage | Browser API | Model persistence |
| DOM Events | Browser API | Input handling, UI rendering |
| Python http.server | Dev tool | Local development server |
