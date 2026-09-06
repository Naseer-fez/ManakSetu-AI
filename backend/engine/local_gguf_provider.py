"""Local GGUF LLM provider using llama-cpp-python with persistent VRAM caching."""
from __future__ import annotations
import asyncio
import json
from pathlib import Path
import threading
import time
from typing import Any, AsyncGenerator
from backend.config.settings import app_settings
from backend.engine.gguf_loader import instantiate_llama
from backend.engine.llm_interface import BaseLlmProvider
from backend.logger.app_logger import get_logger

logger = get_logger("engine.local_gguf_provider")
_STREAM_END = object()

# Threshold for runtime repetition detection in streaming mode.
# If the same token appears this many times consecutively, generation is halted.
_MAX_CONSECUTIVE_REPEATS = 8


def _build_sampling_kwargs() -> dict[str, float | int]:
    """Assemble repetition-guard sampling kwargs from app config."""
    return {
        "repeat_penalty": app_settings.llm.repeat_penalty,
        "frequency_penalty": app_settings.llm.frequency_penalty,
        "presence_penalty": app_settings.llm.presence_penalty,
        "repeat_last_n": app_settings.llm.repeat_last_n,
        "top_p": app_settings.llm.top_p,
    }


class BackpressureError(Exception):
    """Raised when the LLM inference queue is full."""


def _build_messages(prompt: str, system_prompt: str | None, model_path: str) -> list[dict[str, str]]:
    """Format messages according to model-specific role constraints."""
    is_gemma = "gemma" in str(model_path).lower()
    if is_gemma:
        content = f"{system_prompt.strip()}\n\n{prompt.strip()}" if system_prompt and system_prompt.strip() else prompt
        return [{"role": "user", "content": content}]
    msgs: list[dict[str, str]] = []
    if system_prompt and system_prompt.strip():
        msgs.append({"role": "system", "content": system_prompt.strip()})
    msgs.append({"role": "user", "content": prompt})
    return msgs


class LocalGgufLlmProvider(BaseLlmProvider):
    """Local GGUF provider with CUDA GPU acceleration, warm-up, and zero-unload caching."""

    def __init__(
        self,
        model_path: str | None = None,
        n_ctx: int | None = None,
        n_threads: int | None = None,
        n_gpu_layers: int | None = None,
        chat_format: str | None = None,
        rope_freq_scale: float | None = None,
        kv_quant: str | None = None,
    ) -> None:
        if model_path:
            self._model_path = model_path
        elif app_settings.distributed_reasoning.mac_available:
            self._model_path = app_settings.distributed_reasoning.local_preprocessor_model
        else:
            self._model_path = app_settings.llm.model_path

        is_fast_model = app_settings.distributed_reasoning.mac_available and (
            not model_path or model_path == app_settings.distributed_reasoning.local_preprocessor_model
        )

        if n_ctx is not None:
            self._n_ctx = n_ctx
        elif is_fast_model:
            self._n_ctx = app_settings.distributed_reasoning.fast_model_n_ctx
        else:
            self._n_ctx = app_settings.llm.n_ctx

        self._n_threads = n_threads or app_settings.llm.n_threads

        if n_gpu_layers is not None:
            self._n_gpu_layers = n_gpu_layers
        elif is_fast_model:
            self._n_gpu_layers = app_settings.distributed_reasoning.fast_model_n_gpu_layers
        else:
            self._n_gpu_layers = app_settings.llm.n_gpu_layers

        self._chat_format = chat_format or app_settings.llm.chat_format
        self._rope_freq_scale = rope_freq_scale if rope_freq_scale is not None else (
            app_settings.distributed_reasoning.fast_model_rope_freq_scale if is_fast_model else None
        )
        self._kv_quant = kv_quant or (
            app_settings.distributed_reasoning.fast_model_kv_quant if is_fast_model else None
        )
        self._model = None
        self._lock = threading.RLock()  # re-entrant startup lock (preload/warmup)

        self._semaphore: asyncio.Semaphore = asyncio.Semaphore(1)
        self._queue_lock = asyncio.Lock()
        self._queue_count: int = 0
        self._max_queue: int = app_settings.llm.max_queue_size
        self._grammar: Any = None
        self._grammar_loaded: bool = False

    def _load_grammar(self) -> Any:
        """Load GBNF grammar from configured path. Returns None on failure (unconstrained)."""
        if self._grammar_loaded:
            return self._grammar
        self._grammar_loaded = True
        if not app_settings.llm.enable_grammar:
            logger.info("Local GGUF: Grammar disabled via config — using unconstrained generation")
            return None
        grammar_path = app_settings.llm.grammar_file
        if not grammar_path:
            logger.info("Local GGUF: No grammar file configured — using unconstrained generation")
            return None
        if not Path(grammar_path).exists():
            logger.warning(f"Local GGUF: Grammar file not found at '{grammar_path}' — falling back to unconstrained generation")
            return None
        try:
            from llama_cpp import LlamaGrammar
            self._grammar = LlamaGrammar.from_file(grammar_path)
            logger.info(f"Local GGUF: Loaded GBNF grammar from '{grammar_path}'")
            return self._grammar
        except (ValueError, RuntimeError, OSError, ImportError) as exc:
            logger.warning(f"Local GGUF: Failed to load grammar ({type(exc).__name__}: {exc}) — falling back to unconstrained generation")
            return None

    def _init_llama_instance(self, ctx: int, gpu_layers: int | None = None) -> Any:
        layers = self._n_gpu_layers if gpu_layers is None else gpu_layers
        return instantiate_llama(
            self._model_path,
            ctx,
            self._n_threads,
            layers,
            self._chat_format,
            rope_freq_scale=self._rope_freq_scale,
            kv_quant=self._kv_quant,
        )

    def _load_model(self) -> Any:
        if app_settings.distributed_reasoning.mac_available:
            path_str = str(self._model_path)
            if ("7b" in path_str.lower() or path_str == str(app_settings.llm.model_path)) and path_str != str(app_settings.distributed_reasoning.local_preprocessor_model):
                logger.warning(
                    f"Local GGUF: Blocked loading 7B model '{self._model_path}' because mac_available is True."
                )
                return None
        if not Path(self._model_path).exists():
            logger.info(f"Local GGUF: Model binary not found at '{self._model_path}'")
            return None
        configs = [(self._n_ctx, self._n_gpu_layers), (4096, self._n_gpu_layers), (4096, 0)]
        for ctx_cand, gpu_cand in configs:
            try:
                return self._init_llama_instance(ctx_cand, gpu_cand)
            except (ValueError, RuntimeError, TypeError, OSError, ImportError, ModuleNotFoundError) as exc:
                logger.warning(f"Local GGUF: Load failed (ctx={ctx_cand}, gpu={gpu_cand}): {exc}")
        return None


    def preload(self) -> bool:
        with self._lock:
            if self._model is None:
                t0 = time.perf_counter()
                self._model = self._load_model()
                logger.info(f"Local GGUF: Preloaded in {(time.perf_counter() - t0) * 1000.0:.2f}ms (Status: {'SUCCESS' if self._model else 'OFFLINE'})")
            return self._model is not None

    def warmup(self) -> bool:
        with self._lock:
            if self._model is None:
                self.preload()
            if self._model is None:
                return False
            try:
                self._model.create_chat_completion(messages=[{"role": "user", "content": "Warmup"}], max_tokens=1, temperature=0.0)
                return True
            except (ValueError, RuntimeError, TypeError, KeyError, IndexError, OSError) as exc:
                logger.warning(f"Local GGUF: Warmup error ({type(exc).__name__}: {exc})")
                return False

    def is_loaded(self) -> bool:
        return self._model is not None

    def _sync_generate(
        self,
        prompt: str,
        system_prompt: str | None,
        max_tokens: int | None = None,
        use_grammar: bool = True,
    ) -> str | None:
        if self._model is None:
            self._model = self._load_model()
        if self._model is None:
            return None
        grammar = self._load_grammar() if use_grammar else None
        model_p = str(getattr(self, "_model_path", ""))
        effective_max_tokens = max_tokens or (512 if "2b" in model_p.lower() else app_settings.llm.max_tokens)
        msgs = _build_messages(prompt, system_prompt, model_p)
        sampling = _build_sampling_kwargs()
        try:
            resp = self._model.create_chat_completion(
                messages=msgs,
                temperature=app_settings.llm.temperature,
                max_tokens=effective_max_tokens,
                grammar=grammar,
                **sampling,
            )
            choices = resp.get("choices", [])
            return str(choices[0]["message"].get("content", "")) if choices and "message" in choices[0] else None
        except (ValueError, RuntimeError, TypeError, KeyError, IndexError, OSError) as exc:
            if grammar is not None:
                logger.warning(f"[FALLBACK] GGUF grammar inference error ({type(exc).__name__}: {exc}) — retrying without grammar")
                try:
                    resp = self._model.create_chat_completion(
                        messages=msgs,
                        temperature=app_settings.llm.temperature,
                        max_tokens=effective_max_tokens,
                        **sampling,
                    )
                    choices = resp.get("choices", [])
                    return str(choices[0]["message"].get("content", "")) if choices and "message" in choices[0] else None
                except (ValueError, RuntimeError, TypeError, KeyError, IndexError, OSError) as exc2:
                    logger.warning(f"[FALLBACK] GGUF unconstrained inference also failed ({type(exc2).__name__}: {exc2})")
                    return None
            logger.warning(f"[FALLBACK] GGUF inference error ({type(exc).__name__}: {exc})")
            return None

    def _sync_generate_stream(
        self,
        prompt: str,
        system_prompt: str | None,
        max_tokens: int | None = None,
        use_grammar: bool = True,
    ) -> Any:
        if self._model is None:
            self._model = self._load_model()
        if self._model is None:
            yield "No LLM model is currently available (Local GGUF model not active)."
            return
        grammar = self._load_grammar() if use_grammar else None
        model_p = str(getattr(self, "_model_path", ""))
        effective_max_tokens = max_tokens or (512 if "2b" in model_p.lower() else app_settings.llm.max_tokens)
        msgs = _build_messages(prompt, system_prompt, model_p)
        sampling = _build_sampling_kwargs()

        def _iter_with_repeat_guard(stream: Any) -> Any:
            """Yield chunks from stream, halting on runaway token repetition."""
            last_token: str = ""
            repeat_count: int = 0
            for chunk in stream:
                choices = chunk.get("choices", [])
                if choices and "delta" in choices[0]:
                    c = choices[0]["delta"].get("content", "")
                    if c:
                        token = c.strip()
                        if token and token == last_token:
                            repeat_count += 1
                            if repeat_count >= _MAX_CONSECUTIVE_REPEATS:
                                logger.warning(
                                    f"[REPEAT-GUARD] Halted generation: token '{token}' "
                                    f"repeated {repeat_count} times consecutively"
                                )
                                yield "\n[Generation stopped: repetitive output detected]"
                                return
                        else:
                            repeat_count = 1
                            last_token = token
                        yield c

        try:
            resp = self._model.create_chat_completion(
                messages=msgs,
                temperature=app_settings.llm.temperature,
                max_tokens=effective_max_tokens,
                stream=True,
                grammar=grammar,
                **sampling,
            )
            yield from _iter_with_repeat_guard(resp)
        except (ValueError, RuntimeError, TypeError, KeyError, IndexError, OSError) as exc:
            if grammar is not None:
                logger.warning(f"[FALLBACK] GGUF grammar streaming error ({type(exc).__name__}: {exc}) — retrying without grammar")
                try:
                    resp = self._model.create_chat_completion(
                        messages=msgs,
                        temperature=app_settings.llm.temperature,
                        max_tokens=effective_max_tokens,
                        stream=True,
                        **sampling,
                    )
                    yield from _iter_with_repeat_guard(resp)
                    return
                except (ValueError, RuntimeError, TypeError, KeyError, IndexError, OSError) as exc2:
                    logger.warning(f"[FALLBACK] GGUF unconstrained streaming also failed ({type(exc2).__name__}: {exc2})")
            logger.warning(f"[FALLBACK] GGUF streaming error ({type(exc).__name__}: {exc})")
            yield f"\n[Error: {type(exc).__name__}]"

    async def generate_text(
        self,
        prompt: str,
        system_prompt: str | None = None,
        max_tokens: int | None = None,
        use_grammar: bool = False,
        **kwargs: Any,
    ) -> str:
        async with self._queue_lock:
            if self._queue_count >= self._max_queue:
                raise BackpressureError(f"LLM inference queue is full ({self._max_queue} pending)")
            self._queue_count += 1
            position = self._queue_count
        logger.info(f"Queue: request enqueued (position={position})")
        try:
            async with self._semaphore:
                out = await asyncio.to_thread(self._sync_generate, prompt, system_prompt, max_tokens, use_grammar)
                if out and out.strip():
                    return out.strip()
        except BackpressureError:
            raise
        except (ValueError, RuntimeError, OSError) as exc:
            logger.warning(f"Local GGUF: Async generation error ({type(exc).__name__}: {exc})")
        finally:
            async with self._queue_lock:
                self._queue_count -= 1
        return "No LLM model is currently available (Local GGUF model not active)."

    async def generate_text_stream(
        self,
        prompt: str,
        system_prompt: str | None = None,
        max_tokens: int | None = None,
        use_grammar: bool = False,
        **kwargs: Any,
    ) -> AsyncGenerator[str, None]:
        async with self._queue_lock:
            if self._queue_count >= self._max_queue:
                raise BackpressureError(f"LLM inference queue is full ({self._max_queue} pending)")
            self._queue_count += 1
            position = self._queue_count
        logger.info(f"Queue: stream request enqueued (position={position})")
        try:
            if position > 1:
                yield json.dumps({"status": "queued", "position": position})
            async with self._semaphore:
                loop = asyncio.get_running_loop()
                queue: asyncio.Queue[str | object] = asyncio.Queue()

                def worker() -> None:
                    try:
                        gen = self._sync_generate_stream(prompt, system_prompt, max_tokens, use_grammar)
                        for chunk in gen:
                            loop.call_soon_threadsafe(queue.put_nowait, chunk)
                    except (RuntimeError, ValueError, TypeError, OSError) as e:
                        logger.warning(f"Local GGUF: worker thread error ({type(e).__name__}: {e})")
                        loop.call_soon_threadsafe(queue.put_nowait, f"\\n[Error: {type(e).__name__}]")
                    finally:
                        loop.call_soon_threadsafe(queue.put_nowait, _STREAM_END)

                thread = threading.Thread(target=worker)
                thread.start()

                while True:
                    chunk = await queue.get()
                    if chunk is _STREAM_END:
                        break
                    yield chunk  # type: ignore
        except BackpressureError:
            raise
        except (ValueError, RuntimeError, OSError, TypeError) as exc:
            logger.warning(f"Local GGUF: Async stream error ({type(exc).__name__}: {exc})")
            yield "\n[Stream Interrupted]"
        finally:
            async with self._queue_lock:
                self._queue_count -= 1
