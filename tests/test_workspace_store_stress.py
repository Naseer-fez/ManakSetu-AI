"""Empirical stress and edge-case testing for WorkspaceStore."""
from __future__ import annotations

import asyncio
from pathlib import Path
import pytest
from backend.engine.workspace_store import WorkspaceStore


@pytest.mark.asyncio
async def test_workspace_store_concurrency(tmp_path: Path) -> None:
    """Stress test concurrent writes and reads across 10 distinct workspaces."""
    store = WorkspaceStore(tmp_path)
    workspace_ids = [await store.create(f"Workspace {i}") for i in range(10)]

    async def worker_write_and_read(ws_id: str, count: int) -> list[dict[str, str]]:
        for i in range(count):
            role = "user" if i % 2 == 0 else "assistant"
            await store.add_message(ws_id, role, f"Message {i} for {ws_id}")
        return await store.get_messages(ws_id, limit=count)

    tasks = [worker_write_and_read(ws_id, 15) for ws_id in workspace_ids]
    results = await asyncio.gather(*tasks)

    assert len(results) == 10
    for idx, msgs in enumerate(results):
        assert len(msgs) == 15
        assert msgs[0]["content"] == f"Message 0 for {workspace_ids[idx]}"
        assert msgs[-1]["content"] == f"Message 14 for {workspace_ids[idx]}"


@pytest.mark.asyncio
async def test_workspace_store_limit_boundaries(tmp_path: Path) -> None:
    """Verify limit edge cases: 0, negative, 1, exact, and oversized limits."""
    store = WorkspaceStore(tmp_path)
    ws_id = await store.create("Limit Test")
    for i in range(5):
        await store.add_message(ws_id, "user", f"Turn {i}")

    assert await store.get_messages(ws_id, limit=0) == []
    assert await store.get_messages(ws_id, limit=-1) == []
    assert await store.get_messages(ws_id, limit=-100) == []

    one_msg = await store.get_messages(ws_id, limit=1)
    assert len(one_msg) == 1
    assert one_msg[0]["content"] == "Turn 4"

    all_five = await store.get_messages(ws_id, limit=5)
    assert len(all_five) == 5
    assert [m["content"] for m in all_five] == [f"Turn {i}" for i in range(5)]

    oversized = await store.get_messages(ws_id, limit=100)
    assert len(oversized) == 5

    assert await store.get_messages("", limit=10) == []
    assert await store.get_messages("non-existent-id", limit=10) == []


@pytest.mark.asyncio
async def test_workspace_store_chronological_ordering(tmp_path: Path) -> None:
    """Verify chronological ordering across multiple conversational turns."""
    store = WorkspaceStore(tmp_path)
    ws_id = await store.create("Order Test")
    for i in range(20):
        await store.add_message(ws_id, "user" if i % 2 == 0 else "assistant", f"Turn-{i:02d}")

    recent_five = await store.get_messages(ws_id, limit=5)
    expected_order = [f"Turn-{i:02d}" for i in range(15, 20)]
    actual_order = [m["content"] for m in recent_five]
    assert actual_order == expected_order

    recent_ten = await store.get_messages(ws_id, limit=10)
    assert [m["content"] for m in recent_ten] == [f"Turn-{i:02d}" for i in range(10, 20)]


@pytest.mark.asyncio
async def test_workspace_store_sql_injection_resilience(tmp_path: Path) -> None:
    """Verify parameterized queries block SQL injection payloads in workspace_id."""
    store = WorkspaceStore(tmp_path)
    injection_ids = [
        "'; DROP TABLE messages; --",
        "1 OR 1=1",
        "' UNION SELECT * FROM workspaces --",
    ]
    for bad_id in injection_ids:
        msgs = await store.get_messages(bad_id, limit=10)
        assert msgs == []

    ws_id = await store.create("Sanity")
    await store.add_message(ws_id, "user", "Alive after injection attempts")
    res = await store.get_messages(ws_id, limit=5)
    assert len(res) == 1
    assert res[0]["content"] == "Alive after injection attempts"


@pytest.mark.asyncio
async def test_workspace_store_clear_messages(tmp_path: Path) -> None:
    """Verify clear_messages removes only the target workspace messages."""
    store = WorkspaceStore(tmp_path)
    ws1 = await store.create("WS 1")
    ws2 = await store.create("WS 2")
    await store.add_message(ws1, "user", "Hello WS 1")
    await store.add_message(ws2, "user", "Hello WS 2")

    assert len(await store.get_messages(ws1)) == 1
    assert len(await store.get_messages(ws2)) == 1

    await store.clear_messages(ws1)
    assert len(await store.get_messages(ws1)) == 0
    assert len(await store.get_messages(ws2)) == 1
