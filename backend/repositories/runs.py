from __future__ import annotations

from pathlib import Path
from typing import Any

from config import APP_DB
from repositories.db import init_db, session


def save_run_summary(
    summary: dict[str, Any],
    dataset_id: int | None = None,
    db_path: Path | None = None,
) -> None:
    database = prepare_db(db_path)
    with session(database) as connection:
        connection.execute(
            '''
            INSERT OR REPLACE INTO pipeline_runs (
              run_id, dataset_id, source_file, status, events, cases,
              total_carbon_kg, estimated_saving_kg, result_path, created_at
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ''',
            (
                summary['run_id'],
                dataset_id,
                summary['source'].get('file', ''),
                summary.get('status', 'completed'),
                summary.get('events', 0),
                summary.get('cases', 0),
                summary.get('total_carbon_kg', 0),
                summary.get('estimated_saving_kg', 0),
                summary.get('result_path', ''),
                summary.get('created_at', ''),
            ),
        )


def list_run_summaries(limit: int = 20, db_path: Path | None = None) -> list[dict[str, Any]]:
    database = prepare_db(db_path)
    with session(database) as connection:
        rows = connection.execute(
            'SELECT * FROM pipeline_runs ORDER BY id DESC LIMIT ?',
            (limit,),
        ).fetchall()
    return [dict(row) for row in rows]


def prepare_db(db_path: Path | None) -> Path:
    database = db_path if db_path else APP_DB
    init_db(database)
    return database
