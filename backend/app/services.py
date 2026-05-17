from __future__ import annotations

from pathlib import Path
from typing import Any

from config import ROOT
from models import CarbonFactors, FieldMapping
from pipeline.runner import run_pipeline
from repositories.datasets import upsert_dataset
from repositories.datasets import get_dataset as repo_get_dataset
from repositories.datasets import get_dataset_profile, save_dataset_profile
from services.ingestion import preview_csv, preview_csv_page, save_upload, validate_csv
from services.xes import convert_xes_to_csv
from centers.operations import save_setting
from centers.quality import quality_report


def upload_dataset(filename: str, content: bytes) -> dict[str, Any]:
    target = save_upload(filename, content)
    if target.suffix.lower() == '.xes':
        target = convert_xes_to_csv(target)
    preview = preview_csv(target)
    file_path = str(target.relative_to(ROOT))
    dataset_id = upsert_dataset(
        file_path,
        preview['fields'],
        preview['preview'],
        row_count=preview['total_rows'],
    )
    mapping = FieldMapping()
    quality = quality_report(target, mapping)
    save_dataset_profile(dataset_id, mapping.__dict__, quality)
    return {'file': file_path, 'dataset_id': dataset_id, **preview}


def run_dataset_pipeline(
    file_path: str,
    mapping: FieldMapping,
    factors: CarbonFactors,
) -> dict[str, Any]:
    path = resolve_data_path(file_path)
    issues = validate_csv(path, mapping)
    if issues:
        raise ValueError('; '.join(issues[:5]))
    result = run_pipeline(path=path, mapping=mapping, factors=factors, persist=True)
    save_setting(
        'active_run',
        {
            'run_id': result.get('history', {}).get('run_id', 'ad-hoc'),
            'result_path': result.get('history', {}).get('file', ''),
            'source_file': result.get('source', {}).get('file', ''),
        },
    )
    return result


def resolve_data_path(value: str) -> Path:
    target = (ROOT / value).resolve()
    data_root = (ROOT / 'data').resolve()
    if not str(target).startswith(str(data_root)) or not target.exists():
        raise ValueError('Selected data file is not available.')
    return target


def dataset_detail(dataset_id: int) -> dict[str, Any]:
    dataset = repo_get_dataset(dataset_id)
    if not dataset:
        raise ValueError('Dataset not found.')
    return {'dataset': dataset, 'profile': get_dataset_profile(dataset_id)}


def dataset_preview(dataset_id: int, page: int, page_size: int) -> dict[str, Any]:
    dataset = repo_get_dataset(dataset_id)
    if not dataset:
        raise ValueError('Dataset not found.')
    return preview_csv_page(resolve_data_path(dataset['file_path']), page, page_size)

