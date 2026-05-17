import sys
import tempfile
import unittest
from pathlib import Path


ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(ROOT / 'backend'))

from pipeline.runner import run_pipeline  # noqa: E402
from repositories.db import init_db  # noqa: E402
from centers.reports import generate_report, list_reports, save_report  # noqa: E402


class ReportCenterTestCase(unittest.TestCase):
    def test_generate_and_save_report(self) -> None:
        result = run_pipeline()
        report = generate_report(result, 'engineering')
        self.assertIn('Audit', report['content_html'])
        self.assertTrue(report['file_path'].endswith('.html'))

        with tempfile.TemporaryDirectory() as folder:
            db_path = Path(folder) / 'app.sqlite3'
            init_db(db_path)
            report_id = save_report(report, db_path)
            self.assertGreater(report_id, 0)
            self.assertEqual(list_reports(db_path)[0]['report_type'], 'engineering')


if __name__ == '__main__':
    unittest.main()


