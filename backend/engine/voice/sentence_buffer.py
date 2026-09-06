"""Streaming sentence boundary detector for LLM token-to-TTS sentence pipelining."""
from __future__ import annotations

import re

# Patterns that look like sentence-ending periods but aren't
_ABBREV_RE = re.compile(r"\b(?:e\.g|i\.e|Mr|Mrs|Dr|No|St|vs|IS|Fig|Sec|Vol|etc)\.$", re.IGNORECASE)
_DECIMAL_RE = re.compile(r"\d\.$")


class SentenceBuffer:
    """Accumulates streaming LLM tokens and yields complete sentences."""

    def __init__(self, delimiters: str = ".!?") -> None:
        self._buffer: str = ""
        self._delimiters: set[str] = set(delimiters)

    def add_token(self, token: str) -> list[str]:
        """Add a token to the buffer, return list of completed sentences."""
        self._buffer += token
        sentences: list[str] = []
        while True:
            idx = self._find_boundary()
            if idx < 0:
                break
            sentence = self._buffer[: idx + 1].strip()
            self._buffer = self._buffer[idx + 1 :]
            if sentence:
                sentences.append(sentence)
        return sentences

    def _find_boundary(self) -> int:
        """Return index of the first real sentence boundary, or -1."""
        for i, ch in enumerate(self._buffer):
            if ch not in self._delimiters:
                continue
            prefix = self._buffer[:i + 1]
            # Skip decimal numbers (e.g., "3.14")
            if ch == "." and _DECIMAL_RE.search(prefix):
                continue
            # Skip common abbreviations
            if ch == "." and _ABBREV_RE.search(prefix):
                continue
            return i
        return -1

    def flush(self) -> str | None:
        """Return any remaining buffered text, or None if empty."""
        text = self._buffer.strip()
        self._buffer = ""
        return text if text else None

    def reset(self) -> None:
        """Clear the buffer."""
        self._buffer = ""
