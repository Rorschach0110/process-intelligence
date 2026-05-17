from __future__ import annotations

from fastapi import APIRouter

from centers.operations import audit, backup_manifest, diagnostics, health_details, save_setting


router = APIRouter(prefix='/api')


@router.get('/health')
async def health() -> dict[str, object]:
    return {'app': 'process-intelligence', 'runtime': 'fastapi', **health_details()}


@router.get('/ops/diagnostics')
async def ops_diagnostics() -> dict[str, object]:
    return diagnostics()


@router.get('/ops/backup-manifest')
async def ops_backup_manifest() -> dict[str, object]:
    return backup_manifest()


@router.post('/ops/settings/{key}')
async def ops_save_setting(key: str, value: dict[str, object]) -> dict[str, object]:
    save_setting(key, value)
    audit('system', 'save_setting', key, value)
    return {'key': key, 'value': value}
