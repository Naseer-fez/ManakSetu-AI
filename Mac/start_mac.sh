#!/bin/bash
set -e

echo "========================================"
echo " Starting Mac Reasoning Node (M-Series) "
echo "========================================"

# Change to script directory
cd "$(dirname "$0")"

# Create venv if it doesn't exist
if [ ! -d "venv" ]; then
    echo "[*] Creating virtual environment (venv)..."
    python3 -m venv venv
fi

# Activate venv
source venv/bin/activate

# Check if dependencies are already installed to avoid slow re-installs
if python3 -c "import llama_cpp, fastapi, sentence_transformers, chromadb, uvicorn" 2>/dev/null; then
    echo "[+] Core dependencies already verified in venv."
else
    echo "[*] Upgrading pip..."
    pip install --upgrade pip

    echo "[*] Installing dependencies with binary preference..."
    pip install --prefer-binary -r requirements.txt || {
        echo "[!] Attempting Metal compilation for llama-cpp-python..."
        CMAKE_ARGS="-DGGML_METAL=on" pip install --no-binary llama-cpp-python llama-cpp-python
        pip install -r requirements.txt
    }
fi

echo "[*] Starting Mac Server on port 5000..."
python mac_server.py
