from __future__ import annotations

from typing import Any


def compare_processes(left: dict[str, Any], right: dict[str, Any]) -> dict[str, Any]:
    return {
        'events_delta': right.get('events', 0) - left.get('events', 0),
        'cases_delta': right.get('cases', 0) - left.get('cases', 0),
        'duration_delta_min': round(
            right.get('avg_case_duration_min', 0) - left.get('avg_case_duration_min', 0),
            1,
        ),
        'health_delta': right.get('health_score', {}).get('score', 0) - left.get('health_score', {}).get('score', 0),
        'activity_changes': activity_changes(left, right),
    }


def activity_changes(left: dict[str, Any], right: dict[str, Any]) -> list[dict[str, Any]]:
    left_counts = {item['name']: item['count'] for item in left.get('activities', [])}
    right_counts = {item['name']: item['count'] for item in right.get('activities', [])}
    names = sorted(set(left_counts) | set(right_counts))
    return [
        {
            'activity': name,
            'left': left_counts.get(name, 0),
            'right': right_counts.get(name, 0),
            'delta': right_counts.get(name, 0) - left_counts.get(name, 0),
        }
        for name in names
    ]
