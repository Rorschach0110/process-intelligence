from __future__ import annotations

import json
from typing import Any


def build_optimizer_prompt(
    process: dict[str, Any],
    carbon: dict[str, Any],
    graph: dict[str, Any],
) -> str:
    context = {
        'process': {
            'cases': process.get('cases'),
            'events': process.get('events'),
            'bottlenecks': process.get('bottlenecks', []),
            'rework_loops': process.get('rework_loops', []),
        },
        'carbon': {
            'summary': carbon.get('summary', {}),
            'top_activities': carbon.get('by_activity', [])[:5],
            'top_resources': carbon.get('by_resource', [])[:5],
        },
        'graph': graph.get('schema', {}),
    }
    return (
        'You are a process and carbon optimization assistant. '
        'Return strict JSON with objective, baseline_carbon_kg, '
        'estimated_carbon_after_kg, estimated_saving_kg, recommendations, '
        'and explainability. Each recommendation must include title, target, '
        'reason, action, estimated_saving_kg, confidence, and evidence.\n'
        f'Context:\n{json.dumps(context, ensure_ascii=False, indent=2)}'
    )
