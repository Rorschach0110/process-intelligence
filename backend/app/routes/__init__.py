from __future__ import annotations

from fastapi import APIRouter

from app.routes import carbon, data, ops, planning, process_graph


router = APIRouter()
for module in (ops, data, carbon, planning, process_graph):
    router.include_router(module.router)
