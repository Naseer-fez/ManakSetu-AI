"""Local SQLite workspace persistence for tender documents and revisions."""
from __future__ import annotations

import asyncio
import sqlite3
from pathlib import Path
from uuid import uuid4
from backend.models.document_contracts import ComplianceRun, Revision, TemplateProfile

_VALID_TABLES = frozenset({"runs", "revisions", "templates"})


class WorkspaceStore:
    """Stores metadata and audit history while files remain in the configured workspace root."""

    def __init__(self, root: str | Path) -> None:
        self.root = Path(root)
        self.root.mkdir(parents=True, exist_ok=True)
        self.db_path = self.root / "workspaces.sqlite3"
        self._init_db()

    def _connect(self) -> sqlite3.Connection:
        conn = sqlite3.connect(self.db_path)
        conn.row_factory = sqlite3.Row
        return conn

    def _init_db(self) -> None:
        with self._connect() as conn:
            conn.execute("PRAGMA journal_mode=WAL")
            conn.executescript("""
                CREATE TABLE IF NOT EXISTS workspaces (id TEXT PRIMARY KEY, name TEXT NOT NULL, created_at TEXT DEFAULT CURRENT_TIMESTAMP);
                CREATE TABLE IF NOT EXISTS documents (id TEXT PRIMARY KEY, workspace_id TEXT NOT NULL, name TEXT NOT NULL, path TEXT NOT NULL, sha256 TEXT NOT NULL, text TEXT DEFAULT '');
                CREATE TABLE IF NOT EXISTS runs (id TEXT PRIMARY KEY, workspace_id TEXT NOT NULL, payload TEXT NOT NULL);
                CREATE TABLE IF NOT EXISTS messages (id TEXT PRIMARY KEY, workspace_id TEXT NOT NULL, role TEXT NOT NULL, content TEXT NOT NULL, created_at TEXT DEFAULT CURRENT_TIMESTAMP);
                CREATE TABLE IF NOT EXISTS revisions (id TEXT PRIMARY KEY, workspace_id TEXT NOT NULL, payload TEXT NOT NULL);
                CREATE TABLE IF NOT EXISTS templates (id TEXT PRIMARY KEY, workspace_id TEXT NOT NULL, payload TEXT NOT NULL);
            """)

    async def create(self, name: str) -> str:
        workspace_id = str(uuid4())
        await asyncio.to_thread(self._insert_workspace, workspace_id, name)
        return workspace_id

    def _insert_workspace(self, workspace_id: str, name: str) -> None:
        (self.root / workspace_id).mkdir(exist_ok=True)
        with self._connect() as conn:
            conn.execute("INSERT INTO workspaces(id,name) VALUES(?,?)", (workspace_id, name))

    async def add_document(self, workspace_id: str, name: str, path: str, sha256: str, text: str) -> str:
        document_id = str(uuid4())
        await asyncio.to_thread(self._insert_document, document_id, workspace_id, name, path, sha256, text)
        return document_id

    def _insert_document(self, *values: str) -> None:
        with self._connect() as conn:
            conn.execute("INSERT INTO documents(id,workspace_id,name,path,sha256,text) VALUES(?,?,?,?,?,?)", values)

    async def save_run(self, workspace_id: str, run: ComplianceRun) -> None:
        await asyncio.to_thread(self._save_json, "runs", workspace_id, run.run_id, run.model_dump_json())

    async def save_revision(self, workspace_id: str, revision: Revision) -> None:
        await asyncio.to_thread(self._save_json, "revisions", workspace_id, revision.revision_id, revision.model_dump_json())

    async def save_template(self, workspace_id: str, template: TemplateProfile) -> None:
        template_id = template.template_id
        await asyncio.to_thread(self._save_json, "templates", workspace_id, template_id, template.model_dump_json())

    async def get_template(self, template_id: str) -> TemplateProfile | None:
        return await asyncio.to_thread(self._read_template, template_id)

    def _read_template(self, template_id: str) -> TemplateProfile | None:
        with self._connect() as conn:
            row = conn.execute("SELECT payload FROM templates WHERE id=?", (template_id,)).fetchone()
            return TemplateProfile.model_validate_json(row["payload"]) if row else None

    def _save_json(self, table: str, workspace_id: str, key: str, payload: str) -> None:
        if table not in _VALID_TABLES:
            raise ValueError(f"Invalid table name: {table}")
        with self._connect() as conn:
            conn.execute(f"INSERT OR REPLACE INTO {table}(id,workspace_id,payload) VALUES(?,?,?)", (key, workspace_id, payload))

    async def add_message(self, workspace_id: str, role: str, content: str) -> None:
        await asyncio.to_thread(self._insert_message, str(uuid4()), workspace_id, role, content)

    def _insert_message(self, message_id: str, workspace_id: str, role: str, content: str) -> None:
        with self._connect() as conn:
            conn.execute("INSERT INTO messages(id,workspace_id,role,content) VALUES(?,?,?,?)", (message_id, workspace_id, role, content))

    async def get_messages(self, workspace_id: str, limit: int = 20) -> list[dict[str, str]]:
        """Retrieve recent conversation history in chronological order."""
        if not workspace_id or limit <= 0:
            return []
        return await asyncio.to_thread(self._read_messages, workspace_id, limit)

    def _read_messages(self, workspace_id: str, limit: int) -> list[dict[str, str]]:
        try:
            with self._connect() as conn:
                rows = conn.execute(
                    "SELECT role, content FROM (SELECT role, content, rowid FROM messages WHERE workspace_id=? ORDER BY rowid DESC LIMIT ?) ORDER BY rowid ASC",
                    (workspace_id, limit),
                ).fetchall()
                return [{"role": str(row["role"]), "content": str(row["content"])} for row in rows]
        except sqlite3.Error:
            return []

    async def get_workspace(self, workspace_id: str) -> dict[str, object] | None:
        return await asyncio.to_thread(self._read_workspace, workspace_id)

    async def get_document(self, workspace_id: str) -> dict[str, str] | None:
        return await asyncio.to_thread(self._read_document, workspace_id)

    def _read_document(self, workspace_id: str) -> dict[str, str] | None:
        with self._connect() as conn:
            row = conn.execute("SELECT id,name,path,sha256,text FROM documents WHERE workspace_id=? ORDER BY rowid DESC LIMIT 1", (workspace_id,)).fetchone()
            return dict(row) if row else None

    async def get_revision(self, revision_id: str) -> Revision | None:
        return await asyncio.to_thread(self._read_revision, revision_id)

    async def get_latest_run(self, workspace_id: str) -> ComplianceRun | None:
        return await asyncio.to_thread(self._read_run, workspace_id)

    def _read_run(self, workspace_id: str) -> ComplianceRun | None:
        with self._connect() as conn:
            row = conn.execute("SELECT payload FROM runs WHERE workspace_id=? ORDER BY rowid DESC LIMIT 1", (workspace_id,)).fetchone()
            return ComplianceRun.model_validate_json(row["payload"]) if row else None

    def _read_revision(self, revision_id: str) -> Revision | None:
        with self._connect() as conn:
            row = conn.execute("SELECT payload FROM revisions WHERE id=?", (revision_id,)).fetchone()
            return Revision.model_validate_json(row["payload"]) if row else None

    def _read_workspace(self, workspace_id: str) -> dict[str, object] | None:
        with self._connect() as conn:
            row = conn.execute("SELECT id,name,created_at FROM workspaces WHERE id=?", (workspace_id,)).fetchone()
            if not row:
                return None
            docs = conn.execute("SELECT id,name,sha256 FROM documents WHERE workspace_id=?", (workspace_id,)).fetchall()
            return {"id": row["id"], "name": row["name"], "created_at": row["created_at"], "documents": [dict(d) for d in docs]}
