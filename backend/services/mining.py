from __future__ import annotations

from collections import Counter, defaultdict
from typing import Any

from models import Event
from services.analysis import (
    activity_durations,
    compliance_deviations,
    health_score,
    resource_load,
    rework_loops,
    rework_paths,
    timing_metrics,
)


def mine_process(events: list[Event]) -> dict[str, Any]:
    by_case: dict[str, list[Event]] = defaultdict(list)
    activity_counter = Counter()
    resource_counter = Counter()
    edge_counter = Counter()
    variants = Counter()
    durations: list[float] = []

    for event in events:
        by_case[event.case_id].append(event)
        activity_counter[event.activity] += 1
        resource_counter[event.resource] += 1

    for case_events in by_case.values():
        ordered = sorted(case_events, key=lambda event: event.timestamp)
        variants[tuple(event.activity for event in ordered)] += 1
        if len(ordered) > 1:
            duration = (ordered[-1].timestamp - ordered[0].timestamp).total_seconds()
            durations.append(duration / 60)
        for previous, current in zip(ordered, ordered[1:]):
            edge_counter[(previous.activity, current.activity)] += 1

    result = {
        'cases': len(by_case),
        'events': len(events),
        'schema_version': 'process.v1',
        'activities': [
            {'name': name, 'count': count}
            for name, count in activity_counter.most_common()
        ],
        'resources': [
            {'name': name, 'count': count}
            for name, count in resource_counter.most_common()
        ],
        'edges': [
            {'source': source, 'target': target, 'count': count}
            for (source, target), count in edge_counter.most_common()
        ],
        'variants': [
            {'path': ' -> '.join(path), 'count': count}
            for path, count in variants.most_common(5)
        ],
        'variant_details': [
            {'id': index + 1, 'path': list(path), 'count': count, 'share': round(count / max(len(by_case), 1), 3)}
            for index, (path, count) in enumerate(variants.most_common())
        ],
        'avg_case_duration_min': round(sum(durations) / len(durations), 1) if durations else 0,
        'bottlenecks': activity_durations(by_case)[:3],
        'resource_load': resource_load(by_case),
        'rework_loops': rework_loops(by_case),
        'rework_paths': rework_paths(by_case),
        'timing': timing_metrics(by_case),
        'compliance_deviations': compliance_deviations(by_case),
    }
    result['health_score'] = health_score(result)
    return result
