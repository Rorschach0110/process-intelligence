from __future__ import annotations

from pathlib import Path
from typing import Any

from config import ROOT, SAMPLE_LOG
from models import CarbonFactors, FieldMapping
from optimization.service import optimize
from services.carbon import quantify_carbon
from centers.carbon_center import carbon_dimensions
from services.graph import build_knowledge_graph
from services.ingestion import load_events
from services.mining import mine_process
from storage.history import save_run_result


def run_pipeline(
    path: Path = SAMPLE_LOG,
    mapping: FieldMapping | None = None,
    factors: CarbonFactors | None = None,
    persist: bool = False,
) -> dict[str, Any]:
    events = load_events(path, mapping)
    process = mine_process(events)
    carbon = quantify_carbon(events, factors)
    carbon['dimensions'] = carbon_dimensions(events, carbon)
    graph = build_knowledge_graph(process, carbon, events)
    optimization = optimize(process, carbon, graph)
    result = {
        'source': {'file': display_path(path), 'rows': len(events)},
        'process': process,
        'carbon': carbon,
        'knowledge_graph': graph,
        'optimization': optimization,
    }
    if persist:
        result['history'] = save_run_result(result)
    return result


def display_path(path: Path) -> str:
    try:
        return str(path.relative_to(ROOT))
    except ValueError:
        return str(path)

