import sys
import tempfile
import unittest
from pathlib import Path


ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(ROOT / 'backend'))

from optimization.audit import record_llm_audit  # noqa: E402
from pipeline.runner import run_pipeline  # noqa: E402
from repositories.db import init_db, session  # noqa: E402
from repositories.optimization import list_providers, list_recommendations, save_provider, save_recommendations  # noqa: E402


class OptimizationCenterTestCase(unittest.TestCase):
    def test_recommendation_risk_and_provider_repository(self) -> None:
        result = run_pipeline()
        recommendation = result['optimization']['recommendations'][0]
        self.assertIn('risk', recommendation)
        self.assertIn('verification', recommendation)

        with tempfile.TemporaryDirectory() as folder:
            db_path = Path(folder) / 'app.sqlite3'
            init_db(db_path)
            save_recommendations('run-1', [recommendation], db_path)
            save_provider({'name': 'local', 'base_url': 'http://local', 'model': 'test'}, db_path)
            record_llm_audit('local', 'summary', 'failed', 'boom', True, db_path)
            self.assertEqual(len(list_recommendations(db_path)), 1)
            self.assertEqual(list_providers(db_path)[0]['name'], 'local')
            with session(db_path) as connection:
                row = connection.execute('SELECT used_fallback FROM llm_audit_logs').fetchone()
            self.assertEqual(row['used_fallback'], 1)


if __name__ == '__main__':
    unittest.main()

