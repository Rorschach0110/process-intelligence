from __future__ import annotations

import json
from pathlib import Path
from typing import Any

from config import ROOT
from pipeline.runner import run_pipeline
from repositories.runs import list_run_summaries
from repositories.settings import get_setting


def current_result() -> dict[str, Any]:
    latest = latest_result_path()
    if latest and latest.exists():
        return normalize_result(json.loads(latest.read_text(encoding='utf-8')), latest)
    return run_pipeline()


def latest_result_path() -> Path | None:
    selected = selected_run_path()
    if selected:
        return selected
    rows = preferred_runs()
    if not rows:
        rows = list_run_summaries(1)
    if not rows:
        return None
    value = rows[0].get('result_path', '')
    return to_result_path(value)


def preferred_runs() -> list[dict[str, Any]]:
    rows = list_run_summaries(20)
    preferred = [row for row in rows if not is_sample_run(row)]
    return preferred[:1]


def selected_run_path() -> Path | None:
    value = get_setting('active_run')
    if not value:
        return None
    return to_result_path(str(value.get('result_path', '')))


def to_result_path(value: str) -> Path | None:
    if not value:
        return None
    path = (ROOT / value).resolve()
    data_root = (ROOT / 'data').resolve()
    if not str(path).startswith(str(data_root)):
        return None
    return path


def is_sample_run(row: dict[str, Any]) -> bool:
    source = str(row.get('source_file', '') or row.get('source', {}).get('file', ''))
    return source.endswith('sample_event_log.csv')


def normalize_result(result: dict[str, Any], path: Path) -> dict[str, Any]:
    result.setdefault(
        'history',
        {
            'run_id': result.get('run_id', 'ad-hoc'),
            'file': str(path.relative_to(ROOT)),
        },
    )
    return result
