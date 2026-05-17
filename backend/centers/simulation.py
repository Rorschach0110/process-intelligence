from __future__ import annotations

import json
from datetime import datetime
from pathlib import Path
from typing import Any

from config import APP_DB
from repositories.db import init_db, session


def evaluate_scenario(baseline: dict[str, Any], parameters: dict[str, Any]) -> dict[str, Any]:
    carbon = baseline['carbon']['summary']['total_carbon_kg']
    saving_rate = float(parameters.get('carbon_reduction_rate', 0.08))
    capacity_delta = float(parameters.get('capacity_delta', -0.01))
    cost_delta = float(parameters.get('cost_delta', 0.02))
    carbon_after = round(carbon * (1 - saving_rate), 2)
    risk = risk_score(capacity_delta, cost_delta, saving_rate)
    return {
        'baseline_carbon_kg': carbon,
        'estimated_carbon_kg': carbon_after,
        'estimated_saving_kg': round(carbon - carbon_after, 2),
        'capacity_delta': capacity_delta,
        'cost_delta': cost_delta,
        'risk_score': risk,
        'priority_score': round(saving_rate * 100 - risk, 2),
    }


def save_scenario(
    name: str,
    run_id: str,
    parameters: dict[str, Any],
    results: dict[str, Any],
    db_path: Path | None = None,
) -> int:
    database = prepare_db(db_path)
    with session(database) as connection:
        cursor = connection.execute(
            '''
            INSERT INTO simulation_scenarios
            (name, run_id, parameters_json, results_json, score, created_at)
            VALUES (?, ?, ?, ?, ?, ?)
            ''',
            (
                name,
                run_id,
                json.dumps(parameters, ensure_ascii=False),
                json.dumps(results, ensure_ascii=False),
                results['priority_score'],
                datetime.now().isoformat(timespec='seconds'),
            ),
        )
        return int(cursor.lastrowid)


def list_scenarios(db_path: Path | None = None) -> list[dict[str, Any]]:
    database = prepare_db(db_path)
    with session(database) as connection:
        rows = connection.execute('SELECT * FROM simulation_scenarios ORDER BY score DESC').fetchall()
    return [decode(row) for row in rows]


def risk_score(capacity_delta: float, cost_delta: float, saving_rate: float) -> float:
    return round(abs(capacity_delta) * 80 + max(cost_delta, 0) * 60 - saving_rate * 10, 2)


def decode(row: Any) -> dict[str, Any]:
    data = dict(row)
    data['parameters'] = json.loads(data.pop('parameters_json'))
    data['results'] = json.loads(data.pop('results_json'))
    return data


def prepare_db(db_path: Path | None) -> Path:
    database = db_path if db_path else APP_DB
    init_db(database)
    return database
