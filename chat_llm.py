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
        context_size=int(os.getenv("LLM_CTX", "4096")),
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
            prompt: str = input("\n[You] > ").strip()
            if not prompt:
                continue
            if prompt.lower() in ("clear", "reset", "/clear"):
                print("\n[+] Context cleared. Ready for a new prompt.")
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
