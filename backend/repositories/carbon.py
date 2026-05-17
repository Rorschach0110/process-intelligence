from __future__ import annotations

from datetime import datetime
from pathlib import Path
from typing import Any

from config import APP_DB
from repositories.db import init_db, session


def save_factor(factor: dict[str, Any], db_path: Path | None = None) -> int:
    database = prepare_db(db_path)
    with session(database) as connection:
        cursor = connection.execute(
            '''
            INSERT INTO carbon_factors
            (name, factor_type, unit, value, source, version, scope, is_active, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            ''',
            (
                factor['name'],
                factor['factor_type'],
                factor['unit'],
                float(factor['value']),
                factor.get('source', 'manual'),
                factor.get('version', 'v1'),
                factor.get('scope', 'Scope 2'),
                1 if factor.get('is_active', True) else 0,
                datetime.now().isoformat(timespec='seconds'),
            ),
        )
        return int(cursor.lastrowid)


def list_factors(db_path: Path | None = None) -> list[dict[str, Any]]:
    database = prepare_db(db_path)
    with session(database) as connection:
        rows = connection.execute('SELECT * FROM carbon_factors ORDER BY id DESC').fetchall()
    return [dict(row) for row in rows]


def active_factor_values(db_path: Path | None = None) -> dict[str, float]:
    factors = list_factors(db_path)
    values: dict[str, float] = {}
    for factor in factors:
        if factor['is_active'] and factor['factor_type'] not in values:
            values[factor['factor_type']] = factor['value']
    return values


def prepare_db(db_path: Path | None) -> Path:
    database = db_path if db_path else APP_DB
    init_db(database)
    return database
