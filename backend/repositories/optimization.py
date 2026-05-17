from __future__ import annotations

import json
from datetime import datetime
from pathlib import Path
from typing import Any

from config import APP_DB
from repositories.db import init_db, session


def save_recommendations(run_id: str, items: list[dict[str, Any]], db_path: Path | None = None) -> None:
    database = prepare_db(db_path)
    with session(database) as connection:
        for item in items:
            connection.execute(
                '''
                INSERT INTO optimization_recommendations
                (run_id, title, status, confidence, risk_json, evidence_json, created_at)
                VALUES (?, ?, ?, ?, ?, ?, ?)
                ''',
                (
                    run_id,
                    item['title'],
                    item.get('status', 'pending_review'),
                    item.get('confidence', 0),
                    json.dumps(item.get('risk', {}), ensure_ascii=False),
                    json.dumps(item.get('evidence', {}), ensure_ascii=False),
                    datetime.now().isoformat(timespec='seconds'),
                ),
            )


def list_recommendations(db_path: Path | None = None) -> list[dict[str, Any]]:
    database = prepare_db(db_path)
    with session(database) as connection:
        rows = connection.execute('SELECT * FROM optimization_recommendations ORDER BY id DESC').fetchall()
    return [decode(row) for row in rows]


def save_provider(provider: dict[str, Any], db_path: Path | None = None) -> int:
    database = prepare_db(db_path)
    with session(database) as connection:
        cursor = connection.execute(
            '''
            INSERT OR REPLACE INTO llm_providers
            (id, name, base_url, model, is_active, created_at)
            VALUES ((SELECT id FROM llm_providers WHERE name = ?), ?, ?, ?, ?, ?)
            ''',
            (
                provider['name'],
                provider['name'],
                provider['base_url'],
                provider['model'],
                1 if provider.get('is_active', True) else 0,
                datetime.now().isoformat(timespec='seconds'),
            ),
        )
        return int(cursor.lastrowid or 0)


def list_providers(db_path: Path | None = None) -> list[dict[str, Any]]:
    database = prepare_db(db_path)
    with session(database) as connection:
        rows = connection.execute('SELECT * FROM llm_providers ORDER BY id DESC').fetchall()
    return [dict(row) for row in rows]


def decode(row: Any) -> dict[str, Any]:
    data = dict(row)
    data['risk'] = json.loads(data.pop('risk_json'))
    data['evidence'] = json.loads(data.pop('evidence_json'))
    return data


def prepare_db(db_path: Path | None) -> Path:
    database = db_path if db_path else APP_DB
    init_db(database)
    return database
