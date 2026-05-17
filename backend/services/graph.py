from __future__ import annotations

from collections import Counter, defaultdict
from typing import Any

from models import Event


def build_knowledge_graph(
    process: dict[str, Any],
    carbon: dict[str, Any],
    events: list[Event],
) -> dict[str, Any]:
    nodes: list[dict[str, Any]] = []
    edges: list[dict[str, Any]] = []
    seen_nodes: set[str] = set()
    seen_edges: set[tuple[str, str, str]] = set()

    def add_node(node_id: str, label: str, kind: str, **props: Any) -> None:
        if node_id in seen_nodes:
            return
        seen_nodes.add(node_id)
        nodes.append({'id': node_id, 'label': label, 'kind': kind, 'properties': props})

    def add_edge(source: str, target: str, relation: str, **props: Any) -> None:
        key = (source, target, relation)
        if key in seen_edges:
            return
        seen_edges.add(key)
        edges.append({'source': source, 'target': target, 'relation': relation, 'properties': props})

    add_node('process:main', 'Closed-loop process', 'process', cases=process['cases'], events=process['events'])
    add_node('carbon:total', 'Total carbon', 'metric', **carbon['summary'])
    add_activity_nodes(process, carbon, events, add_node, add_edge)
    add_case_nodes(events, add_node, add_edge)
    add_bottleneck_nodes(process, add_node, add_edge)
    add_process_edges(process, add_edge)

    return {
        'schema_version': 'graph.v2',
        'nodes': nodes,
        'edges': edges,
        'schema': {
            'node_types': sorted({node['kind'] for node in nodes}),
            'relation_types': sorted({edge['relation'] for edge in edges}),
        },
    }


def add_case_nodes(events: list[Event], add_node: Any, add_edge: Any) -> None:
    for event in events:
        case_id = f'case:{event.case_id}'
        product = event.case_id.split('-')[0] if '-' in event.case_id else 'Unknown Product'
        add_node(case_id, event.case_id, 'case', product=product)
        add_node(f'product:{product}', product, 'product')
        add_node(f'device:{event.device}', event.device, 'device')
        add_node(f'material:{event.activity}', f"{event.activity} material", 'material')
        add_edge(case_id, f"activity:{event.activity}", 'CONTAINS_EVENT')
        add_edge(case_id, f'product:{product}', 'PRODUCES')
        add_edge(f"resource:{event.resource}", f'device:{event.device}', 'RUNS_ON')
        add_edge(f"activity:{event.activity}", f'material:{event.activity}', 'CONSUMES_MATERIAL')


def add_bottleneck_nodes(process: dict[str, Any], add_node: Any, add_edge: Any) -> None:
    for item in process.get('bottlenecks', []):
        node_id = f"bottleneck:{item['activity']}"
        add_node(node_id, f"{item['activity']} bottleneck", 'bottleneck', **item)
        add_edge(f"activity:{item['activity']}", node_id, 'CAUSES_BOTTLENECK')


def add_activity_nodes(
    process: dict[str, Any],
    carbon: dict[str, Any],
    events: list[Event],
    add_node: Any,
    add_edge: Any,
) -> None:
    event_by_activity = {row['activity']: row for row in carbon['by_activity']}
    resource_by_activity: dict[str, Counter] = defaultdict(Counter)
    device_by_resource: dict[str, Counter] = defaultdict(Counter)

    for event in events:
        resource_by_activity[event.activity][event.resource] += 1
        device_by_resource[event.resource][event.device] += 1

    for activity in process['activities']:
        activity_id = f"activity:{activity['name']}"
        carbon_row = event_by_activity.get(activity['name'], {})
        add_node(activity_id, activity['name'], 'activity', **carbon_row)
        add_edge('process:main', activity_id, 'HAS_ACTIVITY', frequency=activity['count'])
        add_edge(activity_id, 'carbon:total', 'CONTRIBUTES_TO', carbon_kg=carbon_row.get('carbon_kg', 0))
        add_resource_edges(activity['name'], resource_by_activity, device_by_resource, add_node, add_edge)


def add_resource_edges(
    activity: str,
    resource_by_activity: dict[str, Counter],
    device_by_resource: dict[str, Counter],
    add_node: Any,
    add_edge: Any,
) -> None:
    for resource, count in resource_by_activity[activity].most_common():
        resource_id = f'resource:{resource}'
        device = device_by_resource[resource].most_common(1)[0][0]
        add_node(resource_id, resource, 'resource', device=device)
        add_edge(f'activity:{activity}', resource_id, 'USES_RESOURCE', count=count)


def add_process_edges(process: dict[str, Any], add_edge: Any) -> None:
    for edge in process['edges']:
        add_edge(f"activity:{edge['source']}", f"activity:{edge['target']}", 'NEXT', count=edge['count'])
