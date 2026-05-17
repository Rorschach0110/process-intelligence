from __future__ import annotations

import csv
from datetime import datetime
from pathlib import Path
from typing import Any

from config import SAMPLE_LOG, UPLOAD_DIR
from models import Event, FieldMapping


REQUIRED_FIELDS = ('case_id', 'activity', 'timestamp')
OPTIONAL_FIELDS = ('resource', 'energy_kwh', 'material_kg', 'device')
MAPPING_FIELDS = REQUIRED_FIELDS + OPTIONAL_FIELDS


def parse_float(value: str | None, default: float = 0.0) -> float:
    try:
        return float(value or default)
    except (TypeError, ValueError):
        return default


def parse_timestamp(value: str) -> datetime:
    value = value.strip()
    formats = [
        '%Y-%m-%d %H:%M:%S',
        '%Y/%m/%d %H:%M:%S',
        '%Y-%m-%d',
        '%Y/%m/%d',
    ]
    for fmt in formats:
        try:
            return datetime.strptime(value, fmt)
        except ValueError:
            pass
    return datetime.fromisoformat(value.replace('Z', '+00:00')).replace(tzinfo=None)


def mapping_from_dict(values: dict[str, Any] | None = None) -> FieldMapping:
    values = values or {}
    clean = {
        name: str(values.get(name, name)).strip() or name
        for name in MAPPING_FIELDS
    }
    return FieldMapping(**clean)


def save_upload(filename: str, content: bytes) -> Path:
    UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
    safe_name = Path(filename).name or 'event_log.csv'
    target = unique_path(UPLOAD_DIR / safe_name)
    target.write_bytes(content)
    return target


def unique_path(path: Path) -> Path:
    if not path.exists():
        return path
    stem = path.stem
    suffix = path.suffix
    for index in range(1, 10000):
        candidate = path.with_name(f'{stem}-{index}{suffix}')
        if not candidate.exists():
            return candidate
    raise ValueError('Unable to allocate upload filename.')


def preview_csv(path: Path, limit: int = 20) -> dict[str, Any]:
    return preview_csv_page(path, 1, limit)


def preview_csv_page(path: Path, page: int = 1, page_size: int = 20) -> dict[str, Any]:
    page = max(page, 1)
    page_size = min(max(page_size, 1), 100)
    start = (page - 1) * page_size
    with path.open('r', encoding='utf-8-sig', newline='') as file:
        reader = csv.DictReader(file)
        rows = list(reader)
        return {
            'fields': list(reader.fieldnames or []),
            'preview': rows[start:start + page_size],
            'page': page,
            'page_size': page_size,
            'total_rows': len(rows),
        }


def validate_csv(path: Path, mapping: FieldMapping) -> list[str]:
    issues: list[str] = []
    with path.open('r', encoding='utf-8-sig', newline='') as file:
        reader = csv.DictReader(file)
        fields = set(reader.fieldnames or [])
        issues.extend(validate_mapping_fields(fields, mapping))
        issues.extend(validate_rows(reader, mapping))
    return issues


def validate_mapping_fields(fields: set[str], mapping: FieldMapping) -> list[str]:
    issues: list[str] = []
    for name in REQUIRED_FIELDS:
        column = getattr(mapping, name)
        if column not in fields:
            issues.append(f'Missing required column for {name}: {column}')
    return issues


def validate_rows(reader: csv.DictReader, mapping: FieldMapping) -> list[str]:
    issues: list[str] = []
    for row_number, row in enumerate(reader, start=2):
        for name in REQUIRED_FIELDS:
            value = row.get(getattr(mapping, name), '').strip()
            if not value:
                issues.append(f'Row {row_number} is missing {name}.')
        validate_numeric(row, row_number, mapping, issues)
        validate_timestamp(row, row_number, mapping, issues)
    return issues[:50]


def validate_numeric(
    row: dict[str, str],
    row_number: int,
    mapping: FieldMapping,
    issues: list[str],
) -> None:
    for name in ('energy_kwh', 'material_kg'):
        column = getattr(mapping, name)
        value = row.get(column, '').strip()
        if value:
            try:
                float(value)
            except ValueError:
                issues.append(f'Row {row_number} has invalid {name}: {value}')


def validate_timestamp(
    row: dict[str, str],
    row_number: int,
    mapping: FieldMapping,
    issues: list[str],
) -> None:
    value = row.get(mapping.timestamp, '').strip()
    if value:
        try:
            parse_timestamp(value)
        except ValueError:
            issues.append(f'Row {row_number} has invalid timestamp: {value}')


def load_events(path: Path = SAMPLE_LOG, mapping: FieldMapping | None = None) -> list[Event]:
    mapping = mapping or FieldMapping()
    with path.open('r', encoding='utf-8-sig', newline='') as file:
        rows = csv.DictReader(file)
        events = [
            Event(
                case_id=row.get(mapping.case_id, '').strip(),
                activity=row.get(mapping.activity, '').strip(),
                timestamp=parse_timestamp(row.get(mapping.timestamp, '')),
                resource=row.get(mapping.resource, '').strip() or 'Unknown Resource',
                energy_kwh=parse_float(row.get(mapping.energy_kwh)),
                material_kg=parse_float(row.get(mapping.material_kg)),
                device=row.get(mapping.device, '').strip() or row.get(mapping.resource, '').strip(),
            )
            for row in rows
            if row.get(mapping.case_id) and row.get(mapping.activity) and row.get(mapping.timestamp)
        ]
    return sorted(events, key=lambda event: (event.case_id, event.timestamp))
