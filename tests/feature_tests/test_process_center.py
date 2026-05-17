import sys
import unittest
from pathlib import Path


ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(ROOT / 'backend'))

from pipeline.runner import run_pipeline  # noqa: E402
from centers.process_compare import compare_processes  # noqa: E402


class ProcessCenterTestCase(unittest.TestCase):
    def setUp(self) -> None:
        self.process = run_pipeline()['process']

    def test_process_schema_and_health(self) -> None:
        self.assertEqual(self.process['schema_version'], 'process.v1')
        self.assertIn('execution_time', self.process['timing'])
        self.assertGreaterEqual(self.process['health_score']['score'], 0)
        self.assertGreaterEqual(len(self.process['variant_details']), 1)

    def test_rework_and_compliance_details(self) -> None:
        self.assertGreaterEqual(len(self.process['rework_paths']), 1)
        self.assertGreaterEqual(len(self.process['compliance_deviations']), 1)

    def test_compare_processes(self) -> None:
        comparison = compare_processes(self.process, self.process)
        self.assertEqual(comparison['events_delta'], 0)
        self.assertEqual(comparison['health_delta'], 0)


if __name__ == '__main__':
    unittest.main()


