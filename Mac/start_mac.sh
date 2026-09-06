#!/bin/bash
set -e

echo "========================================"
echo " Starting Mac Reasoning Node (M-Series) "
echo "========================================"

# Change to script directory
cd "$(dirname "$0")"

# Create venv if it doesn't exist
if [ ! -d "venv" ]; then
    echo "[*] Creating virtual environment..."
    python3 -m venv venv
fi

# Activate venv
source venv/bin/activate

# Upgrade pip
echo "[*] Upgrading pip..."
pip install --upgrade pip

# Install dependencies with Metal support for llama-cpp-python
echo "[*] Installing dependencies..."
# We explicitly set CMAKE_ARGS to enable Apple Metal Performance Shaders (MPS)
CMAKE_ARGS="-DGGML_METAL=on" pip install -r requirements.txt

echo "[*] Starting Mac Server on port 5000..."
python mac_server.py
