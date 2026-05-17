from __future__ import annotations

import json
from datetime import datetime
from pathlib import Path
from typing import Any

from config import APP_DB
from repositories.db import init_db, session


def save_graph_snapshot(run_id: str, graph: dict[str, Any], db_path: Path | None = None) -> int:
    database = prepare_db(db_path)
    with session(database) as connection:
        cursor = connection.execute(
            '''
            INSERT INTO graph_snapshots (run_id, schema_version, graph_json, created_at)
            VALUES (?, ?, ?, ?)
            ''',
            (
                run_id,
                graph.get('schema_version', 'graph.v1'),
                json.dumps(graph, ensure_ascii=False),
                datetime.now().isoformat(timespec='seconds'),
            ),
        )
        return int(cursor.lastrowid)


def list_graph_snapshots(db_path: Path | None = None) -> list[dict[str, Any]]:
    database = prepare_db(db_path)
    with session(database) as connection:
        rows = connection.execute('SELECT * FROM graph_snapshots ORDER BY id DESC').fetchall()
    return [decode(row) for row in rows]


def decode(row: Any) -> dict[str, Any]:
    data = dict(row)
    data['graph'] = json.loads(data.pop('graph_json'))
    return data


def prepare_db(db_path: Path | None) -> Path:
    database = db_path if db_path else APP_DB
    init_db(database)
    return database
