from __future__ import annotations

import json
from datetime import datetime
from pathlib import Path
from typing import Any

from config import APP_DB
from repositories.db import init_db, session


def save_mapping_template(
    name: str,
    mapping: dict[str, str],
    db_path: Path | None = None,
) -> int:
    database = prepare_db(db_path)
    with session(database) as connection:
        cursor = connection.execute(
            '''
            INSERT OR REPLACE INTO field_mapping_templates
            (id, name, mapping_json, created_at)
            VALUES (
              (SELECT id FROM field_mapping_templates WHERE name = ?),
              ?, ?, ?
            )
            ''',
            (name, name, json.dumps(mapping, ensure_ascii=False), datetime.now().isoformat(timespec='seconds')),
        )
        return int(cursor.lastrowid or template_id(name, database) or 0)


def list_mapping_templates(db_path: Path | None = None) -> list[dict[str, Any]]:
    database = prepare_db(db_path)
    with session(database) as connection:
        rows = connection.execute(
            'SELECT * FROM field_mapping_templates ORDER BY id DESC'
        ).fetchall()
    return [decode(row) for row in rows]


def template_id(name: str, db_path: Path) -> int | None:
    with session(db_path) as connection:
        row = connection.execute(
            'SELECT id FROM field_mapping_templates WHERE name = ?',
            (name,),
        ).fetchone()
    return int(row['id']) if row else None


def decode(row: Any) -> dict[str, Any]:
    data = dict(row)
    data['mapping'] = json.loads(data.pop('mapping_json'))
    return data


def prepare_db(db_path: Path | None) -> Path:
    database = db_path if db_path else APP_DB
    init_db(database)
    return database
