import sys
import tempfile
import unittest
from pathlib import Path


ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(ROOT / 'backend'))

from pipeline.runner import run_pipeline  # noqa: E402
from repositories.carbon import active_factor_values, list_factors, save_factor  # noqa: E402
from repositories.db import init_db  # noqa: E402


class CarbonCenterTestCase(unittest.TestCase):
    def test_factor_library_and_dimensions(self) -> None:
        with tempfile.TemporaryDirectory() as folder:
            db_path = Path(folder) / 'app.sqlite3'
            init_db(db_path)
            save_factor(
                {
                    'name': 'Grid',
                    'factor_type': 'electricity',
                    'unit': 'kgCO2e/kWh',
                    'value': 0.5,
                    'source': 'test',
                    'version': 'v1',
                    'scope': 'Scope 2',
                },
                db_path,
            )
            self.assertEqual(list_factors(db_path)[0]['scope'], 'Scope 2')
            self.assertEqual(active_factor_values(db_path)['electricity'], 0.5)

        carbon = run_pipeline()['carbon']
        self.assertIn('dimensions', carbon)
        self.assertIn('by_order', carbon['dimensions'])
        self.assertEqual(carbon['dimensions']['scopes']['Scope 2'], 'electricity')


if __name__ == '__main__':
    unittest.main()

