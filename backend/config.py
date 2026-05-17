from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
WEB_DIR = ROOT / 'web'
DATA_DIR = ROOT / 'data'
SAMPLE_LOG = DATA_DIR / 'sample_event_log.csv'
UPLOAD_DIR = DATA_DIR / 'uploads'
RUNS_DIR = DATA_DIR / 'runs'
REPORTS_DIR = DATA_DIR / 'reports'
CONFIG_DIR = DATA_DIR / 'config'
CARBON_FACTORS_FILE = CONFIG_DIR / 'carbon_factors.json'
APP_DB = DATA_DIR / 'process_intelligence.sqlite3'

HOST = '127.0.0.1'
PORT = 8765

GRID_CARBON_FACTOR = 0.581
MATERIAL_CARBON_FACTOR = 1.82
