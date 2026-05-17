from __future__ import annotations

import json
from datetime import datetime
from pathlib import Path
from typing import Any

from config import APP_DB
from repositories.db import init_db, session


def upsert_dataset(
    file_path: str,
    fields: list[str],
    preview: list[dict[str, Any]],
    db_path: Path | None = None,
    row_count: int | None = None,
) -> int:
    database = prepare_db(db_path)
    name = Path(file_path).name
    with session(database) as connection:
        existing = connection.execute(
            'SELECT id FROM datasets WHERE file_path = ?',
            (file_path,),
        ).fetchone()
        if existing:
            return int(existing['id'])
        cursor = connection.execute(
            '''
            INSERT INTO datasets (name, file_path, field_count, row_count, created_at)
            VALUES (?, ?, ?, ?, ?)
            ''',
            (
                name,
                file_path,
                len(fields),
                row_count if row_count is not None else len(preview),
                datetime.now().isoformat(timespec='seconds'),
            ),
        )
        return int(cursor.lastrowid)


def list_datasets(db_path: Path | None = None) -> list[dict[str, Any]]:
    database = prepare_db(db_path)
    with session(database) as connection:
        rows = connection.execute(
            'SELECT * FROM datasets ORDER BY id DESC LIMIT 50'
        ).fetchall()
    return [dict(row) for row in rows]


def get_dataset(dataset_id: int, db_path: Path | None = None) -> dict[str, Any] | None:
    database = prepare_db(db_path)
    with session(database) as connection:
        row = connection.execute('SELECT * FROM datasets WHERE id = ?', (dataset_id,)).fetchone()
    return dict(row) if row else None


def save_dataset_profile(
    dataset_id: int,
    mapping: dict[str, str],
    quality: dict[str, Any],
    db_path: Path | None = None,
) -> None:
    database = prepare_db(db_path)
    with session(database) as connection:
        connection.execute(
            '''
            INSERT OR REPLACE INTO dataset_profiles
            (dataset_id, mapping_json, quality_json, created_at)
            VALUES (?, ?, ?, ?)
            ''',
            (
                dataset_id,
                json.dumps(mapping, ensure_ascii=False),
                json.dumps(quality, ensure_ascii=False),
                datetime.now().isoformat(timespec='seconds'),
            ),
        )


def get_dataset_profile(dataset_id: int, db_path: Path | None = None) -> dict[str, Any] | None:
    database = prepare_db(db_path)
    with session(database) as connection:
        row = connection.execute(
            'SELECT * FROM dataset_profiles WHERE dataset_id = ?',
            (dataset_id,),
        ).fetchone()
    if not row:
        return None
    data = dict(row)
    data['mapping'] = json.loads(data.pop('mapping_json'))
    data['quality'] = json.loads(data.pop('quality_json'))
    return data


def dataset_id_for_file(file_path: str, db_path: Path | None = None) -> int | None:
    database = prepare_db(db_path)
    with session(database) as connection:
        row = connection.execute(
            'SELECT id FROM datasets WHERE file_path = ?',
            (file_path,),
        ).fetchone()
    return int(row['id']) if row else None


def prepare_db(db_path: Path | None) -> Path:
    database = db_path if db_path else APP_DB
    init_db(database)
    return database
