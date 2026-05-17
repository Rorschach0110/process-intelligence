import sys
import tempfile
import unittest
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / 'backend'))

from pipeline.runner import run_pipeline  # noqa: E402
from graphing.exports import graph_cypher  # noqa: E402
from models import CarbonFactors, FieldMapping  # noqa: E402
from optimization.providers import OpenAICompatibleProvider  # noqa: E402
from services.ingestion import preview_csv, validate_csv  # noqa: E402


class PipelineTestCase(unittest.TestCase):
    def setUp(self) -> None:
        self.result = run_pipeline()

    def test_process_summary(self) -> None:
        process = self.result['process']
        self.assertEqual(process['events'], 24)
        self.assertEqual(process['cases'], 5)
        self.assertEqual(process['avg_case_duration_min'], 216.0)

    def test_carbon_summary(self) -> None:
        summary = self.result['carbon']['summary']
        self.assertEqual(summary['total_carbon_kg'], 260.53)
        self.assertEqual(summary['carbon_per_case_kg'], 52.11)

    def test_knowledge_graph_shape(self) -> None:
        graph = self.result['knowledge_graph']
        self.assertEqual(graph['schema_version'], 'graph.v2')
        self.assertGreaterEqual(len(graph['nodes']), 15)
        self.assertGreaterEqual(len(graph['edges']), 25)
        self.assertIn('activity', graph['schema']['node_types'])
        self.assertIn('case', graph['schema']['node_types'])
        self.assertIn('NEXT', graph['schema']['relation_types'])

    def test_optimization_summary(self) -> None:
        optimization = self.result['optimization']
        self.assertEqual(optimization['estimated_saving_kg'], 29.31)
        self.assertEqual(len(optimization['recommendations']), 3)
        self.assertIn('evidence', optimization['recommendations'][0])

    def test_custom_mapping_and_factors(self) -> None:
        with tempfile.TemporaryDirectory() as folder:
            path = Path(folder) / 'custom.csv'
            path.write_text(
                'case,step,time,worker,power,material,machine\n'
                'A,Cut,2026-01-01 08:00:00,R1,10,2,M1\n'
                'A,Pack,2026-01-01 09:00:00,R2,5,1,M2\n',
                encoding='utf-8',
            )
            mapping = FieldMapping('case', 'step', 'time', 'worker', 'power', 'material', 'machine')
            result = run_pipeline(path, mapping, CarbonFactors(1.0, 2.0))
        self.assertEqual(result['process']['events'], 2)
        self.assertEqual(result['carbon']['summary']['total_carbon_kg'], 21.0)

    def test_csv_preview_and_validation(self) -> None:
        preview = preview_csv(ROOT / 'data' / 'sample_event_log.csv', limit=2)
        self.assertEqual(preview['fields'][0], 'case_id')
        self.assertEqual(len(preview['preview']), 2)
        issues = validate_csv(ROOT / 'data' / 'sample_event_log.csv', FieldMapping())
        self.assertEqual(issues, [])

    def test_graph_cypher_export(self) -> None:
        content = graph_cypher(self.result['knowledge_graph'])
        self.assertIn('MERGE (:process', content)
        self.assertIn('MERGE (a)-[:NEXT', content)

    def test_openai_payload_requests_json(self) -> None:
        payload = OpenAICompatibleProvider().request_payload(
            self.result['process'],
            self.result['carbon'],
            self.result['knowledge_graph'],
        )
        self.assertEqual(payload['response_format']['type'], 'json_object')


if __name__ == '__main__':
    unittest.main()
