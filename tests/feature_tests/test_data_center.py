import sys
import tempfile
import unittest
from pathlib import Path


ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(ROOT / 'backend'))

from models import FieldMapping  # noqa: E402
from repositories.datasets import get_dataset, get_dataset_profile, save_dataset_profile, upsert_dataset  # noqa: E402
from repositories.db import init_db  # noqa: E402
from repositories.templates import list_mapping_templates, save_mapping_template  # noqa: E402
from services.ingestion import preview_csv_page  # noqa: E402
from centers.quality import quality_report  # noqa: E402


class DataCenterTestCase(unittest.TestCase):
    def test_dataset_profile_template_and_paged_preview(self) -> None:
        with tempfile.TemporaryDirectory() as folder:
            db_path = Path(folder) / 'app.sqlite3'
            csv_path = Path(folder) / 'events.csv'
            csv_path.write_text(
                'case_id,activity,timestamp,energy_kwh,material_kg\n'
                'A,Cut,2026-01-01 08:00:00,1,2\n'
                'A,Pack,bad-time,x,3\n',
                encoding='utf-8',
            )
            init_db(db_path)
            dataset_id = upsert_dataset('events.csv', ['case_id'], [{'case_id': 'A'}], db_path)
            report = quality_report(csv_path, FieldMapping())
            save_dataset_profile(dataset_id, FieldMapping().__dict__, report, db_path)
            save_mapping_template('standard', FieldMapping().__dict__, db_path)

            self.assertEqual(get_dataset(dataset_id, db_path)['name'], 'events.csv')
            self.assertEqual(get_dataset_profile(dataset_id, db_path)['quality']['invalid_timestamps'], 1)
            self.assertEqual(len(list_mapping_templates(db_path)), 1)
            self.assertEqual(preview_csv_page(csv_path, page=2, page_size=1)['preview'][0]['activity'], 'Pack')


if __name__ == '__main__':
    unittest.main()


