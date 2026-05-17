from __future__ import annotations

from fastapi import APIRouter

from app.schemas import LlmProviderPayload, ReportPayload, ScenarioPayload
from centers.reports import generate_report, list_reports, save_report
from centers.simulation import evaluate_scenario, list_scenarios, save_scenario
from repositories.optimization import list_providers, list_recommendations, save_provider
from storage.current import current_result


router = APIRouter(prefix='/api')


@router.get('/optimization/recommendations')
async def optimization_recommendations() -> dict[str, object]:
    return {'recommendations': list_recommendations()}


@router.get('/optimization/providers')
async def optimization_providers() -> dict[str, object]:
    return {'providers': list_providers()}


@router.post('/optimization/providers')
async def create_optimization_provider(payload: LlmProviderPayload) -> dict[str, object]:
    provider_id = save_provider(payload.model_dump())
    return {'id': provider_id, **payload.model_dump()}


@router.get('/simulation/scenarios')
async def simulation_scenarios() -> dict[str, object]:
    return {'scenarios': list_scenarios()}


@router.post('/simulation/scenarios')
async def create_simulation_scenario(payload: ScenarioPayload) -> dict[str, object]:
    baseline = current_result()
    results = evaluate_scenario(baseline, payload.parameters)
    scenario_id = save_scenario(payload.name, payload.run_id, payload.parameters, results)
    return {'id': scenario_id, 'name': payload.name, 'results': results}


@router.get('/reports')
async def reports() -> dict[str, object]:
    return {'reports': list_reports()}


@router.post('/reports')
async def create_report(payload: ReportPayload) -> dict[str, object]:
    result = current_result()
    report = generate_report(result, payload.report_type)
    report_id = save_report(report)
    return {'id': report_id, **report}
