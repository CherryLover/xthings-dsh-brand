#!/bin/sh
# Local harness server for the Xthings splash overlay.
#
#   ./dev/serve.sh        → http://127.0.0.1:8138/dev/harness.html
#
# No route shim: dev/harness.html has everything inlined (lottie build,
# animation data, splash.css, splash.js), exactly like the host's index.html,
# so a plain static server on the package root is enough.
set -eu

ROOT=$(cd "$(dirname "$0")/.." && pwd)
cd "$ROOT"

echo "Xthings splash harness: http://127.0.0.1:8138/dev/harness.html"
echo "(serving $ROOT on port 8138 — Ctrl-C to stop)"

exec python3 -m http.server 8138 --bind 127.0.0.1
