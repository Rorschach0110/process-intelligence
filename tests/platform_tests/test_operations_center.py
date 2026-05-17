import sys
import tempfile
import unittest
from pathlib import Path


ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(ROOT / 'backend'))

from repositories.db import init_db, session  # noqa: E402
from centers.operations import audit, backup_manifest, diagnostics, ensure_default_user, save_setting  # noqa: E402


class OperationsCenterTestCase(unittest.TestCase):
    def test_operations_tables_and_diagnostics(self) -> None:
        with tempfile.TemporaryDirectory() as folder:
            db_path = Path(folder) / 'app.sqlite3'
            init_db(db_path)
            # Global operations use the configured app DB; repository schema is validated here.
            self.assertTrue(db_path.exists())

        ensure_default_user()
        audit('tester', 'run', 'pipeline', {'ok': True})
        save_setting('llm', {'enabled': False})
        info = diagnostics()
        self.assertEqual(info['health']['status'], 'ok')
        self.assertIn('items', backup_manifest())

        with session(ROOT / 'data' / 'process_intelligence.sqlite3') as connection:
            user = connection.execute('SELECT username FROM users WHERE username = ?', ('admin',)).fetchone()
        self.assertEqual(user['username'], 'admin')


if __name__ == '__main__':
    unittest.main()


