from __future__ import annotations

import json
import os
import urllib.request
from typing import Any

from optimization.prompts import build_optimizer_prompt
from optimization.schema import validate_optimization


class OpenAICompatibleProvider:
    def __init__(self) -> None:
        self.base_url = os.getenv('OPENAI_BASE_URL', 'https://api.openai.com/v1')
        self.api_key = os.getenv('OPENAI_API_KEY', '')
        self.model = os.getenv('OPENAI_MODEL', 'gpt-4.1-mini')

    def optimize(
        self,
        process: dict[str, Any],
        carbon: dict[str, Any],
        graph: dict[str, Any],
    ) -> dict[str, Any]:
        if not self.api_key:
            raise ValueError('OPENAI_API_KEY is not configured.')
        payload = self.request_payload(process, carbon, graph)
        request = urllib.request.Request(
            f'{self.base_url.rstrip("/")}/chat/completions',
            data=json.dumps(payload).encode('utf-8'),
            headers={'Authorization': f'Bearer {self.api_key}', 'Content-Type': 'application/json'},
            method='POST',
        )
        with urllib.request.urlopen(request, timeout=30) as response:
            data = json.loads(response.read().decode('utf-8'))
        content = data['choices'][0]['message']['content']
        result = json.loads(content)
        if not validate_optimization(result):
            raise ValueError('LLM response does not match optimizer schema.')
        return result

    def request_payload(
        self,
        process: dict[str, Any],
        carbon: dict[str, Any],
        graph: dict[str, Any],
    ) -> dict[str, Any]:
        return {
            'model': self.model,
            'response_format': {'type': 'json_object'},
            'messages': [
                {'role': 'system', 'content': 'Return only valid JSON.'},
                {'role': 'user', 'content': build_optimizer_prompt(process, carbon, graph)},
            ],
        }
