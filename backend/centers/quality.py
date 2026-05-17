from __future__ import annotations

import csv
from pathlib import Path
from typing import Any

from models import FieldMapping
from services.ingestion import MAPPING_FIELDS, parse_timestamp


def quality_report(path: Path, mapping: FieldMapping) -> dict[str, Any]:
    with path.open('r', encoding='utf-8-sig', newline='') as file:
        rows = list(csv.DictReader(file))
    missing = {name: 0 for name in MAPPING_FIELDS}
    invalid_timestamps = 0
    invalid_numbers = {'energy_kwh': 0, 'material_kg': 0}
    for row in rows:
        for name in MAPPING_FIELDS:
            if not row.get(getattr(mapping, name), '').strip():
                missing[name] += 1
        if row.get(mapping.timestamp, '').strip():
            try:
                parse_timestamp(row[mapping.timestamp])
            except ValueError:
                invalid_timestamps += 1
        for name in invalid_numbers:
            value = row.get(getattr(mapping, name), '').strip()
            if value:
                try:
                    float(value)
                except ValueError:
                    invalid_numbers[name] += 1
    total = len(rows) or 1
    return {
        'rows': len(rows),
        'missing': missing,
        'missing_rate': {key: round(value / total, 3) for key, value in missing.items()},
        'invalid_timestamps': invalid_timestamps,
        'invalid_numbers': invalid_numbers,
        'score': score_quality(missing, invalid_timestamps, invalid_numbers, total),
    }


def score_quality(
    missing: dict[str, int],
    invalid_timestamps: int,
    invalid_numbers: dict[str, int],
    total: int,
) -> float:
    penalties = sum(missing.values()) + invalid_timestamps + sum(invalid_numbers.values())
    return round(max(0.0, 1 - penalties / max(total * 3, 1)), 3)
