from __future__ import annotations

import json
import mimetypes
from http.server import BaseHTTPRequestHandler
from pathlib import Path
from typing import Any
from urllib.parse import unquote, urlparse

from api.request import read_json, read_multipart
from config import ROOT, WEB_DIR
from graphing.exports import graph_cypher
from graphing.query import query_graph
from pipeline.runner import run_pipeline
from repositories.datasets import upsert_dataset
from services.carbon import factors_from_dict, load_configured_factors, save_configured_factors
from services.ingestion import mapping_from_dict, preview_csv, save_upload, validate_csv
from storage.history import list_runs


def json_response(handler: BaseHTTPRequestHandler, payload: Any, status: int = 200) -> None:
    data = json.dumps(payload, ensure_ascii=False, indent=2).encode('utf-8')
    handler.send_response(status)
    handler.send_header('Content-Type', 'application/json; charset=utf-8')
    handler.send_header('Content-Length', str(len(data)))
    handler.end_headers()
    handler.wfile.write(data)


class AppHandler(BaseHTTPRequestHandler):
    def do_GET(self) -> None:
        path = unquote(urlparse(self.path).path)
        if path == '/api/health':
            json_response(self, {'status': 'ok', 'app': 'process-intelligence'})
            return
        if path == '/api/sample-log':
            json_response(self, {'events': sample_events()})
            return
        if path == '/api/run-pipeline':
            json_response(self, run_pipeline())
            return
        if path == '/api/runs':
            json_response(self, {'runs': list_runs()})
            return
        if path == '/api/graph/export':
            json_response(self, graph_export(urlparse(self.path).query))
            return
        if path == '/api/graph/query':
            json_response(self, graph_query(urlparse(self.path).query))
            return

        self.serve_static(path)

    def do_POST(self) -> None:
        path = unquote(urlparse(self.path).path)
        try:
            if path == '/api/upload-csv':
                json_response(self, upload_csv(self))
                return
            if path == '/api/run-pipeline':
                json_response(self, run_pipeline_request(read_json(self)))
                return
            if path == '/api/carbon-factors':
                json_response(self, update_carbon_factors(read_json(self)))
                return
        except ValueError as error:
            json_response(self, {'error': str(error)}, 400)
            return

        json_response(self, {'error': 'Not found'}, 404)

    def serve_static(self, path: str) -> None:
        if path == '/':
            path = '/index.html'
        target = (WEB_DIR / path.lstrip('/')).resolve()
        if not is_safe_static_file(target):
            json_response(self, {'error': 'Not found'}, 404)
            return

        content_type = mimetypes.guess_type(target.name)[0] or 'application/octet-stream'
        data = target.read_bytes()
        self.send_response(200)
        self.send_header('Content-Type', content_type)
        self.send_header('Content-Length', str(len(data)))
        self.end_headers()
        self.wfile.write(data)

    def log_message(self, fmt: str, *args: Any) -> None:
        print(f'[process-intelligence] {self.address_string()} - {fmt % args}')


def is_safe_static_file(target: Any) -> bool:
    web_root = WEB_DIR.resolve()
    return (
        str(target).startswith(str(web_root))
        and target.exists()
        and not target.is_dir()
    )


def sample_events() -> list[dict[str, Any]]:
    return [
        {
            'case_id': event.case_id,
            'activity': event.activity,
            'timestamp': event.timestamp.isoformat(sep=' '),
            'resource': event.resource,
            'energy_kwh': event.energy_kwh,
            'material_kg': event.material_kg,
            'device': event.device,
        }
        for event in load_events()
    ]


def upload_csv(handler: BaseHTTPRequestHandler) -> dict[str, Any]:
    form = read_multipart(handler)
    file_data = form.get('file')
    if not isinstance(file_data, dict):
        raise ValueError('CSV file is required.')
    target = save_upload(str(file_data.get('filename', 'event_log.csv')), file_data['content'])
    preview = preview_csv(target)
    file_path = str(target.relative_to(ROOT))
    dataset_id = upsert_dataset(file_path, preview['fields'], preview['preview'])
    return {'file': file_path, 'dataset_id': dataset_id, **preview}


def run_pipeline_request(payload: dict[str, Any]) -> dict[str, Any]:
    path = resolve_data_path(str(payload.get('file') or 'data/sample_event_log.csv'))
    mapping = mapping_from_dict(payload.get('mapping'))
    factors = factors_from_dict(payload.get('factors') or factor_dict(load_configured_factors()))
    issues = validate_csv(path, mapping)
    if issues:
        raise ValueError('; '.join(issues[:5]))
    return run_pipeline(path=path, mapping=mapping, factors=factors, persist=True)


def update_carbon_factors(payload: dict[str, Any]) -> dict[str, Any]:
    factors = factors_from_dict(payload)
    save_configured_factors(factors)
    return {'factors': factor_dict(factors)}


def factor_dict(factors: Any) -> dict[str, float]:
    return {
        'electricity_kg_per_kwh': factors.electricity_kg_per_kwh,
        'material_kg_per_kg': factors.material_kg_per_kg,
    }


def resolve_data_path(value: str) -> Path:
    target = (ROOT / value).resolve()
    data_root = (ROOT / 'data').resolve()
    if not str(target).startswith(str(data_root)) or not target.exists():
        raise ValueError('Selected data file is not available.')
    return target


def graph_export(query: str) -> dict[str, Any]:
    graph = run_pipeline()['knowledge_graph']
    if 'format=cypher' in query:
        return {'format': 'cypher', 'content': graph_cypher(graph)}
    return {'format': 'json', 'content': graph}


def graph_query(query: str) -> dict[str, Any]:
    params = dict(item.split('=', 1) for item in query.split('&') if '=' in item)
    graph = run_pipeline()['knowledge_graph']
    return query_graph(graph, unquote(params.get('kind', '')), unquote(params.get('q', '')))
