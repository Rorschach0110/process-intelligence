import sys
import tempfile
import unittest
from pathlib import Path


ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(ROOT / 'backend'))

from pipeline.runner import run_pipeline  # noqa: E402
from repositories.db import init_db  # noqa: E402
from centers.simulation import evaluate_scenario, list_scenarios, save_scenario  # noqa: E402


class SimulationCenterTestCase(unittest.TestCase):
    def test_scenario_evaluation_and_ranking(self) -> None:
        baseline = run_pipeline()
        results = evaluate_scenario(
            baseline,
            {'carbon_reduction_rate': 0.1, 'capacity_delta': -0.02, 'cost_delta': 0.01},
        )
        self.assertGreater(results['estimated_saving_kg'], 0)
        self.assertIn('priority_score', results)

        with tempfile.TemporaryDirectory() as folder:
            db_path = Path(folder) / 'app.sqlite3'
            init_db(db_path)
            save_scenario('Scenario A', 'run-1', {'carbon_reduction_rate': 0.1}, results, db_path)
            self.assertEqual(list_scenarios(db_path)[0]['name'], 'Scenario A')


if __name__ == '__main__':
    unittest.main()


