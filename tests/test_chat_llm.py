"""Tests for chat_llm CLI and model loader."""
from __future__ import annotations
import pytest
from unittest.mock import MagicMock, patch
from chat_llm import load_model, chat_loop


def test_load_model_invalid_choice() -> None:
    """Verify ValueError is raised on unsupported model identifier."""
    with pytest.raises(ValueError, match="Unknown model 'invalid'"):
        load_model("invalid")


def test_load_model_missing_file(monkeypatch: pytest.MonkeyPatch) -> None:
    """Verify FileNotFoundError is raised if model binary does not exist."""
    from pathlib import Path
    from chat_llm import MODEL_PATHS
    monkeypatch.setitem(MODEL_PATHS, "test_model", Path("nonexistent.gguf"))
    with pytest.raises(FileNotFoundError):
        load_model("test_model")


def test_chat_loop_exit() -> None:
    """Verify chat_loop gracefully terminates on 'exit' input."""
    mock_llm = MagicMock()
    with patch("builtins.input", side_effect=["exit"]):
        chat_loop(mock_llm, "3b")
    mock_llm.create_chat_completion.assert_not_called()


def test_chat_loop_single_turn() -> None:
    """Verify chat_loop sends messages without system prompt."""
    mock_llm = MagicMock()
    mock_llm.create_chat_completion.return_value = [
        {"choices": [{"delta": {"content": "Hello"}}]},
        {"choices": [{"delta": {"content": " there!"}}]}
    ]
    with patch("builtins.input", side_effect=["Hi", "quit"]):
        chat_loop(mock_llm, "3b")
    
    mock_llm.create_chat_completion.assert_called_once()
    call_kwargs = mock_llm.create_chat_completion.call_args[1]
    assert call_kwargs["messages"] == [{"role": "user", "content": "Hi"}]
