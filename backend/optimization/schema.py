from __future__ import annotations

from typing import Any, Protocol


class OptimizerProvider(Protocol):
    def optimize(
        self,
        process: dict[str, Any],
        carbon: dict[str, Any],
        graph: dict[str, Any],
    ) -> dict[str, Any]:
        ...


REQUIRED_RECOMMENDATION_FIELDS = {
    'title',
    'target',
    'reason',
    'action',
    'estimated_saving_kg',
    'confidence',
    'evidence',
}


def validate_optimization(payload: dict[str, Any]) -> bool:
    recommendations = payload.get('recommendations')
    if not isinstance(recommendations, list):
        return False
    return all(REQUIRED_RECOMMENDATION_FIELDS <= set(item) for item in recommendations)
