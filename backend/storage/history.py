from __future__ import annotations

import json
from datetime import datetime
from pathlib import Path
from typing import Any

from config import ROOT, RUNS_DIR
from repositories.datasets import dataset_id_for_file
from repositories.optimization import save_recommendations
from repositories.runs import save_run_summary
from repositories.settings import get_setting


def save_run_result(result: dict[str, Any]) -> dict[str, str]:
    RUNS_DIR.mkdir(parents=True, exist_ok=True)
    run_id = datetime.now().strftime('%Y%m%d-%H%M%S-%f')
    path = RUNS_DIR / f'{run_id}.json'
    payload = {'run_id': run_id, 'created_at': datetime.now().isoformat(timespec='seconds'), **result}
    path.write_text(json.dumps(payload, ensure_ascii=False), encoding='utf-8')
    history = {'run_id': run_id, 'file': str(path.relative_to(ROOT))}
    save_run_summary(build_summary(payload, history), dataset_id_for_file(result['source']['file']))
    save_recommendations(run_id, result.get('optimization', {}).get('recommendations', []))
    return history


def list_runs(limit: int = 20) -> list[dict[str, Any]]:
    db_runs = list_database_runs(limit)
    if db_runs:
        return db_runs
    RUNS_DIR.mkdir(parents=True, exist_ok=True)
    runs = []
    for path in sorted(RUNS_DIR.glob('*.json'), reverse=True)[:limit]:
        runs.append(read_run_summary(path))
    return runs


def list_database_runs(limit: int) -> list[dict[str, Any]]:
    from repositories.runs import list_run_summaries

    runs = [
        {
            'run_id': row['run_id'],
            'created_at': row['created_at'],
            'source': {'file': row['source_file']},
            'events': row['events'],
            'cases': row['cases'],
            'total_carbon_kg': row['total_carbon_kg'],
            'estimated_saving_kg': row['estimated_saving_kg'],
        }
        for row in list_run_summaries(limit)
    ]
    active = get_setting('active_run') or {}
    active_id = str(active.get('run_id', ''))
    if active_id:
        runs.sort(key=lambda row: 0 if row['run_id'] == active_id else 1)
    return runs


def read_run_summary(path: Path) -> dict[str, Any]:
    data = json.loads(path.read_text(encoding='utf-8'))
    return {
        'run_id': data.get('run_id', path.stem),
        'created_at': data.get('created_at', ''),
        'source': data.get('source', {}),
        'events': data.get('process', {}).get('events', 0),
        'cases': data.get('process', {}).get('cases', 0),
        'total_carbon_kg': data.get('carbon', {}).get('summary', {}).get('total_carbon_kg', 0),
        'estimated_saving_kg': data.get('optimization', {}).get('estimated_saving_kg', 0),
    }


def build_summary(payload: dict[str, Any], history: dict[str, str]) -> dict[str, Any]:
    return {
        'run_id': payload['run_id'],
        'created_at': payload['created_at'],
        'source': payload.get('source', {}),
        'status': 'completed',
        'events': payload.get('process', {}).get('events', 0),
        'cases': payload.get('process', {}).get('cases', 0),
        'total_carbon_kg': payload.get('carbon', {}).get('summary', {}).get('total_carbon_kg', 0),
        'estimated_saving_kg': payload.get('optimization', {}).get('estimated_saving_kg', 0),
        'result_path': history['file'],
    }
