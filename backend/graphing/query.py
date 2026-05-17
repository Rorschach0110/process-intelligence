from __future__ import annotations

from typing import Any


def query_graph(
    graph: dict[str, Any],
    kind: str = '',
    text: str = '',
    relation: str = '',
    min_carbon: float = 0,
) -> dict[str, Any]:
    kind = kind.strip().lower()
    text = text.strip().lower()
    nodes = [
        node for node in graph.get('nodes', [])
        if matches_node(node, kind, text, min_carbon)
    ]
    node_ids = {node['id'] for node in nodes}
    edges = [
        edge for edge in graph.get('edges', [])
        if edge['source'] in node_ids or edge['target'] in node_ids
    ]
    if relation:
        edges = [edge for edge in edges if edge.get('relation') == relation]
    return {'nodes': nodes, 'edges': edges}


def subgraph(graph: dict[str, Any], node_id: str) -> dict[str, Any]:
    edges = [
        edge for edge in graph.get('edges', [])
        if edge['source'] == node_id or edge['target'] == node_id
    ]
    ids = {node_id} | {edge['source'] for edge in edges} | {edge['target'] for edge in edges}
    nodes = [node for node in graph.get('nodes', []) if node['id'] in ids]
    return {'nodes': nodes, 'edges': edges}


def matches_node(node: dict[str, Any], kind: str, text: str, min_carbon: float) -> bool:
    if kind and node.get('kind', '').lower() != kind:
        return False
    carbon = float(node.get('properties', {}).get('carbon_kg', 0) or 0)
    if min_carbon and carbon < min_carbon:
        return False
    if not text:
        return True
    haystack = ' '.join(
        [
            str(node.get('id', '')),
            str(node.get('label', '')),
            ' '.join(str(value) for value in node.get('properties', {}).values()),
        ]
    ).lower()
    return text in haystack
