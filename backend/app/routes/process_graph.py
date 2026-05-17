from __future__ import annotations

from fastapi import APIRouter

from centers.process_compare import compare_processes
from graphing.exports import graph_cypher
from graphing.neo4j import Neo4jAdapter
from graphing.query import query_graph, subgraph
from storage.current import current_result


router = APIRouter(prefix='/api')


@router.get('/process/summary')
async def process_summary() -> dict[str, object]:
    return {'process': current_result()['process']}


@router.get('/process/compare')
async def process_compare() -> dict[str, object]:
    baseline = current_result()['process']
    return {'comparison': compare_processes(baseline, baseline)}


@router.get('/graph/export')
async def graph_export(format: str = 'json') -> dict[str, object]:
    graph = current_result()['knowledge_graph']
    if format == 'cypher':
        return {'format': 'cypher', 'content': graph_cypher(graph)}
    return {'format': 'json', 'content': graph}


@router.get('/graph/query')
async def graph_query(kind: str = '', q: str = '', relation: str = '', min_carbon: float = 0) -> dict[str, object]:
    graph = current_result()['knowledge_graph']
    return query_graph(graph, kind, q, relation, min_carbon)


@router.get('/graph/subgraph')
async def graph_subgraph(node_id: str) -> dict[str, object]:
    return subgraph(current_result()['knowledge_graph'], node_id)


@router.get('/graph/neo4j-plan')
async def graph_neo4j_plan() -> dict[str, object]:
    return Neo4jAdapter().import_plan(current_result()['knowledge_graph'])
