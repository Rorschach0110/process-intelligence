from __future__ import annotations

from fastapi import APIRouter

from app.schemas import CarbonFactorLibraryPayload, CarbonFactorsPayload
from centers.carbon_center import ensure_default_factors
from models import CarbonFactors
from repositories.carbon import save_factor
from services.carbon import save_configured_factors
from storage.current import current_result


router = APIRouter(prefix='/api')


@router.post('/carbon-factors')
async def carbon_factors(payload: CarbonFactorsPayload) -> dict[str, object]:
    factors = CarbonFactors(**payload.model_dump())
    save_configured_factors(factors)
    return {'factors': payload.model_dump()}


@router.get('/carbon/factors')
async def carbon_factor_library() -> dict[str, object]:
    return {'factors': ensure_default_factors()}


@router.post('/carbon/factors')
async def create_carbon_factor(payload: CarbonFactorLibraryPayload) -> dict[str, object]:
    factor_id = save_factor(payload.model_dump())
    return {'id': factor_id, **payload.model_dump()}


@router.get('/carbon/summary')
async def carbon_summary() -> dict[str, object]:
    return {'carbon': current_result()['carbon']}
