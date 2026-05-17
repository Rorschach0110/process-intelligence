from __future__ import annotations

from datetime import datetime
from pathlib import Path

from config import APP_DB
from repositories.db import init_db, session


def record_llm_audit(
    provider: str,
    prompt_summary: str,
    status: str,
    error: str = '',
    used_fallback: bool = False,
    db_path: Path | None = None,
) -> None:
    database = db_path if db_path else APP_DB
    init_db(database)
    with session(database) as connection:
        connection.execute(
            '''
            INSERT INTO llm_audit_logs
            (provider, prompt_summary, status, error, used_fallback, created_at)
            VALUES (?, ?, ?, ?, ?, ?)
            ''',
            (
                provider,
                prompt_summary,
                status,
                error,
                1 if used_fallback else 0,
                datetime.now().isoformat(timespec='seconds'),
            ),
        )
