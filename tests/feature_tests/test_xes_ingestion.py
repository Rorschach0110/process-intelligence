import sys
import tempfile
import unittest
from pathlib import Path


ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(ROOT / 'backend'))

from services.ingestion import load_events, preview_csv  # noqa: E402
from services.xes import convert_xes_to_csv  # noqa: E402


class XesIngestionTestCase(unittest.TestCase):
    def test_xes_is_converted_to_standard_csv(self) -> None:
        with tempfile.TemporaryDirectory() as folder:
            source = Path(folder) / 'events.xes'
            source.write_text(
                '<?xml version="1.0" encoding="utf-8"?>'
                '<log xmlns="http://www.xes-standard.org/">'
                '<trace><string key="concept:name" value="case-1"/>'
                '<event><string key="case_id" value="case-1"/>'
                '<string key="activity" value="Cut"/>'
                '<date key="timestamp" value="2026-01-01T08:00:00+00:00"/>'
                '<string key="resource" value="R1"/>'
                '<float key="碳排放量" value="2.5"/>'
                '<float key="能源碳排放" value="1.8"/>'
                '<float key="物料碳排放" value="0.7"/>'
                '</event></trace></log>',
                encoding='utf-8',
            )
            csv_path = convert_xes_to_csv(source)
            preview = preview_csv(csv_path)
            events = load_events(csv_path)

        self.assertEqual(preview['total_rows'], 1)
        self.assertEqual(preview['fields'][:3], ['case_id', 'activity', 'timestamp'])
        self.assertEqual(events[0].case_id, 'case-1')
        self.assertAlmostEqual(events[0].energy_kwh * 0.581 + events[0].material_kg * 1.82, 2.5, places=4)


if __name__ == '__main__':
    unittest.main()
