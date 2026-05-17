from __future__ import annotations

from fastapi import APIRouter, HTTPException, UploadFile

from app.schemas import MappingTemplatePayload, PipelineRunPayload
from app.services import dataset_detail, dataset_preview, run_dataset_pipeline, upload_dataset
from models import CarbonFactors, FieldMapping
from repositories.datasets import list_datasets
from repositories.templates import list_mapping_templates, save_mapping_template
from storage.history import list_runs


router = APIRouter(prefix='/api')


@router.get('/datasets')
async def datasets() -> dict[str, object]:
    return {'datasets': list_datasets()}


@router.get('/datasets/{dataset_id}')
async def dataset(dataset_id: int) -> dict[str, object]:
    try:
        return dataset_detail(dataset_id)
    except ValueError as error:
        raise HTTPException(status_code=404, detail=str(error)) from error


@router.get('/datasets/{dataset_id}/preview')
async def dataset_preview_route(dataset_id: int, page: int = 1, page_size: int = 20) -> dict[str, object]:
    try:
        return dataset_preview(dataset_id, page, page_size)
    except ValueError as error:
        raise HTTPException(status_code=404, detail=str(error)) from error


@router.get('/mapping-templates')
async def mapping_templates() -> dict[str, object]:
    return {'templates': list_mapping_templates()}


@router.post('/mapping-templates')
async def create_mapping_template(payload: MappingTemplatePayload) -> dict[str, object]:
    mapping = payload.mapping.model_dump()
    template_id = save_mapping_template(payload.name, mapping)
    return {'id': template_id, 'name': payload.name, 'mapping': mapping}


@router.post('/upload-csv')
async def upload_csv(file: UploadFile) -> dict[str, object]:
    return upload_dataset(file.filename or 'event_log.csv', await file.read())


@router.post('/run-pipeline')
async def run_pipeline_route(payload: PipelineRunPayload) -> dict[str, object]:
    try:
        return run_dataset_pipeline(
            payload.file,
            FieldMapping(**payload.mapping.model_dump()),
            CarbonFactors(**payload.factors.model_dump()),
        )
    except ValueError as error:
        raise HTTPException(status_code=400, detail=str(error)) from error


@router.get('/runs')
async def runs() -> dict[str, object]:
    return {'runs': list_runs()}
