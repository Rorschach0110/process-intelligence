from __future__ import annotations

import csv
import math
import xml.etree.ElementTree as ET
from pathlib import Path

from config import GRID_CARBON_FACTOR, MATERIAL_CARBON_FACTOR
from services.ingestion import unique_path


STANDARD_FIELDS = (
    'case_id',
    'activity',
    'timestamp',
    'resource',
    'energy_kwh',
    'material_kg',
    'device',
    'original_carbon_kg',
    'duration_min',
    'end_timestamp',
)
CARBON_TOTAL = '\u78b3\u6392\u653e\u91cf'
ENERGY_CARBON = '\u80fd\u6e90\u78b3\u6392\u653e'
ENERGY_CARBON_VALUE = '\u80fd\u6e90\u78b3\u6392\u653e\u6570\u503c'
MATERIAL_CARBON = '\u7269\u6599\u78b3\u6392\u653e'
MATERIAL_CARBON_ALT = '\u7269\u6599\u78b3\u6392\u653e.1'
MATERIAL_CARBON_VALUE = '\u7269\u6599\u78b3\u6392\u653e\u6570\u503c'
DURATION = '\u8017\u65f6'
END_TIMESTAMP = '\u4e0b\u673a\u65f6\u95f4'
MACHINE_ID = '\u673a\u53f0\u53f7'
MACHINE_NAME = '\u673a\u53f0\u540d\u79f0'


def convert_xes_to_csv(path: Path, target: Path | None = None) -> Path:
    target = unique_path(target or path.with_suffix('.csv'))
    with target.open('w', encoding='utf-8-sig', newline='') as file:
        writer = csv.DictWriter(file, fieldnames=list(STANDARD_FIELDS))
        writer.writeheader()
        writer.writerows(iter_standard_rows(path))
    return target


def iter_standard_rows(path: Path) -> list[dict[str, str]]:
    rows: list[dict[str, str]] = []
    for _, trace in ET.iterparse(path, events=('end',)):
        if local_name(trace.tag) != 'trace':
            continue
        trace_values = child_values(trace, include_events=False)
        for event in trace:
            if local_name(event.tag) == 'event':
                rows.append(to_standard_row(child_values(event), trace_values))
        trace.clear()
    return rows


def to_standard_row(raw: dict[str, str], trace: dict[str, str]) -> dict[str, str]:
    energy_carbon = first_number(raw, (ENERGY_CARBON_VALUE, ENERGY_CARBON))
    material_carbon = first_number(raw, (MATERIAL_CARBON_VALUE, MATERIAL_CARBON, MATERIAL_CARBON_ALT))
    total_carbon = first_number(raw, (CARBON_TOTAL,))
    if not energy_carbon and not material_carbon and total_carbon:
        energy_carbon = total_carbon
    return {
        'case_id': first_text(raw, ('case_id',)) or first_text(trace, ('concept:name', '@@case_index')),
        'activity': first_text(raw, ('activity', 'concept:name')) or 'Unknown Activity',
        'timestamp': first_text(raw, ('timestamp', 'time:timestamp')),
        'resource': first_text(raw, ('resource', 'org:resource')) or 'Unknown Resource',
        'energy_kwh': number_text(divide(energy_carbon, GRID_CARBON_FACTOR)),
        'material_kg': number_text(divide(material_carbon, MATERIAL_CARBON_FACTOR)),
        'device': first_text(raw, ('device', MACHINE_ID, MACHINE_NAME, 'resource')),
        'original_carbon_kg': number_text(total_carbon or energy_carbon + material_carbon),
        'duration_min': number_text(first_number(raw, (DURATION,))),
        'end_timestamp': first_text(raw, (END_TIMESTAMP,)),
    }


def child_values(element: ET.Element, include_events: bool = True) -> dict[str, str]:
    values: dict[str, str] = {}
    for child in element:
        if not include_events and local_name(child.tag) == 'event':
            continue
        key = child.attrib.get('key', '')
        if key:
            values[key] = child.attrib.get('value', '')
    return values


def local_name(tag: str) -> str:
    return tag.rsplit('}', 1)[-1]


def first_text(values: dict[str, str], keys: tuple[str, ...]) -> str:
    for key in keys:
        value = values.get(key, '').strip()
        if value and value.lower() != 'nan':
            return value
    return ''


def first_number(values: dict[str, str], keys: tuple[str, ...]) -> float:
    for key in keys:
        try:
            value = float(values.get(key, ''))
        except ValueError:
            continue
        if math.isfinite(value):
            return value
    return 0.0


def divide(value: float, factor: float) -> float:
    return value / factor if value and factor else 0.0


def number_text(value: float) -> str:
    return f'{value:.6f}'.rstrip('0').rstrip('.') if value else ''
