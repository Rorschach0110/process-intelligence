from __future__ import annotations

from typing import Any

from optimization.providers import OpenAICompatibleProvider
from optimization.rules import RuleBasedOptimizer
from optimization.audit import record_llm_audit
from optimization.schema import OptimizerProvider, validate_optimization


def optimize(
    process: dict[str, Any],
    carbon: dict[str, Any],
    graph: dict[str, Any],
    provider: OptimizerProvider | None = None,
) -> dict[str, Any]:
    fallback = RuleBasedOptimizer()
    active_provider = provider or fallback
    try:
        result = active_provider.optimize(process, carbon, graph)
        if validate_optimization(result):
            record_llm_audit(active_provider.__class__.__name__, 'process-carbon-graph optimization', 'success')
            return result
    except Exception as error:
        record_llm_audit(
            active_provider.__class__.__name__,
            'process-carbon-graph optimization',
            'failed',
            str(error),
            True,
        )
    return fallback.optimize(process, carbon, graph)


def openai_provider() -> OpenAICompatibleProvider:
    return OpenAICompatibleProvider()
