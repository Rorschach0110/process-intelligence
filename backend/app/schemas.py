from __future__ import annotations

from typing import Any

from pydantic import BaseModel, ConfigDict


class FieldMappingPayload(BaseModel):
    model_config = {'extra': 'allow', 'populate_by_name': True}

    case_id: str = 'case_id'
    activity: str = 'activity'
    timestamp: str = 'timestamp'
    resource: str = 'resource'
    energy_kwh: str = 'energy_kwh'
    material_kg: str = 'material_kg'
    device: str = 'device'


class CarbonFactorsPayload(BaseModel):
    model_config = {'extra': 'allow', 'populate_by_name': True}

    electricity_kg_per_kwh: float = 0.581
    material_kg_per_kg: float = 1.82


class CarbonFactorLibraryPayload(BaseModel):
    model_config = {'extra': 'allow', 'populate_by_name': True}

    name: str
    factor_type: str
    unit: str
    value: float
    source: str = 'manual'
    version: str = 'v1'
    scope: str = 'Scope 2'
    is_active: bool = True


class PipelineRunPayload(BaseModel):
    model_config = {'extra': 'allow', 'populate_by_name': True}

    file: str = 'data/sample_event_log.csv'
    mapping: FieldMappingPayload = FieldMappingPayload()
    factors: CarbonFactorsPayload = CarbonFactorsPayload()


class MappingTemplatePayload(BaseModel):
    model_config = {'extra': 'allow', 'populate_by_name': True}

    name: str
    mapping: FieldMappingPayload


class LlmProviderPayload(BaseModel):
    model_config = {'extra': 'allow', 'populate_by_name': True}

    name: str
    base_url: str
    model: str
    is_active: bool = True


class ScenarioPayload(BaseModel):
    model_config = {'extra': 'allow', 'populate_by_name': True}

    name: str
    run_id: str = 'ad-hoc'
    parameters: dict[str, Any] = {}


class ReportPayload(BaseModel):
    model_config = {'extra': 'allow', 'populate_by_name': True}

    report_type: str = 'executive'


JsonDict = dict[str, Any]
