# =====================================================================
# Stage 1: Build Frontend (Vite + React + TypeScript)
# =====================================================================
FROM node:20-alpine AS frontend-builder
WORKDIR /build

COPY frontend/package*.json ./
RUN npm ci --prefer-offline --no-audit || npm install

COPY frontend/ ./
ENV VITE_API_URL=/api/v1
RUN npm run build

# =====================================================================
# Stage 2: Production Runtime with Python 3.12 & CUDA support
# =====================================================================
FROM nvidia/cuda:12.4.1-runtime-ubuntu22.04

# Avoid interactive tzdata dialogs
ENV DEBIAN_FRONTEND=noninteractive \
    PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PIP_NO_CACHE_DIR=1 \
    PORT=8000 \
    HOST=0.0.0.0 \
    APP_CONFIG_PATH=/app/backend/config/config.yaml

WORKDIR /app

# Install system dependencies, Python 3.12, and build tools
RUN apt-get update && apt-get install -y --no-install-recommends \
    software-properties-common \
    curl \
    ca-certificates \
    git \
    ffmpeg \
    libgl1 \
    libglib2.0-0 \
    libgomp1 \
    build-essential \
    && add-apt-repository ppa:deadsnakes/ppa -y \
    && apt-get update && apt-get install -y --no-install-recommends \
    python3.12 \
    python3.12-venv \
    python3.12-dev \
    && curl -sS https://bootstrap.pypa.io/get-pip.py | python3.12 \
    && ln -sf /usr/bin/python3.12 /usr/bin/python \
    && ln -sf /usr/bin/python3.12 /usr/bin/python3 \
    && rm -rf /var/lib/apt/lists/*

# Install PyTorch with CUDA 12.4 support first (Rule R10 GPU Acceleration)
RUN python -m pip install --upgrade pip setuptools wheel && \
    python -m pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu124

# Install pre-compiled llama-cpp-python wheel with CUDA 12.4 support for local GGUF inference
RUN python -m pip install llama-cpp-python \
    --extra-index-url https://abetlen.github.io/llama-cpp-python/whl/cu124 || \
    python -m pip install llama-cpp-python

# Copy and install backend requirements
COPY requirements.txt .
RUN python -m pip install -r requirements.txt

# Copy backend codebase and configuration
COPY backend/ ./backend/
COPY vectordb/ ./vectordb/

# Copy built frontend assets to frontend/dist so FastAPI serves them statically
COPY --from=frontend-builder /build/dist ./frontend/dist

# Copy local LLM models, vector store, and tokenizers
# Note: Models can be copied in or mounted via Docker volume at /app/llm
COPY llm/ ./llm/

# Create runtime directories for logs, caches, and uploads
RUN mkdir -p backend/logs backend/data/uploads backend/data/tts_cache backend/data/workspaces

EXPOSE 8000

HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD curl -f http://localhost:8000/api/v1/health || exit 1

CMD ["python", "-m", "uvicorn", "backend.main:app", "--host", "0.0.0.0", "--port", "8000"]