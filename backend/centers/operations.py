from __future__ import annotations

import json
import platform
import sqlite3
from datetime import datetime
from pathlib import Path
from typing import Any

from config import APP_DB, REPORTS_DIR, RUNS_DIR, UPLOAD_DIR
from repositories.db import init_db, session


def ensure_default_user() -> None:
    init_db()
    with session(APP_DB) as connection:
        connection.execute(
            '''
            INSERT OR IGNORE INTO users (username, role, organization, created_at)
            VALUES (?, ?, ?, ?)
            ''',
            ('admin', 'Admin', 'Default Organization', datetime.now().isoformat(timespec='seconds')),
        )


def audit(actor: str, action: str, target: str, detail: dict[str, Any]) -> None:
    init_db()
    with session(APP_DB) as connection:
        connection.execute(
            'INSERT INTO audit_logs (actor, action, target, detail_json, created_at) VALUES (?, ?, ?, ?, ?)',
            (actor, action, target, json.dumps(detail, ensure_ascii=False), datetime.now().isoformat(timespec='seconds')),
        )


def health_details() -> dict[str, Any]:
    init_db()
    return {
        'status': 'ok',
        'database': APP_DB.exists(),
        'uploads_dir': UPLOAD_DIR.exists(),
        'runs_dir': RUNS_DIR.exists(),
        'reports_dir': REPORTS_DIR.exists(),
        'python': platform.python_version(),
        'sqlite': sqlite3.sqlite_version,
    }


def diagnostics() -> dict[str, Any]:
    init_db()
    with session(APP_DB) as connection:
        tables = ['datasets', 'pipeline_runs', 'reports', 'audit_logs']
        counts = {table: connection.execute(f'SELECT COUNT(*) AS count FROM {table}').fetchone()['count'] for table in tables}
    return {'generated_at': datetime.now().isoformat(timespec='seconds'), 'health': health_details(), 'counts': counts}


def save_setting(key: str, value: dict[str, Any]) -> None:
    init_db()
    with session(APP_DB) as connection:
        connection.execute(
            'INSERT OR REPLACE INTO app_settings (key, value_json, updated_at) VALUES (?, ?, ?)',
            (key, json.dumps(value, ensure_ascii=False), datetime.now().isoformat(timespec='seconds')),
        )


def backup_manifest() -> dict[str, Any]:
    paths = [APP_DB, UPLOAD_DIR, RUNS_DIR, REPORTS_DIR]
    return {'items': [str(path) for path in paths], 'created_at': datetime.now().isoformat(timespec='seconds')}
