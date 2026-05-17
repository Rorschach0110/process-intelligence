from __future__ import annotations

from datetime import datetime
from pathlib import Path
from typing import Any

from config import APP_DB, REPORTS_DIR, ROOT
from repositories.db import init_db, session


REPORT_TYPES = ('executive', 'engineering', 'carbon', 'maintenance')


def generate_report(result: dict[str, Any], report_type: str = 'executive') -> dict[str, Any]:
    report_type = report_type if report_type in REPORT_TYPES else 'executive'
    title = f"Process Intelligence {report_type.title()} Report"
    html = render_html(title, result, report_type)
    path = write_report(title, html)
    return {
        'report_type': report_type,
        'run_id': result.get('history', {}).get('run_id', 'ad-hoc'),
        'title': title,
        'content_html': html,
        'file_path': str(path.relative_to(ROOT)),
    }


def save_report(report: dict[str, Any], db_path: Path | None = None) -> int:
    database = db_path if db_path else APP_DB
    init_db(database)
    with session(database) as connection:
        cursor = connection.execute(
            '''
            INSERT INTO reports (report_type, run_id, title, content_html, file_path, created_at)
            VALUES (?, ?, ?, ?, ?, ?)
            ''',
            (
                report['report_type'],
                report['run_id'],
                report['title'],
                report['content_html'],
                report['file_path'],
                datetime.now().isoformat(timespec='seconds'),
            ),
        )
        return int(cursor.lastrowid)


def list_reports(db_path: Path | None = None) -> list[dict[str, Any]]:
    database = db_path if db_path else APP_DB
    init_db(database)
    with session(database) as connection:
        rows = connection.execute('SELECT id, report_type, run_id, title, file_path, created_at FROM reports ORDER BY id DESC').fetchall()
    return [dict(row) for row in rows]


def render_html(title: str, result: dict[str, Any], report_type: str) -> str:
    process = result['process']
    carbon = result['carbon']['summary']
    optimization = result['optimization']
    return (
        f'<h1>{title}</h1>'
        f'<p>Report type: {report_type}</p>'
        f'<h2>Summary</h2><p>Events: {process["events"]}; Cases: {process["cases"]}</p>'
        f'<p>Total carbon: {carbon["total_carbon_kg"]} kg CO2e</p>'
        f'<p>Estimated saving: {optimization["estimated_saving_kg"]} kg CO2e</p>'
        f'<h2>Audit</h2><p>Source: {result["source"]["file"]}; Schema: {process.get("schema_version")}</p>'
    )


def write_report(title: str, html: str) -> Path:
    REPORTS_DIR.mkdir(parents=True, exist_ok=True)
    filename = title.lower().replace(' ', '-') + '-' + datetime.now().strftime('%Y%m%d%H%M%S') + '.html'
    path = REPORTS_DIR / filename
    path.write_text(html, encoding='utf-8')
    return path
