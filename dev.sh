#!/usr/bin/env bash
# Serves this project over plain HTTP (required — opening index.html directly
# via file:// breaks the ES module imports and GLTF model loading).
set -euo pipefail

PORT="${1:-8934}"

cd "$(dirname "$0")"
echo "Serving $(pwd) at http://localhost:${PORT}"
exec python3 -m http.server "${PORT}"
