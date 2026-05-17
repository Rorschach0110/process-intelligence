from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime


@dataclass
class Event:
    case_id: str
    activity: str
    timestamp: datetime
    resource: str
    energy_kwh: float
    material_kg: float
    device: str


@dataclass(frozen=True)
class FieldMapping:
    case_id: str = 'case_id'
    activity: str = 'activity'
    timestamp: str = 'timestamp'
    resource: str = 'resource'
    energy_kwh: str = 'energy_kwh'
    material_kg: str = 'material_kg'
    device: str = 'device'


@dataclass(frozen=True)
class CarbonFactors:
    electricity_kg_per_kwh: float = 0.581
    material_kg_per_kg: float = 1.82
