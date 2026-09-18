# Container Architecture

## Runtime Containers

```
┌──────────────────────────────────────────────────┐
│                 Browser Tab                        │
│                                                    │
│  ┌────────────────────────────────────────────┐  │
│  │              HTML Document                   │  │
│  │  ┌──────────────┐  ┌──────────────────┐   │  │
│  │  │  index.html   │  │  editor.html      │   │  │
│  │  │  (Play Mode)  │  │  (Editor Mode)    │   │  │
│  │  └──────┬───────┘  └──────┬───────────┘   │  │
│  │         │                  │                │  │
│  │  ┌──────▼───────┐  ┌──────▼───────────┐   │  │
│  │  │  ES Module    │  │  ES Module        │   │  │
│  │  │  (main.js)    │  │  (EditorApp.js)   │   │  │
│  │  └──────┬───────┘  └──────┬───────────┘   │  │
│  │         │                  │                │  │
│  │  ┌──────▼──────────────────▼───────────┐   │  │
│  │  │         WebGL Canvas                 │   │  │
│  │  │    (renderer.domElement)              │   │  │
│  │  └──────────────────────────────────────┘   │  │
│  │                                              │  │
│  │  ┌──────────────────────────────────────┐   │  │
│  │  │         DOM Overlays (HUD/UI)         │   │  │
│  │  └──────────────────────────────────────┘   │  │
│  └────────────────────────────────────────────┘  │
│                                                    │
│  ┌────────────────────────────────────────────┐  │
│  │           localStorage                      │  │
│  │     Key: townbuilder.models                 │  │
│  └────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────┘
```

## Per-Mode Containers

### Play Mode

| Component | Technology | Purpose |
|-----------|------------|---------|
| `index.html` | HTML | DOM structure, HUD elements |
| `main.js` | ES Module | Game bootstrap, game loop |
| `style.css` | CSS | HUD positioning, crosshair, prompts |
| `adventurer.glb` | GLTF Binary | Player character model |

### Editor Mode

| Component | Technology | Purpose |
|-----------|------------|---------|
| `editor.html` | HTML | DOM structure, toolbar, sidebar |
| `EditorApp.js` | ES Module | Editor bootstrap, render loop |
| `style.css` | CSS | Editor toolbar, sidebar, inspector |
