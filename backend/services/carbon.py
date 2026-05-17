from __future__ import annotations

from collections import defaultdict
from typing import Any

from config import CARBON_FACTORS_FILE, GRID_CARBON_FACTOR, MATERIAL_CARBON_FACTOR
from models import CarbonFactors, Event


def new_carbon_bucket() -> dict[str, float]:
    return {'energy_kwh': 0.0, 'material_kg': 0.0, 'carbon_kg': 0.0, 'events': 0}


def add_event_to_bucket(bucket: dict[str, float], event: Event, event_carbon: float) -> None:
    bucket['energy_kwh'] += event.energy_kwh
    bucket['material_kg'] += event.material_kg
    bucket['carbon_kg'] += event_carbon
    bucket['events'] += 1


def build_activity_rows(totals: dict[str, dict[str, float]]) -> list[dict[str, Any]]:
    return sorted(
        [
            {
                'activity': activity,
                'events': int(values['events']),
                'energy_kwh': round(values['energy_kwh'], 2),
                'material_kg': round(values['material_kg'], 2),
                'carbon_kg': round(values['carbon_kg'], 2),
                'carbon_per_event': round(values['carbon_kg'] / values['events'], 2),
            }
            for activity, values in totals.items()
        ],
        key=lambda row: row['carbon_kg'],
        reverse=True,
    )


def build_resource_rows(totals: dict[str, dict[str, float]]) -> list[dict[str, Any]]:
    return sorted(
        [
            {
                'resource': resource,
                'events': int(values['events']),
                'energy_kwh': round(values['energy_kwh'], 2),
                'material_kg': round(values['material_kg'], 2),
                'carbon_kg': round(values['carbon_kg'], 2),
            }
            for resource, values in totals.items()
        ],
        key=lambda row: row['carbon_kg'],
        reverse=True,
    )


def default_carbon_factors() -> CarbonFactors:
    return CarbonFactors(
        electricity_kg_per_kwh=GRID_CARBON_FACTOR,
        material_kg_per_kg=MATERIAL_CARBON_FACTOR,
    )


def factors_from_dict(values: dict[str, Any] | None = None) -> CarbonFactors:
    values = values or {}
    defaults = default_carbon_factors()
    return CarbonFactors(
        electricity_kg_per_kwh=safe_factor(
            values.get('electricity_kg_per_kwh'),
            defaults.electricity_kg_per_kwh,
        ),
        material_kg_per_kg=safe_factor(
            values.get('material_kg_per_kg'),
            defaults.material_kg_per_kg,
        ),
    )


def safe_factor(value: Any, default: float) -> float:
    try:
        factor = float(value)
        return factor if factor >= 0 else default
    except (TypeError, ValueError):
        return default


def load_configured_factors() -> CarbonFactors:
    if not CARBON_FACTORS_FILE.exists():
        return default_carbon_factors()
    import json

    data = json.loads(CARBON_FACTORS_FILE.read_text(encoding='utf-8'))
    return factors_from_dict(data)


def save_configured_factors(factors: CarbonFactors) -> None:
    import json

    CARBON_FACTORS_FILE.parent.mkdir(parents=True, exist_ok=True)
    payload = {
        'electricity_kg_per_kwh': factors.electricity_kg_per_kwh,
        'material_kg_per_kg': factors.material_kg_per_kg,
    }
    CARBON_FACTORS_FILE.write_text(json.dumps(payload, indent=2), encoding='utf-8')


def quantify_carbon(events: list[Event], factors: CarbonFactors | None = None) -> dict[str, Any]:
    factors = factors or load_configured_factors()
    activity_totals: dict[str, dict[str, float]] = defaultdict(new_carbon_bucket)
    resource_totals: dict[str, dict[str, float]] = defaultdict(new_carbon_bucket)
    total_energy = 0.0
    total_material = 0.0

    for event in events:
        event_carbon = (
            event.energy_kwh * factors.electricity_kg_per_kwh
            + event.material_kg * factors.material_kg_per_kg
        )
        total_energy += event.energy_kwh
        total_material += event.material_kg
        add_event_to_bucket(activity_totals[event.activity], event, event_carbon)
        add_event_to_bucket(resource_totals[event.resource], event, event_carbon)

    total_carbon = (
        total_energy * factors.electricity_kg_per_kwh
        + total_material * factors.material_kg_per_kg
    )
    case_count = len({event.case_id for event in events}) or 1
    return {
        'factors': {
            'electricity_kg_per_kwh': factors.electricity_kg_per_kwh,
            'material_kg_per_kg': factors.material_kg_per_kg,
        },
        'summary': {
            'total_energy_kwh': round(total_energy, 2),
            'total_material_kg': round(total_material, 2),
            'total_carbon_kg': round(total_carbon, 2),
            'carbon_per_case_kg': round(total_carbon / case_count, 2),
        },
        'by_activity': build_activity_rows(activity_totals),
        'by_resource': build_resource_rows(resource_totals),
    }
