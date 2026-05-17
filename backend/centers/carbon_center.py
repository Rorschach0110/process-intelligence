from __future__ import annotations

from typing import Any

from models import CarbonFactors, Event
from repositories.carbon import active_factor_values, list_factors, save_factor
from services.carbon import default_carbon_factors


def ensure_default_factors() -> list[dict[str, Any]]:
    if not list_factors():
        defaults = default_carbon_factors()
        save_factor(default_factor('Electricity grid', 'electricity', 'kgCO2e/kWh', defaults.electricity_kg_per_kwh, 'Scope 2'))
        save_factor(default_factor('Material generic', 'material', 'kgCO2e/kg', defaults.material_kg_per_kg, 'Scope 3'))
    return list_factors()


def configured_carbon_factors() -> CarbonFactors:
    values = active_factor_values()
    defaults = default_carbon_factors()
    return CarbonFactors(
        electricity_kg_per_kwh=values.get('electricity', defaults.electricity_kg_per_kwh),
        material_kg_per_kg=values.get('material', defaults.material_kg_per_kg),
    )


def carbon_dimensions(events: list[Event], carbon: dict[str, Any]) -> dict[str, Any]:
    total = carbon['summary']['total_carbon_kg']
    cases = {event.case_id for event in events}
    products = {event.case_id.split('-')[0] for event in events if '-' in event.case_id}
    return {
        'by_order': by_order(events, carbon),
        'by_resource': carbon['by_resource'],
        'by_activity': carbon['by_activity'],
        'carbon_intensity': {
            'per_case_kg': round(total / max(len(cases), 1), 2),
            'per_event_kg': round(total / max(len(events), 1), 2),
            'per_product_family_kg': round(total / max(len(products), 1), 2),
        },
        'scopes': {'Scope 2': 'electricity', 'Scope 3': 'material'},
    }


def by_order(events: list[Event], carbon: dict[str, Any]) -> list[dict[str, Any]]:
    factors = carbon['factors']
    rows: dict[str, float] = {}
    for event in events:
        rows[event.case_id] = rows.get(event.case_id, 0) + (
            event.energy_kwh * factors['electricity_kg_per_kwh']
            + event.material_kg * factors['material_kg_per_kg']
        )
    return [{'order': key, 'carbon_kg': round(value, 2)} for key, value in sorted(rows.items())]


def default_factor(name: str, factor_type: str, unit: str, value: float, scope: str) -> dict[str, Any]:
    return {
        'name': name,
        'factor_type': factor_type,
        'unit': unit,
        'value': value,
        'source': 'default',
        'version': 'v1',
        'scope': scope,
        'is_active': True,
    }
