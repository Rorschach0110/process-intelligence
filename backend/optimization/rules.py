from __future__ import annotations

from typing import Any


class RuleBasedOptimizer:
    def optimize(
        self,
        process: dict[str, Any],
        carbon: dict[str, Any],
        graph: dict[str, Any],
    ) -> dict[str, Any]:
        recommendations = build_recommendations(process, carbon)
        baseline = carbon['summary']['total_carbon_kg']
        saving = sum(item['estimated_saving_kg'] for item in recommendations)
        return {
            'objective': 'Minimize carbon while preserving process throughput',
            'baseline_carbon_kg': baseline,
            'estimated_carbon_after_kg': round(max(baseline - saving, 0), 2),
            'estimated_saving_kg': round(saving, 2),
            'recommendations': recommendations,
            'explainability': {
                'used_process_edges': len(process['edges']),
                'used_graph_nodes': len(graph['nodes']),
                'used_graph_edges': len(graph['edges']),
            },
        }


def build_recommendations(process: dict[str, Any], carbon: dict[str, Any]) -> list[dict[str, Any]]:
    items = []
    activity = carbon['by_activity'][0] if carbon['by_activity'] else None
    loop = select_loop(process, carbon)
    resource = carbon['by_resource'][0] if carbon['by_resource'] else None
    if activity:
        items.append(activity_recommendation(activity))
    if loop:
        match = next((row for row in carbon['by_activity'] if row['activity'] == loop['activity']), None)
        items.append(loop_recommendation(loop, match or {'carbon_kg': 0}))
    if resource:
        items.append(resource_recommendation(resource, process.get('resource_load', [])))
    return items


def select_loop(process: dict[str, Any], carbon: dict[str, Any]) -> dict[str, Any] | None:
    for row in carbon.get('by_activity', []):
        if 'rework' in row['activity'].lower() and row['events'] >= 2:
            return {'activity': row['activity'], 'repeat_count': row['events']}
    loops = process.get('rework_loops', [])
    if loops:
        return loops[0]
    return None


def activity_recommendation(activity: dict[str, Any]) -> dict[str, Any]:
    return {
        'title': f"Reduce carbon intensity in {activity['activity']}",
        'target': activity['activity'],
        'reason': f"It contributes {activity['carbon_kg']} kg CO2e, the largest activity-level share.",
        'action': 'Tune batch size, inspect material waste, and assign lower-carbon equipment at this step.',
        'estimated_saving_kg': round(activity['carbon_kg'] * 0.12, 2),
        'confidence': 0.82,
        'evidence': {'carbon_kg': activity['carbon_kg'], 'events': activity['events']},
        'risk': {'capacity': 'low', 'quality': 'medium', 'implementation': 'medium'},
        'verification': 'Compare carbon per event and throughput after one controlled batch.',
        'status': 'pending_review',
    }


def loop_recommendation(loop: dict[str, Any], activity: dict[str, Any]) -> dict[str, Any]:
    carbon_kg = activity.get('carbon_kg', 0)
    return {
        'title': f"Reduce repeat loops around {loop['activity']}",
        'target': loop['activity'],
        'reason': f"Repeated activity appears {loop['repeat_count']} times across cases.",
        'action': 'Move quality signals upstream and add a first-pass-yield gate before repeated work.',
        'estimated_saving_kg': round(carbon_kg * 0.35, 2),
        'confidence': 0.74,
        'evidence': {'repeat_count': loop['repeat_count'], 'activity_carbon_kg': carbon_kg},
        'risk': {'capacity': 'medium', 'quality': 'low', 'implementation': 'medium'},
        'verification': 'Track first-pass yield and repeat activity rate for the next production window.',
        'status': 'pending_review',
    }


def resource_recommendation(resource: dict[str, Any], loads: list[dict[str, Any]]) -> dict[str, Any]:
    load = next((item for item in loads if item['resource'] == resource['resource']), {})
    return {
        'title': f"Balance load away from {resource['resource']}",
        'target': resource['resource'],
        'reason': f"This resource is responsible for {resource['carbon_kg']} kg CO2e.",
        'action': 'Use the graph to find shared activities and test an alternate assignment.',
        'estimated_saving_kg': round(resource['carbon_kg'] * 0.08, 2),
        'confidence': 0.68,
        'evidence': {'resource_carbon_kg': resource['carbon_kg'], 'load': load},
        'risk': {'capacity': 'medium', 'quality': 'medium', 'implementation': 'high'},
        'verification': 'Run a limited alternate assignment and compare resource utilization.',
        'status': 'pending_review',
    }
