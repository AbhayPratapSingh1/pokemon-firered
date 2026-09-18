# Build and Deployment

## Build Process

**No build step.** The project uses vanilla ES modules loaded directly by the browser.

```
Source (src/*.js)  ─────►  Browser (via import map CDN)
```

## Development Runtime

```bash
./dev.sh              # Python3 HTTP server on port 8934
```

Or:

```bash
python3 -m http.server 8934
```

## Production Deployment

Any static file server works:

```bash
# Python
python3 -m http.server 8080

# Node.js
npx serve .

# Nginx
# Copy files to web root

# GitHub Pages / Netlify / Vercel
# Point to repository root
```

No compilation, no bundling, no transpilation required.

## Dependencies at Runtime

| Dependency | Source | Required |
|------------|--------|----------|
| Three.js 0.169.0 | unpkg.com CDN (import map) | Yes |
| Python3 (dev only) | Local system | For dev server only |

## Asset Loading

| Asset | Source | Load Method |
|-------|--------|-------------|
| `adventurer.glb` | `assets/adventurer.glb` | `GLTFLoader` at runtime |

The GLB file is loaded relative to the JS module via `import.meta.url`.

## Caching

No cache-busting beyond the `?v=7` query parameter on `main.js` in `index.html`. Three.js is loaded from unpkg with a fixed version URL.
