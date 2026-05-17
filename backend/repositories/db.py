from __future__ import annotations

from contextlib import contextmanager
import sqlite3
from pathlib import Path
from typing import Iterator

from config import APP_DB


def connect(path: Path = APP_DB) -> sqlite3.Connection:
    path.parent.mkdir(parents=True, exist_ok=True)
    connection = sqlite3.connect(path)
    connection.row_factory = sqlite3.Row
    return connection


@contextmanager
def session(path: Path = APP_DB) -> Iterator[sqlite3.Connection]:
    connection = connect(path)
    try:
        yield connection
        connection.commit()
    finally:
        connection.close()


def init_db(path: Path = APP_DB) -> None:
    with session(path) as connection:
        connection.executescript(
            '''
            CREATE TABLE IF NOT EXISTS datasets (
              id INTEGER PRIMARY KEY AUTOINCREMENT,
              name TEXT NOT NULL,
              file_path TEXT NOT NULL UNIQUE,
              field_count INTEGER NOT NULL,
              row_count INTEGER NOT NULL,
              created_at TEXT NOT NULL
            );
            CREATE TABLE IF NOT EXISTS pipeline_runs (
              id INTEGER PRIMARY KEY AUTOINCREMENT,
              run_id TEXT NOT NULL UNIQUE,
              dataset_id INTEGER,
              source_file TEXT NOT NULL,
              status TEXT NOT NULL,
              events INTEGER NOT NULL,
              cases INTEGER NOT NULL,
              total_carbon_kg REAL NOT NULL,
              estimated_saving_kg REAL NOT NULL,
              result_path TEXT NOT NULL,
              created_at TEXT NOT NULL,
              FOREIGN KEY(dataset_id) REFERENCES datasets(id)
            );
            CREATE TABLE IF NOT EXISTS dataset_profiles (
              dataset_id INTEGER PRIMARY KEY,
              mapping_json TEXT NOT NULL,
              quality_json TEXT NOT NULL,
              created_at TEXT NOT NULL,
              FOREIGN KEY(dataset_id) REFERENCES datasets(id)
            );
            CREATE TABLE IF NOT EXISTS field_mapping_templates (
              id INTEGER PRIMARY KEY AUTOINCREMENT,
              name TEXT NOT NULL UNIQUE,
              mapping_json TEXT NOT NULL,
              created_at TEXT NOT NULL
            );
            CREATE TABLE IF NOT EXISTS carbon_factors (
              id INTEGER PRIMARY KEY AUTOINCREMENT,
              name TEXT NOT NULL,
              factor_type TEXT NOT NULL,
              unit TEXT NOT NULL,
              value REAL NOT NULL,
              source TEXT NOT NULL,
              version TEXT NOT NULL,
              scope TEXT NOT NULL,
              is_active INTEGER NOT NULL,
              created_at TEXT NOT NULL
            );
            CREATE TABLE IF NOT EXISTS graph_snapshots (
              id INTEGER PRIMARY KEY AUTOINCREMENT,
              run_id TEXT NOT NULL,
              schema_version TEXT NOT NULL,
              graph_json TEXT NOT NULL,
              created_at TEXT NOT NULL
            );
            CREATE TABLE IF NOT EXISTS optimization_recommendations (
              id INTEGER PRIMARY KEY AUTOINCREMENT,
              run_id TEXT NOT NULL,
              title TEXT NOT NULL,
              status TEXT NOT NULL,
              confidence REAL NOT NULL,
              risk_json TEXT NOT NULL,
              evidence_json TEXT NOT NULL,
              created_at TEXT NOT NULL
            );
            CREATE TABLE IF NOT EXISTS llm_providers (
              id INTEGER PRIMARY KEY AUTOINCREMENT,
              name TEXT NOT NULL UNIQUE,
              base_url TEXT NOT NULL,
              model TEXT NOT NULL,
              is_active INTEGER NOT NULL,
              created_at TEXT NOT NULL
            );
            CREATE TABLE IF NOT EXISTS llm_audit_logs (
              id INTEGER PRIMARY KEY AUTOINCREMENT,
              provider TEXT NOT NULL,
              prompt_summary TEXT NOT NULL,
              status TEXT NOT NULL,
              error TEXT NOT NULL,
              used_fallback INTEGER NOT NULL,
              created_at TEXT NOT NULL
            );
            CREATE TABLE IF NOT EXISTS simulation_scenarios (
              id INTEGER PRIMARY KEY AUTOINCREMENT,
              name TEXT NOT NULL,
              run_id TEXT NOT NULL,
              parameters_json TEXT NOT NULL,
              results_json TEXT NOT NULL,
              score REAL NOT NULL,
              created_at TEXT NOT NULL
            );
            CREATE TABLE IF NOT EXISTS reports (
              id INTEGER PRIMARY KEY AUTOINCREMENT,
              report_type TEXT NOT NULL,
              run_id TEXT NOT NULL,
              title TEXT NOT NULL,
              content_html TEXT NOT NULL,
              file_path TEXT NOT NULL,
              created_at TEXT NOT NULL
            );
            CREATE TABLE IF NOT EXISTS users (
              id INTEGER PRIMARY KEY AUTOINCREMENT,
              username TEXT NOT NULL UNIQUE,
              role TEXT NOT NULL,
              organization TEXT NOT NULL,
              created_at TEXT NOT NULL
            );
            CREATE TABLE IF NOT EXISTS audit_logs (
              id INTEGER PRIMARY KEY AUTOINCREMENT,
              actor TEXT NOT NULL,
              action TEXT NOT NULL,
              target TEXT NOT NULL,
              detail_json TEXT NOT NULL,
              created_at TEXT NOT NULL
            );
            CREATE TABLE IF NOT EXISTS app_settings (
              key TEXT PRIMARY KEY,
              value_json TEXT NOT NULL,
              updated_at TEXT NOT NULL
            );
            '''
        )
