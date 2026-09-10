#!/usr/bin/env bash
# ==============================================================================
# run_benchmark.sh: Top-Level Shell Entrypoint for Koopman-LUSI-Net Benchmark
# ==============================================================================
set -e

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"
cd "$SCRIPT_DIR"

if command -v python3 &> /dev/null; then
    PY_CMD="python3"
elif command -v python &> /dev/null; then
    PY_CMD="python"
else
    echo "[ERROR] No Python interpreter found on PATH." >&2
    exit 1
fi

echo "[INFO] Running Koopman-LUSI-Net benchmark via $PY_CMD..."
exec $PY_CMD run_benchmark.py "$@"
