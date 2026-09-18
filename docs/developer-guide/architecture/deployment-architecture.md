# Deployment Architecture

## Deployment Model

```
┌──────────────────────────────────────────┐
│           Static File Server              │
│  (Python, Nginx, Apache, CDN, etc.)      │
│                                           │
│  Root directory containing:               │
│  ├── index.html                           │
│  ├── editor.html                          │
│  ├── style.css                            │
│  ├── dev.sh                               │
│  ├── assets/                              │
│  │   └── adventurer.glb                   │
│  └── src/                                 │
│      └── *.js (all modules)              │
└──────────────────────────────────────────┘
         │
         │ HTTP (localhost or remote)
         ▼
┌──────────────────────────────────────────┐
│              Browser                      │
│                                           │
│  Loads HTML → loads ES modules →          │
│  Fetches Three.js from CDN →             │
│  Fetches GLTF model → renders            │
└──────────────────────────────────────────┘
```

## Requirements

1. **HTTP server** — Cannot use `file://` (ES module CORS restrictions)
2. **MIME types** — `.js` files must be served as `application/javascript`
3. **CORS** — CDN (unpkg.com) must allow cross-origin requests
4. **No server-side processing** — Purely static files

## Deployment Options

| Method | Command | Notes |
|--------|---------|-------|
| Python dev server | `python3 -m http.server 8080` | Simplest |
| Node.js serve | `npx serve .` | Auto-detects port |
| Nginx | Copy to web root | Production-ready |
| GitHub Pages | Push to repo | Free hosting |
| Netlify/Vercel | Connect to repo | Auto-deploy |

## Environment Configuration

No environment variables. No configuration files. No secrets.

The only "configuration" is the port number passed to `dev.sh`:

```bash
./dev.sh 8080    # Use port 8080 instead of default 8934
```

## Startup Sequence

```
Browser requests index.html or editor.html
    │
    ├── Parse HTML, load CSS
    ├── Load import map (Three.js CDN URLs)
    ├── Execute <script type="module"> (main.js or EditorApp.js)
    │
    ├── ES module imports resolve:
    │   ├── Relative imports → src/*.js (via HTTP)
    │   └── Bare imports → Three.js CDN (via import map)
    │
    ├── Three.js loads from CDN
    ├── Application code executes
    │
    ├── Play mode: GLTF model loads async from assets/
    └── Editor mode: localStorage read for saved models
```

## Shutdown Behavior

None — browser tab can be closed at any time. No cleanup needed.
