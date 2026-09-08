"""Application settings and configuration loader."""
from __future__ import annotations
import os
from pathlib import Path
from typing import Any
from dotenv import load_dotenv
import yaml
from pydantic import BaseModel, Field

from backend.config.paths import (
    CONFIG_DIR,
    CONFIG_YAML_PATH,
    DATA_DIR,
    DEFAULT_GGUF_MODEL_PATH,
    DOMAIN_EXPANSIONS_PATH,
    EMBEDDING_MODEL_PATH,
    GRAMMAR_FILE_PATH,
    LOGS_DIR,
    PROJECT_ROOT,
    QCO_REGISTRY_PATH,
    RAG_GOLDEN_DATASET_PATH,
    RERANKER_MODEL_PATH,
    SEMANTIC_CACHE_DB_PATH,
    STANDARDS_DB_PATH,
    STT_MODEL_PATH,
    TTS_CACHE_DIR,
    TTS_ENG_MODEL_PATH,
    TTS_HIN_MODEL_PATH,
    UPLOADS_DIR,
    WORKSPACES_DIR,
)

load_dotenv()


class ServerSettings(BaseModel):
    host: str = "127.0.0.1"
    port: int = 8000
    log_level: str = "INFO"
    cors_origins: list[str] = Field(default_factory=lambda: ["*"])


class StorageSettings(BaseModel):
    data_dir: str = str(DATA_DIR)
    standards_file: str = str(STANDARDS_DB_PATH)
    qco_file: str = str(QCO_REGISTRY_PATH)
    upload_dir: str = str(UPLOADS_DIR)
    workspace_dir: str = str(WORKSPACES_DIR)
    rag_golden_dataset: str = str(RAG_GOLDEN_DATASET_PATH)


class AiEngineSettings(BaseModel):
    embedding_model_name: str = str(EMBEDDING_MODEL_PATH)
    multilingual_model_name: str = "sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2"
    similarity_threshold: float = 0.35
    min_relevance_score: float = 0.35
    top_k_recommendations: int = 5
    hybrid_alpha: float = 0.65
    enable_gpu: bool = True
    require_cuda: bool = True
    gpu_device: str = "cuda:0"
    reranker_model: str = str(RERANKER_MODEL_PATH)
    reranker_candidate_pool: int = 25
    domain_expansions_file: str = str(DOMAIN_EXPANSIONS_PATH)
    traditional: bool = False


class LlmSettings(BaseModel):
    provider: str = "local_gguf"
    model_name: str = "Qwen2.5-7B-Instruct-Q4_K_M"
    model_path: str = str(DEFAULT_GGUF_MODEL_PATH)
    n_ctx: int = 4096
    n_threads: int = 4
    n_gpu_layers: int = 24
    chat_format: str = "chatml"
    api_key_env_var: str = "GEMINI_API_KEY"
    openrouter_api_key_env_var: str = "OPENROUTER_API_KEY"
    temperature: float = 0.2
    max_tokens: int = 2048
    enable_grammar: bool = True
    grammar_file: str = str(GRAMMAR_FILE_PATH)
    repeat_penalty: float = 1.18
    frequency_penalty: float = 0.1
    presence_penalty: float = 0.1
    repeat_last_n: int = 256
    top_p: float = 0.9
    max_queue_size: int = 5


class CacheSettings(BaseModel):
    sqlite_db_path: str = str(SEMANTIC_CACHE_DB_PATH)
    similarity_threshold: float = 0.95


class VoiceSettings(BaseModel):
    stt_provider: str = "faster_whisper"
    stt_model_path: str = str(STT_MODEL_PATH)
    stt_device: str = "cpu"
    stt_compute_type: str = "int8"
    stt_beam_size: int = 1
    tts_provider: str = "mms_vits"
    tts_eng_model_path: str = str(TTS_ENG_MODEL_PATH)
    tts_hin_model_path: str = str(TTS_HIN_MODEL_PATH)
    tts_device: str = "cpu"
    default_language: str = "auto"
    max_audio_duration_sec: int = 60
    audio_sample_rate: int = 16000
    tts_cache_dir: str = str(TTS_CACHE_DIR)
    stt_task: str = "transcribe"
    stt_initial_prompt: str = "BIS Bureau of Indian Standards voice conversation. Hello, Hi."
    live_enabled: bool = True
    live_max_turns: int = 5
    live_sentence_delimiters: str = ".!?"


class BisScraperSettings(BaseModel):
    base_url: str = "https://www.services.bis.gov.in"
    qco_portal_url: str = "https://www.bis.gov.in/product-certification"
    request_timeout_sec: int = 15
    user_agent: str = "Mozilla/5.0"


class LoggingSettings(BaseModel):
    log_dir: str = str(LOGS_DIR)
    log_file: str = str(LOGS_DIR / "backend.log")
    level: str = "INFO"
    rotation_max_bytes: int = 10_485_760
    backup_count: int = 5


class DistributedReasoningSettings(BaseModel):
    mac_available: bool = True
    mac_endpoint: str = "http://10.118.237.94:5008/reason"
    local_preprocessor_model: str = "llm/Qwen2.5-3B-Instruct-Q4_K_M.gguf"
    fast_model_n_ctx: int = 4096
    thinking_model_n_ctx: int = 32768
    fast_model_n_gpu_layers: int = 36
    fast_model_kv_quant: str = "q8_0"
    fast_model_rope_freq_scale: float = 1.0
    mac_timeout_sec: float = 25.0


class WebSearchSettings(BaseModel):
    enabled: bool = False
    provider: str = "duckduckgo"
    request_timeout_sec: int = 6
    fast_answer_top_k: int = 2
    fast_answer_max_tokens: int = 300
    heavy_reasoning_top_k: int = 3
    heavy_reasoning_max_tokens: int = 500
    cache_ttl_hours: int = 24
    guardrail_config: str = str(CONFIG_DIR / "web_search_domains.yaml")


class AppSettings(BaseModel):
    distributed_reasoning: DistributedReasoningSettings = Field(default_factory=DistributedReasoningSettings)
    server: ServerSettings = Field(default_factory=ServerSettings)
    storage: StorageSettings = Field(default_factory=StorageSettings)
    ai_engine: AiEngineSettings = Field(default_factory=AiEngineSettings)
    llm: LlmSettings = Field(default_factory=LlmSettings)
    cache: CacheSettings = Field(default_factory=CacheSettings)
    voice: VoiceSettings = Field(default_factory=VoiceSettings)
    bis_scraper: BisScraperSettings = Field(default_factory=BisScraperSettings)
    logging: LoggingSettings = Field(default_factory=LoggingSettings)
    web_search: WebSearchSettings = Field(default_factory=WebSearchSettings)


def _resolve_relative_path(val: Any) -> Any:
    """If a value is a string path that is relative, anchor it to PROJECT_ROOT."""
    if isinstance(val, str) and val.strip():
        val_str = val.strip()
        # Avoid treating urls or model hub identifiers as relative paths
        if (
            not val_str.startswith("http://")
            and not val_str.startswith("https://")
            and not os.path.isabs(val_str)
            and ("/" in val_str or "\\" in val_str)
        ):
            candidate = PROJECT_ROOT / val_str
            if candidate.exists() or val_str.startswith(("backend", "llm", "vectordb", "data", "logs", "tests")):
                return str(candidate)
    return val


def _normalize_dict_paths(data: dict[str, Any]) -> dict[str, Any]:
    """Recursively resolve relative path strings in parsed configuration dictionary."""
    normalized: dict[str, Any] = {}
    for k, v in data.items():
        if isinstance(v, dict):
            normalized[k] = _normalize_dict_paths(v)
        elif isinstance(v, list):
            normalized[k] = [_resolve_relative_path(item) for item in v]
        else:
            normalized[k] = _resolve_relative_path(v)
    return normalized


def load_settings(config_path: str | Path | None = None) -> AppSettings:
    cfg_path = Path(config_path) if config_path else CONFIG_YAML_PATH
    raw_data: dict[str, Any] = {}
    if cfg_path.exists():
        try:
            with open(cfg_path, "r", encoding="utf-8") as fh:
                parsed = yaml.safe_load(fh)
                if isinstance(parsed, dict):
                    raw_data = _normalize_dict_paths(parsed)
        except (yaml.YAMLError, OSError, ValueError) as exc:
            import warnings
            warnings.warn(f"Failed to parse config at {cfg_path}: {exc}", RuntimeWarning, stacklevel=2)
            raw_data = {}
    env_mac = os.getenv("MAC_AVAILABLE")
    if env_mac is not None:
        if "distributed_reasoning" not in raw_data or not isinstance(raw_data["distributed_reasoning"], dict):
            raw_data["distributed_reasoning"] = {}
        raw_data["distributed_reasoning"]["mac_available"] = env_mac.strip().lower() in ("1", "true", "yes", "on")
    env_endpoint = os.getenv("MAC_ENDPOINT")
    if env_endpoint is not None and env_endpoint.strip():
        if "distributed_reasoning" not in raw_data or not isinstance(raw_data["distributed_reasoning"], dict):
            raw_data["distributed_reasoning"] = {}
        raw_data["distributed_reasoning"]["mac_endpoint"] = env_endpoint.strip()
    env_fast_ctx = os.getenv("FAST_MODEL_N_CTX")
    if env_fast_ctx is not None and env_fast_ctx.strip().isdigit():
        if "distributed_reasoning" not in raw_data or not isinstance(raw_data["distributed_reasoning"], dict):
            raw_data["distributed_reasoning"] = {}
        raw_data["distributed_reasoning"]["fast_model_n_ctx"] = int(env_fast_ctx.strip())
    env_thinking_ctx = os.getenv("THINKING_MODEL_N_CTX") or os.getenv("N_CTX")
    if env_thinking_ctx is not None and env_thinking_ctx.strip().isdigit():
        ctx_val = int(env_thinking_ctx.strip())
        if "distributed_reasoning" not in raw_data or not isinstance(raw_data["distributed_reasoning"], dict):
            raw_data["distributed_reasoning"] = {}
        raw_data["distributed_reasoning"]["thinking_model_n_ctx"] = ctx_val
        if "llm" not in raw_data or not isinstance(raw_data["llm"], dict):
            raw_data["llm"] = {}
        raw_data["llm"]["n_ctx"] = ctx_val
    env_ws = os.getenv("WEB_SEARCH_ENABLED")
    if env_ws is not None:
        if "web_search" not in raw_data or not isinstance(raw_data["web_search"], dict):
            raw_data["web_search"] = {}
        raw_data["web_search"]["enabled"] = env_ws.strip().lower() in ("1", "true", "yes", "on")
    env_require_cuda = os.getenv("REQUIRE_CUDA")
    if env_require_cuda is not None:
        if "ai_engine" not in raw_data or not isinstance(raw_data["ai_engine"], dict):
            raw_data["ai_engine"] = {}
        raw_data["ai_engine"]["require_cuda"] = env_require_cuda.strip().lower() in ("1", "true", "yes", "on")
    env_min_score = os.getenv("MIN_RELEVANCE_SCORE") or os.getenv("SIMILARITY_THRESHOLD")
    if env_min_score is not None:
        try:
            score_val = float(env_min_score.strip())
            if "ai_engine" not in raw_data or not isinstance(raw_data["ai_engine"], dict):
                raw_data["ai_engine"] = {}
            raw_data["ai_engine"]["similarity_threshold"] = score_val
            raw_data["ai_engine"]["min_relevance_score"] = score_val
        except ValueError:
            pass
    return AppSettings.model_validate(raw_data)


app_settings: AppSettings = load_settings()
