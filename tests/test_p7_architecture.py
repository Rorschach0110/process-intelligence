import sys
import tempfile
import unittest
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / 'backend'))

from repositories.datasets import dataset_id_for_file, list_datasets, upsert_dataset  # noqa: E402
from repositories.db import init_db  # noqa: E402
from repositories.runs import list_run_summaries, save_run_summary  # noqa: E402


class ArchitectureTestCase(unittest.TestCase):
    def test_sqlite_repositories_store_datasets_and_runs(self) -> None:
        with tempfile.TemporaryDirectory() as folder:
            db_path = Path(folder) / 'app.sqlite3'
            init_db(db_path)
            dataset_id = upsert_dataset('data/uploads/a.csv', ['case_id'], [{'case_id': 'A'}], db_path)
            save_run_summary(
                {
                    'run_id': 'run-1',
                    'created_at': '2026-05-13T10:00:00',
                    'source': {'file': 'data/uploads/a.csv'},
                    'status': 'completed',
                    'events': 1,
                    'cases': 1,
                    'total_carbon_kg': 2.5,
                    'estimated_saving_kg': 0.5,
                    'result_path': 'data/runs/run-1.json',
                },
                dataset_id,
                db_path,
            )

            self.assertEqual(dataset_id_for_file('data/uploads/a.csv', db_path), dataset_id)
            self.assertEqual(len(list_datasets(db_path)), 1)
            self.assertEqual(list_run_summaries(1, db_path)[0]['run_id'], 'run-1')


if __name__ == '__main__':
    unittest.main()
