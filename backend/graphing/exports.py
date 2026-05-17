from __future__ import annotations

import json
from typing import Any


def graph_json(graph: dict[str, Any]) -> str:
    return json.dumps(graph, ensure_ascii=False, indent=2)


def graph_cypher(graph: dict[str, Any]) -> str:
    lines = [node_statement(node) for node in graph.get('nodes', [])]
    lines.extend(edge_statement(edge) for edge in graph.get('edges', []))
    return '\n'.join(lines)


def node_statement(node: dict[str, Any]) -> str:
    label = safe_label(node.get('kind', 'Node'))
    props = {'id': node['id'], 'label': node.get('label', ''), **node.get('properties', {})}
    return f'MERGE (:{label} {cypher_props(props)});'


def edge_statement(edge: dict[str, Any]) -> str:
    relation = safe_label(edge.get('relation', 'RELATED_TO')).upper()
    props = cypher_props(edge.get('properties', {}))
    return (
        f"MATCH (a {{id: {json.dumps(edge['source'])}}}), "
        f"(b {{id: {json.dumps(edge['target'])}}}) "
        f'MERGE (a)-[:{relation} {props}]->(b);'
    )


def cypher_props(props: dict[str, Any]) -> str:
    parts = []
    for key, value in props.items():
        if isinstance(value, (int, float)):
            rendered = str(value)
        else:
            rendered = json.dumps(str(value), ensure_ascii=False)
        parts.append(f'{safe_key(key)}: {rendered}')
    return '{' + ', '.join(parts) + '}'


def safe_label(value: str) -> str:
    return ''.join(char if char.isalnum() else '_' for char in value).strip('_') or 'Node'


def safe_key(value: str) -> str:
    key = safe_label(value)
    return key[0].lower() + key[1:] if key else 'value'
