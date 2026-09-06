"""Content-addressed local storage for uploaded and generated artifacts."""
from __future__ import annotations

import asyncio
import hashlib
import re
from pathlib import Path
from uuid import uuid4


class ArtifactStore:
    """Writes files beneath one configured workspace directory and prevents traversal."""

    def __init__(self, root: str | Path) -> None:
        self.root = Path(root)
        self.root.mkdir(parents=True, exist_ok=True)

    async def save(self, workspace_id: str, name: str, content: bytes) -> tuple[str, str]:
        return await asyncio.to_thread(self._save, workspace_id, name, content)

    def _save(self, workspace_id: str, name: str, content: bytes) -> tuple[str, str]:
        safe_name = re.sub(r"[^A-Za-z0-9._-]", "_", Path(name).name)[:120] or "upload.bin"
        artifact_id = str(uuid4())
        folder = (self.root / workspace_id).resolve()
        folder.mkdir(parents=True, exist_ok=True)
        target = (folder / f"{artifact_id}_{safe_name}").resolve()
        if folder not in target.parents:
            raise ValueError("Artifact path escaped workspace")
        target.write_bytes(content)
        return str(target), hashlib.sha256(content).hexdigest()

