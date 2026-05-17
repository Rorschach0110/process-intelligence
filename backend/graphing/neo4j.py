from __future__ import annotations

from typing import Any

from graphing.exports import graph_cypher


class Neo4jAdapter:
    def export(self, graph: dict[str, Any]) -> str:
        return graph_cypher(graph)

    def import_plan(self, graph: dict[str, Any]) -> dict[str, Any]:
        return {
            'adapter': 'neo4j',
            'mode': 'optional',
            'node_count': len(graph.get('nodes', [])),
            'edge_count': len(graph.get('edges', [])),
            'cypher': self.export(graph),
        }
