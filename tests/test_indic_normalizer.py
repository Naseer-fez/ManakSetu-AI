"""Tests for Indic script normalization and Urdu to Devanagari transliteration."""
import pytest
from backend.engine.voice.indic_normalizer import (
    get_stt_prompt,
    is_urdu_script,
    urdu_to_devanagari,
)


def test_is_urdu_script() -> None:
    assert is_urdu_script("ابکہ دنی کسا ہے.") is True
    assert is_urdu_script("Hello world") is False
    assert is_urdu_script("नमस्ते दुनिया") is False
    assert is_urdu_script("") is False


def test_urdu_to_devanagari_common_phrases() -> None:
    # User's actual test query from log: 'ابکہ دنی کسا ہے.'
    res = urdu_to_devanagari("ابکہ دنی کسا ہے.")
    assert "आपका" in res
    assert "दिन" in res
    assert "कैसा" in res
    assert "है" in res


def test_urdu_to_devanagari_passthrough_non_urdu() -> None:
    assert urdu_to_devanagari("Hello world") == "Hello world"
    assert urdu_to_devanagari("नमस्ते भारत") == "नमस्ते भारत"


def test_get_stt_prompt() -> None:
    hi_prompt = get_stt_prompt("hi")
    assert "भारतीय मानक ब्यूरो" in hi_prompt
    en_prompt = get_stt_prompt("en")
    assert "Bureau of Indian Standards" in en_prompt
