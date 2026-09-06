"""Singleton registry for expensive service instances."""
from __future__ import annotations
import threading
from typing import TypeVar, Callable

_T = TypeVar("_T")
_LOCK = threading.RLock()
_INSTANCES: dict[str, object] = {}

def get_singleton(key: str, factory: Callable[[], _T]) -> _T:
    """Return a cached singleton instance, creating it on first access."""
    if key not in _INSTANCES:
        with _LOCK:
            if key not in _INSTANCES:
                _INSTANCES[key] = factory()
    return _INSTANCES[key]  # type: ignore[return-value]
