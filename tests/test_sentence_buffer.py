"""Tests for the SentenceBuffer streaming sentence detector."""
from __future__ import annotations

import pytest
from backend.engine.voice.sentence_buffer import SentenceBuffer


def test_simple_sentence() -> None:
    buf = SentenceBuffer()
    result = buf.add_token("Hello world. ")
    assert result == ["Hello world."]


def test_multiple_sentences_in_one_token() -> None:
    buf = SentenceBuffer()
    result = buf.add_token("First. Second. ")
    assert len(result) == 2
    assert result[0] == "First."
    assert result[1] == "Second."


def test_partial_token_no_sentence() -> None:
    buf = SentenceBuffer()
    assert buf.add_token("Hello ") == []
    assert buf.add_token("world") == []


def test_token_completes_sentence() -> None:
    buf = SentenceBuffer()
    buf.add_token("Hello ")
    buf.add_token("world")
    result = buf.add_token(". ")
    assert result == ["Hello world."]


def test_flush_returns_remaining() -> None:
    buf = SentenceBuffer()
    buf.add_token("Partial text")
    assert buf.flush() == "Partial text"


def test_flush_returns_none_when_empty() -> None:
    buf = SentenceBuffer()
    assert buf.flush() is None


def test_flush_clears_buffer() -> None:
    buf = SentenceBuffer()
    buf.add_token("Some text")
    buf.flush()
    assert buf.flush() is None


def test_question_mark_delimiter() -> None:
    buf = SentenceBuffer()
    result = buf.add_token("How are you? ")
    assert result == ["How are you?"]


def test_exclamation_delimiter() -> None:
    buf = SentenceBuffer()
    result = buf.add_token("Great! ")
    assert result == ["Great!"]


def test_reset_clears_buffer() -> None:
    buf = SentenceBuffer()
    buf.add_token("Some text")
    buf.reset()
    assert buf.flush() is None


def test_empty_token() -> None:
    buf = SentenceBuffer()
    assert buf.add_token("") == []


def test_custom_delimiters() -> None:
    buf = SentenceBuffer(delimiters=";")
    result = buf.add_token("Part one; Part two; ")
    assert len(result) == 2
