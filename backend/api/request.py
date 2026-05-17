from __future__ import annotations

import json
from email.parser import BytesParser
from email.policy import default
from http.server import BaseHTTPRequestHandler
from typing import Any


def read_json(handler: BaseHTTPRequestHandler) -> dict[str, Any]:
    length = int(handler.headers.get('Content-Length', '0') or '0')
    if length == 0:
        return {}
    raw = handler.rfile.read(length).decode('utf-8')
    return json.loads(raw or '{}')


def read_multipart(handler: BaseHTTPRequestHandler) -> dict[str, Any]:
    length = int(handler.headers.get('Content-Length', '0') or '0')
    content_type = handler.headers.get('Content-Type', '')
    raw = handler.rfile.read(length)
    message = BytesParser(policy=default).parsebytes(
        b'Content-Type: ' + content_type.encode('utf-8') + b'\r\n\r\n' + raw
    )
    values: dict[str, Any] = {}
    for part in message.iter_parts():
        name = part.get_param('name', header='content-disposition')
        if not name:
            continue
        filename = part.get_filename()
        content = part.get_payload(decode=True) or b''
        values[name] = {'filename': filename, 'content': content} if filename else content.decode('utf-8')
    return values
