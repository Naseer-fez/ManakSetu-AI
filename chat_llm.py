"""Interactive chat script with toggleable 3B / 7B GGUF models and no system prompt."""
from __future__ import annotations
import argparse
import os
from pathlib import Path
from typing import Any
from backend.config.paths import LLM_DIR
from backend.engine.gguf_loader import instantiate_llama

# Toggle model here: "3b" or "7b" (or use --model flag / LLM_MODEL_TIER env var)
ACTIVE_MODEL: str = os.getenv("LLM_MODEL_TIER", "3b").lower()

MODEL_PATHS: dict[str, Path] = {
    "3b": Path(os.getenv("MODEL_3B_PATH", str(LLM_DIR / "Qwen2.5-3B-Instruct-Q4_K_M.gguf"))),
    "7b": Path(os.getenv("MODEL_7B_PATH", str(LLM_DIR / "Qwen2.5-7B-Instruct-Q4_K_M.gguf"))),
}
GPU_LAYERS: dict[str, int] = {
    "3b": int(os.getenv("GPU_LAYERS_3B", "36")),
    "7b": int(os.getenv("GPU_LAYERS_7B", "24")),
}


def load_model(choice: str) -> Any:
    """Load the selected GGUF model with CUDA GPU acceleration."""
    choice_clean = choice.lower().strip()
    if choice_clean not in MODEL_PATHS:
        raise ValueError(f"Unknown model '{choice_clean}'. Available: '3b', '7b'")
    path = MODEL_PATHS[choice_clean]
    if not path.exists():
        raise FileNotFoundError(f"Model file not found: {path}")
    print(f"\n[+] Loading {choice_clean.upper()} on CUDA: {path.name}")
    return instantiate_llama(
        model_path=str(path),
        context_size=int(os.getenv("LLM_CTX", "32768")),
        threads=int(os.getenv("LLM_THREADS", "4")),
        gpu_layers=GPU_LAYERS.get(choice_clean, 24),
        chat_format=os.getenv("LLM_CHAT_FORMAT", "chatml"),
    )


def chat_loop(llm: Any, model_name: str) -> None:
    """Run pure interactive chat while-loop with NO system prompt."""
    print("=" * 60)
    print(f" LLM Chat Session ({model_name.upper()}) | Pure User Prompt (No System Prompt)")
    print(" Type your message and press Enter. (Type 'exit' or 'quit' to stop)")
    print("=" * 60)
    while True:
        try:
            # prompt: str = input("\n[You] > ").strip()
            prompt:str='''#!/bin/bash

set -e

# ============================================================
# Local Wi-Fi / Hotspot File Transfer Server
# ============================================================

PROJECT_DIR="$(pwd)/local-file-transfer"
VENV_DIR="$PROJECT_DIR/venv"
APP_FILE="$PROJECT_DIR/app.py"
TEMPLATE_DIR="$PROJECT_DIR/templates"
UPLOAD_DIR="$PROJECT_DIR/uploads"

HOST="0.0.0.0"
PORT="5000"

echo ""
echo "=============================================="
echo "       LOCAL FILE TRANSFER SERVER"
echo "=============================================="
echo ""

# ------------------------------------------------------------
# 1. Check Python
# ------------------------------------------------------------

if command -v python3 >/dev/null 2>&1; then
    PYTHON="python3"
elif command -v python >/dev/null 2>&1; then
    PYTHON="python"
else
    echo "ERROR: Python is not installed."
    exit 1
fi

echo "[+] Python found:"
$PYTHON --version

# ------------------------------------------------------------
# 2. Create project directories
# ------------------------------------------------------------

echo ""
echo "[+] Creating project directory..."

mkdir -p "$PROJECT_DIR"
mkdir -p "$TEMPLATE_DIR"
mkdir -p "$UPLOAD_DIR"

# ------------------------------------------------------------
# 3. Create virtual environment
# ------------------------------------------------------------

if [ ! -d "$VENV_DIR" ]; then
    echo "[+] Creating Python virtual environment..."
    $PYTHON -m venv "$VENV_DIR"
else
    echo "[+] Virtual environment already exists."
fi

# ------------------------------------------------------------
# 4. Activate virtual environment
# ------------------------------------------------------------

source "$VENV_DIR/bin/activate"

echo "[+] Virtual environment activated."

# ------------------------------------------------------------
# 5. Install Flask
# ------------------------------------------------------------

echo ""
echo "[+] Installing Flask..."

python -m pip install --upgrade pip
python -m pip install flask

# ------------------------------------------------------------
# 6. Create Flask application
# ------------------------------------------------------------

echo ""
echo "[+] Creating Flask application..."

cat > "$APP_FILE" <<'PYTHON'
from flask import (
    Flask,
    render_template,
    request,
    redirect,
    url_for,
    send_from_directory,
    flash
)

from werkzeug.utils import secure_filename

import os
import socket


# ============================================================
# Configuration
# ============================================================

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
UPLOAD_FOLDER = os.path.join(BASE_DIR, "uploads")

MAX_FILE_SIZE = 10 * 1024 * 1024 * 1024  # 10 GB

app = Flask(__name__)

app.config["UPLOAD_FOLDER"] = UPLOAD_FOLDER
app.config["MAX_CONTENT_LENGTH"] = MAX_FILE_SIZE

# Required for Flask flash messages
app.secret_key = "local-file-transfer-secret"


os.makedirs(UPLOAD_FOLDER, exist_ok=True)


# ============================================================
# Get local IP address
# ============================================================

def get_local_ip():
    """
    Finds the local IP address used by this machine.
    """

    try:
        sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)

        # Doesn't actually send data.
        sock.connect(("8.8.8.8", 80))

        ip = sock.getsockname()[0]

        sock.close()

        return ip

    except Exception:
        return "127.0.0.1"


# ============================================================
# Home page
# ============================================================

@app.route("/")
def index():

    files = []

    for filename in os.listdir(UPLOAD_FOLDER):

        filepath = os.path.join(UPLOAD_FOLDER, filename)

        if os.path.isfile(filepath):

            size = os.path.getsize(filepath)

            files.append({
                "name": filename,
                "size": size
            })

    files.sort(
        key=lambda x: os.path.getmtime(
            os.path.join(UPLOAD_FOLDER, x["name"])
        ),
        reverse=True
    )

    return render_template(
        "index.html",
        files=files,
        local_ip=get_local_ip()
    )


# ============================================================
# Upload
# ============================================================

@app.route("/upload", methods=["POST"])
def upload():

    if "file" not in request.files:
        flash("No file selected.")
        return redirect(url_for("index"))

    file = request.files["file"]

    if file.filename == "":
        flash("No file selected.")
        return redirect(url_for("index"))

    filename = secure_filename(file.filename)

    if not filename:
        flash("Invalid filename.")
        return redirect(url_for("index"))

    filepath = os.path.join(
        UPLOAD_FOLDER,
        filename
    )

    # --------------------------------------------------------
    # Prevent accidental overwriting
    # --------------------------------------------------------

    if os.path.exists(filepath):

        name, extension = os.path.splitext(filename)

        counter = 1

        while os.path.exists(filepath):

            new_filename = f"{name}_{counter}{extension}"

            filepath = os.path.join(
                UPLOAD_FOLDER,
                new_filename
            )

            counter += 1

        filename = new_filename

    # --------------------------------------------------------
    # Save file
    # --------------------------------------------------------

    file.save(filepath)

    flash(f"Uploaded successfully: {filename}")

    return redirect(url_for("index"))


# ============================================================
# Download
# ============================================================

@app.route("/download/<path:filename>")
def download(filename):

    return send_from_directory(
        UPLOAD_FOLDER,
        filename,
        as_attachment=True
    )


# ============================================================
# Delete
# ============================================================

@app.route("/delete/<path:filename>", methods=["POST"])
def delete(filename):

    safe_filename = secure_filename(filename)

    filepath = os.path.join(
        UPLOAD_FOLDER,
        safe_filename
    )

    if os.path.exists(filepath):

        os.remove(filepath)

        flash(f"Deleted: {safe_filename}")

    return redirect(url_for("index"))


# ============================================================
# Error: file too large
# ============================================================

@app.errorhandler(413)
def file_too_large(error):

    flash("File is too large. Maximum allowed size is 10 GB.")

    return redirect(url_for("index"))


# ============================================================
# Start server
# ============================================================

if __name__ == "__main__":

    ip = get_local_ip()

    print("")
    print("==============================================")
    print("       LOCAL FILE TRANSFER SERVER")
    print("==============================================")
    print("")
    print(f"Server running on:")
    print(f"  http://{ip}:5000")
    print("")
    print("Open this address on the other laptop.")
    print("")
    print("Press CTRL+C to stop the server.")
    print("")

    app.run(
        host="0.0.0.0",
        port=5000,
        debug=False,
        threaded=True
    )
PYTHON

# ------------------------------------------------------------
# 7. Create Jinja template
# ------------------------------------------------------------

echo "[+] Creating Jinja2 interface..."

cat > "$TEMPLATE_DIR/index.html" <<'HTML'
<!DOCTYPE html>

<html lang="en">

<head>

    <meta charset="UTF-8">

    <meta
        name="viewport"
        content="width=device-width, initial-scale=1.0"
    >

    <title>Local File Transfer</title>

    <style>

        * {
            box-sizing: border-box;
        }

        body {
            margin: 0;
            min-height: 100vh;

            font-family:
                -apple-system,
                BlinkMacSystemFont,
                "Segoe UI",
                sans-serif;

            background: #0f1115;
            color: #ffffff;

            display: flex;
            justify-content: center;
            align-items: center;

            padding: 30px;
        }

        .container {
            width: 100%;
            max-width: 800px;
        }

        .header {
            text-align: center;
            margin-bottom: 30px;
        }

        .header h1 {
            margin: 0;
            font-size: 36px;
        }

        .header p {
            color: #9ca3af;
            margin-top: 10px;
        }

        .address {
            margin-top: 15px;

            display: inline-block;

            padding: 10px 16px;

            border-radius: 10px;

            background: #181b22;

            color: #60a5fa;

            font-family: monospace;
            font-size: 15px;
        }

        .card {
            background: #181b22;

            border: 1px solid #292d36;

            border-radius: 18px;

            padding: 25px;

            margin-bottom: 20px;
        }

        .upload-box {
            border: 2px dashed #3b414d;

            border-radius: 14px;

            padding: 45px 20px;

            text-align: center;

            cursor: pointer;

            transition: 0.2s;
        }

        .upload-box:hover {
            border-color: #60a5fa;
            background: #1b2029;
        }

        .upload-box input {
            display: none;
        }

        .upload-icon {
            font-size: 42px;
            margin-bottom: 10px;
        }

        .upload-title {
            font-size: 18px;
            font-weight: 600;
        }

        .upload-subtitle {
            color: #8b93a1;
            margin-top: 8px;
            font-size: 14px;
        }

        button {
            width: 100%;

            margin-top: 18px;

            border: none;

            border-radius: 10px;

            padding: 13px;

            background: #2563eb;

            color: white;

            font-size: 16px;

            font-weight: 600;

            cursor: pointer;
        }

        button:hover {
            background: #1d4ed8;
        }

        .message {
            background: #172a1d;

            border: 1px solid #285c37;

            color: #86efac;

            padding: 12px 15px;

            border-radius: 10px;

            margin-bottom: 15px;
        }

        .file {
            display: flex;

            justify-content: space-between;

            align-items: center;

            gap: 15px;

            padding: 15px;

            border-bottom: 1px solid #292d36;
        }

        .file:last-child {
            border-bottom: none;
        }

        .file-name {
            font-weight: 500;

            word-break: break-all;
        }

        .file-size {
            color: #8b93a1;

            font-size: 13px;

            margin-top: 4px;
        }

        .download {
            flex-shrink: 0;

            text-decoration: none;

            color: white;

            background: #272d38;

            padding: 9px 14px;

            border-radius: 8px;

            font-size: 14px;
        }

        .download:hover {
            background: #343b48;
        }

        .empty {
            text-align: center;

            color: #717784;

            padding: 25px;
        }

        .footer {
            text-align: center;

            color: #555b67;

            font-size: 13px;

            margin-top: 20px;
        }

    </style>

</head>


<body>

<div class="container">

    <div class="header">

        <h1>Local File Transfer</h1>

        <p>
            Transfer files between devices on the same network.
        </p>

        <div class="address">
            http://{{ local_ip }}:5000
        </div>

    </div>


    {% with messages = get_flashed_messages() %}

        {% if messages %}

            {% for message in messages %}

                <div class="message">
                    {{ message }}
                </div>

            {% endfor %}

        {% endif %}

    {% endwith %}


    <div class="card">

        <form
            action="{{ url_for('upload') }}"
            method="POST"
            enctype="multipart/form-data"
        >

            <label class="upload-box">

                <div class="upload-icon">
                    📁
                </div>

                <div class="upload-title">
                    Click to select a file
                </div>

                <div class="upload-subtitle">
                    Or drag and drop a file here
                </div>

                <input
                    type="file"
                    name="file"
                    id="file"
                    required
                >

            </label>

            <button type="submit">
                Upload File
            </button>

        </form>

    </div>


    <div class="card">

        <h2>
            Available Files
        </h2>

        {% if files %}

            {% for file in files %}

                <div class="file">

                    <div>

                        <div class="file-name">
                            {{ file.name }}
                        </div>

                        <div class="file-size">

                            {% if file.size < 1024 %}
                                {{ file.size }} B

                            {% elif file.size < 1024 * 1024 %}
                                {{ "%.2f"|format(file.size / 1024) }} KB

                            {% elif file.size < 1024 * 1024 * 1024 %}
                                {{ "%.2f"|format(file.size / (1024 * 1024)) }} MB

                            {% else %}
                                {{ "%.2f"|format(file.size / (1024 * 1024 * 1024)) }} GB

                            {% endif %}

                        </div>

                    </div>


                    <a
                        class="download"
                        href="{{ url_for('download', filename=file.name) }}"
                    >
                        Download
                    </a>

                </div>

            {% endfor %}

        {% else %}

            <div class="empty">
                No files have been uploaded yet.
            </div>

        {% endif %}

    </div>


    <div class="footer">

        Files are transferred directly over your local network.

    </div>

</div>


<script>

const fileInput = document.getElementById("file");

const uploadBox = document.querySelector(".upload-box");

fileInput.addEventListener("change", function () {

    if (this.files.length > 0) {

        uploadBox.querySelector(".upload-title").textContent =
            this.files[0].name;

        uploadBox.querySelector(".upload-subtitle").textContent =
            "Ready to upload";

    }

});

</script>

</body>

</html>
HTML

# ------------------------------------------------------------
# 8. Start server
# ------------------------------------------------------------

echo ""
echo "=============================================="
echo "Starting server..."
echo "=============================================="
echo ""

cd "$PROJECT_DIR"

python app.py

WHt is the error give me the full code errors , and why i cnat upload the file '''
            if not prompt:
                continue
            if prompt.lower() in ("exit", "quit", "q"):
                print("\nExiting chat session.")
                break
            print(f"\n[{model_name.upper()}]: ", end="", flush=True)
            stream = llm.create_chat_completion(
                messages=[{"role": "user", "content": prompt}],
                stream=True,
                temperature=float(os.getenv("LLM_TEMPERATURE", "0.7")),
                max_tokens=int(os.getenv("LLM_MAX_TOKENS", "1024")),
            )
            for chunk in stream:
                content = chunk.get("choices", [{}])[0].get("delta", {}).get("content", "")
                if content:
                    print(content, end="", flush=True)
            print()
        except (KeyboardInterrupt, EOFError):
            print("\nSession interrupted. Exiting.")
            break
        except (RuntimeError, ValueError, KeyError) as err:
            print(f"\n[Error]: {type(err).__name__} - {err}")


def main() -> None:
    """Parse CLI argument or use default toggle, then start chat."""
    parser = argparse.ArgumentParser(description="Chat with local 3B/7B LLM (no system prompt).")
    parser.add_argument(
        "--model",
        type=str,
        default=ACTIVE_MODEL,
        choices=["3b", "7b"],
        help="Model choice ('3b' or '7b', default: %(default)s)",
    )
    args = parser.parse_args()
    llm = load_model(args.model)
    chat_loop(llm, args.model)


if __name__ == "__main__":
    main()
