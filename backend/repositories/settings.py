from __future__ import annotations

import json
from pathlib import Path
from typing import Any

from config import APP_DB
from repositories.db import init_db, session


def get_setting(key: str, db_path: Path | None = None) -> dict[str, Any] | None:
    database = db_path if db_path else APP_DB
    init_db(database)
    with session(database) as connection:
        row = connection.execute(
            'SELECT value_json FROM app_settings WHERE key = ?',
            (key,),
        ).fetchone()
    return json.loads(row['value_json']) if row else None
