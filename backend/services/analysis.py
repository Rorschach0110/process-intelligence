from __future__ import annotations

from collections import Counter, defaultdict
from typing import Any

from models import Event


def activity_durations(by_case: dict[str, list[Event]]) -> list[dict[str, Any]]:
    buckets: dict[str, list[float]] = defaultdict(list)
    for case_events in by_case.values():
        ordered = sorted(case_events, key=lambda event: event.timestamp)
        for current, next_event in zip(ordered, ordered[1:]):
            duration = (next_event.timestamp - current.timestamp).total_seconds() / 60
            buckets[current.activity].append(max(duration, 0))

    return sorted(
        [
            {
                'activity': activity,
                'avg_duration_min': round(sum(values) / len(values), 1),
                'total_duration_min': round(sum(values), 1),
                'samples': len(values),
            }
            for activity, values in buckets.items()
        ],
        key=lambda row: row['total_duration_min'],
        reverse=True,
    )


def timing_metrics(by_case: dict[str, list[Event]]) -> dict[str, Any]:
    execution: dict[str, list[float]] = defaultdict(list)
    waiting: dict[str, list[float]] = defaultdict(list)
    for case_events in by_case.values():
        ordered = sorted(case_events, key=lambda event: event.timestamp)
        for previous, current in zip(ordered, ordered[1:]):
            gap = max((current.timestamp - previous.timestamp).total_seconds() / 60, 0)
            execution[previous.activity].append(gap)
            waiting[current.activity].append(gap)
    return {
        'execution_time': duration_rows(execution),
        'waiting_time': duration_rows(waiting),
    }


def duration_rows(values: dict[str, list[float]]) -> list[dict[str, Any]]:
    return sorted(
        [
            {
                'activity': activity,
                'avg_min': round(sum(items) / len(items), 1),
                'total_min': round(sum(items), 1),
                'samples': len(items),
            }
            for activity, items in values.items()
        ],
        key=lambda row: row['total_min'],
        reverse=True,
    )


def resource_load(by_case: dict[str, list[Event]]) -> list[dict[str, Any]]:
    events = [event for case_events in by_case.values() for event in case_events]
    if not events:
        return []
    window = max((max(event.timestamp for event in events) - min(event.timestamp for event in events)).total_seconds() / 3600, 1)
    counts = Counter(event.resource for event in events)
    return [
        {
            'resource': resource,
            'events': count,
            'events_per_hour': round(count / window, 2),
            'utilization_index': round(min(count / max(counts.values()), 1), 2),
        }
        for resource, count in counts.most_common()
    ]


def rework_loops(by_case: dict[str, list[Event]]) -> list[dict[str, Any]]:
    loops = Counter()
    for case_id, case_events in by_case.items():
        ordered = sorted(case_events, key=lambda event: event.timestamp)
        seen: set[str] = set()
        for event in ordered:
            if event.activity in seen:
                loops[(case_id, event.activity)] += 1
            seen.add(event.activity)

    totals = Counter()
    for (_, activity), count in loops.items():
        totals[activity] += count
    return [
        {'activity': activity, 'repeat_count': count}
        for activity, count in totals.most_common()
    ]


def rework_paths(by_case: dict[str, list[Event]]) -> list[dict[str, Any]]:
    paths = []
    for case_id, case_events in by_case.items():
        ordered = sorted(case_events, key=lambda event: event.timestamp)
        seen: dict[str, int] = {}
        for index, event in enumerate(ordered):
            if event.activity in seen:
                paths.append({
                    'case_id': case_id,
                    'activity': event.activity,
                    'from_index': seen[event.activity],
                    'to_index': index,
                    'path': ' -> '.join(item.activity for item in ordered[seen[event.activity]:index + 1]),
                })
            seen[event.activity] = index
    return paths


def compliance_deviations(by_case: dict[str, list[Event]]) -> list[dict[str, Any]]:
    variants = Counter(tuple(event.activity for event in sorted(items, key=lambda event: event.timestamp)) for items in by_case.values())
    if not variants:
        return []
    reference = list(variants.most_common(1)[0][0])
    deviations = []
    for case_id, case_events in by_case.items():
        path = [event.activity for event in sorted(case_events, key=lambda event: event.timestamp)]
        missing = [activity for activity in reference if activity not in path]
        if missing or path != reference:
            deviations.append({'case_id': case_id, 'missing': missing, 'path': ' -> '.join(path)})
    return deviations


def health_score(process: dict[str, Any]) -> dict[str, Any]:
    cases = max(process.get('cases', 1), 1)
    variants = len(process.get('variant_details', []))
    reworks = len(process.get('rework_paths', []))
    deviations = len(process.get('compliance_deviations', []))
    penalty = min(70, variants * 4 + reworks * 8 + deviations * 5)
    score = max(0, 100 - penalty)
    return {
        'score': score,
        'grade': 'A' if score >= 85 else 'B' if score >= 70 else 'C',
        'signals': {
            'variant_count': variants,
            'rework_cases': reworks,
            'deviation_rate': round(deviations / cases, 3),
        },
    }
