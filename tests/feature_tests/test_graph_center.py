import sys
import tempfile
import unittest
from pathlib import Path


ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(ROOT / 'backend'))

from graphing.neo4j import Neo4jAdapter  # noqa: E402
from graphing.query import query_graph, subgraph  # noqa: E402
from pipeline.runner import run_pipeline  # noqa: E402
from repositories.db import init_db  # noqa: E402
from repositories.graph import list_graph_snapshots, save_graph_snapshot  # noqa: E402


class GraphCenterTestCase(unittest.TestCase):
    def setUp(self) -> None:
        self.graph = run_pipeline()['knowledge_graph']

    def test_extended_schema_and_subgraph(self) -> None:
        self.assertEqual(self.graph['schema_version'], 'graph.v2')
        self.assertIn('case', self.graph['schema']['node_types'])
        self.assertGreaterEqual(len(subgraph(self.graph, 'activity:Assembly')['nodes']), 1)

    def test_query_filters_and_neo4j_plan(self) -> None:
        result = query_graph(self.graph, kind='activity', min_carbon=20)
        self.assertGreaterEqual(len(result['nodes']), 1)
        plan = Neo4jAdapter().import_plan(self.graph)
        self.assertTrue(plan['cypher'].startswith('MERGE'))

    def test_graph_snapshot_repository(self) -> None:
        with tempfile.TemporaryDirectory() as folder:
            db_path = Path(folder) / 'app.sqlite3'
            init_db(db_path)
            save_graph_snapshot('run-1', self.graph, db_path)
            self.assertEqual(list_graph_snapshots(db_path)[0]['schema_version'], 'graph.v2')


if __name__ == '__main__':
    unittest.main()

